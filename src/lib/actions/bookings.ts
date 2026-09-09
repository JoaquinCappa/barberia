"use server";

import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CreateBookingInput = {
  businessSlug: string;
  serviceId: string;
  barberId: string;
  /** ISO string of the slot start time */
  startsAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
};

export type BookingResult =
  | { success: true; bookingId: string }
  | { success: false; error: string };

type AdminActionResult = { success: true } | { success: false; error: string };

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function getAdminBusinessId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) throw new Error("No autenticado o sin negocio.");
  return session.user.businessId;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public: create booking (called by customers, no auth required)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a booking using a SERIALIZABLE transaction to prevent double-booking.
 *
 * The transaction will fail (throw) if two concurrent requests win the same
 * slot. PostgreSQL's serializable isolation detects the conflict and one of
 * the two transactions receives a serialization error, which we translate to a
 * user-friendly message.
 */
export async function createBooking(input: CreateBookingInput): Promise<BookingResult> {
  // 1. Resolve business
  const business = await prisma.business.findUnique({
    where: { slug: input.businessSlug },
    select: { id: true },
  });
  if (!business) return { success: false, error: "Negocio no encontrado." };

  // 2. Verify service belongs to this business and is active
  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, businessId: business.id, isActive: true },
    select: { durationMinutes: true },
  });
  if (!service) return { success: false, error: "Servicio no válido." };

  // 3. Verify barber belongs to this business and is active
  const barber = await prisma.barber.findFirst({
    where: { id: input.barberId, businessId: business.id, isActive: true },
    select: { id: true },
  });
  if (!barber) return { success: false, error: "Profesional no válido." };

 const startsAt = new Date(input.startsAt);
const endsAt = new Date(
  startsAt.getTime() + service.durationMinutes * 60_000,
);

// Validate that the date is valid
if (Number.isNaN(startsAt.getTime())) {
  return { success: false, error: "Horario inválido." };
}

// Validate the slot is in the future
const now = new Date();

const naiveNow = new Date(
  Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
  ),
);

if (startsAt <= naiveNow) {
  return {
    success: false,
    error: "No podés reservar un horario en el pasado.",
  };
}

// Validate business hours
const dayOfWeek = startsAt.getUTCDay();

const businessHours = await prisma.businessHours.findUnique({
  where: {
    businessId_dayOfWeek: {
      businessId: business.id,
      dayOfWeek,
    },
  },
});

if (!businessHours || businessHours.isClosed) {
  return {
    success: false,
    error: "El negocio está cerrado ese día.",
  };
}

const openMinutes =
  businessHours.opensAt.getUTCHours() * 60 +
  businessHours.opensAt.getUTCMinutes();

const closeMinutes =
  businessHours.closesAt.getUTCHours() * 60 +
  businessHours.closesAt.getUTCMinutes();

const startMinutes =
  startsAt.getUTCHours() * 60 +
  startsAt.getUTCMinutes();

const endMinutes =
  endsAt.getUTCHours() * 60 +
  endsAt.getUTCMinutes();

if (startMinutes < openMinutes || endMinutes > closeMinutes) {
  return {
    success: false,
    error: "El horario seleccionado no está dentro del horario de atención.",
  };
}

  // 4. Upsert customer outside the serializable tx to avoid serialization
  //    failures caused by the customer upsert itself (unrelated conflict).
  // 4. Resolve the logged-in customer, if there is one.
const session = await getServerSession(authOptions);
const userId = session?.user?.id ?? null;

// Find an existing customer belonging to this user at this business.
let customer = userId
  ? await prisma.customer.findFirst({
      where: {
        businessId: business.id,
        userId,
      },
    })
  : null;

// If the user doesn't have a customer profile yet,
// find it by phone or create it.
if (!customer) {
  customer = await prisma.customer.upsert({
    where: {
      businessId_phone: {
        businessId: business.id,
        phone: input.customerPhone,
      },
    },
    update: {
      name: input.customerName,
      email: input.customerEmail ?? null,
      ...(userId ? { userId } : {}),
    },
    create: {
      businessId: business.id,
      userId,
      name: input.customerName,
      phone: input.customerPhone,
      email: input.customerEmail ?? null,
    },
  });
} else {
  // Keep the customer profile updated.
  customer = await prisma.customer.update({
    where: { id: customer.id },
    data: {
      name: input.customerName,
      phone: input.customerPhone,
      email: input.customerEmail ?? null,
    },
  });
}

  // 5. Check overlap + create booking inside SERIALIZABLE transaction
  //    This is the core anti-double-booking mechanism.
  try {
    const booking = await prisma.$transaction(
      async (tx) => {
        const overlap = await tx.booking.findFirst({
          where: {
            barberId: input.barberId,
            status: { in: ["PENDING", "CONFIRMED"] },
            startsAt: { lt: endsAt },
            endsAt: { gt: startsAt },
          },
          select: { id: true },
        });

        if (overlap) {
          throw new Error("SLOT_TAKEN");
        }

        return tx.booking.create({
          data: {
            businessId: business.id,
            barberId: input.barberId,
            serviceId: input.serviceId,
            customerId: customer.id,
            startsAt,
            endsAt,
            status: "PENDING",
          },
          select: { id: true },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return { success: true, bookingId: booking.id };
  } catch (err) {
    if (err instanceof Error && err.message === "SLOT_TAKEN") {
      return {
        success: false,
        error: "Este horario ya no está disponible. Por favor seleccioná otro.",
      };
    }
    // Serialization failure or other DB error — safe to retry
    return {
      success: false,
      error: "No se pudo confirmar la reserva. Por favor intentá de nuevo.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin: update booking status
// ─────────────────────────────────────────────────────────────────────────────

export async function updateBookingStatus(
  bookingId: string,
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED",
): Promise<AdminActionResult> {
  try {
    const businessId = await getAdminBusinessId();

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        businessId,
      },
      select: {
        status: true,
      },
    });

    if (!booking) {
      return { success: false, error: "Reserva no encontrada." };
    }

    const allowedTransitions: Record<
      "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED",
      string[]
    > = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!allowedTransitions[booking.status].includes(status)) {
      return {
        success: false,
        error: "Ese cambio de estado no está permitido.",
      };
    }

    await prisma.booking.updateMany({
      where: {
        id: bookingId,
        businessId,
      },
      data: { status },
    });

    revalidatePath("/dashboard/reservas");

    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public: cancel booking by ID (customer facing — no auth required)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Public: cancel booking by customer
// ─────────────────────────────────────────────────────────────────────────────

export async function cancelBooking(
  bookingId: string,
): Promise<AdminActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Debés iniciar sesión.",
      };
    }

    // Buscar la reserva y comprobar que pertenece al usuario.
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        customer: {
          userId: session.user.id,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      select: {
        id: true,
        startsAt: true,
      },
    });

    if (!booking) {
      return {
        success: false,
        error: "Turno no encontrado o ya no se puede cancelar.",
      };
    }

    // No permitir cancelar turnos que ya comenzaron.
    if (booking.startsAt <= new Date()) {
      return {
        success: false,
        error: "No podés cancelar un turno que ya comenzó.",
      };
    }

    await prisma.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    revalidatePath("/cuenta");

    return {
      success: true,
    };
  } catch (e) {
    console.error("Error cancelando turno:", e);

    return {
      success: false,
      error: e instanceof Error ? e.message : "No se pudo cancelar el turno.",
    };
  }
}