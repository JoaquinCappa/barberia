import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/availability";

export async function POST(request: NextRequest) {
  try {
    // ────────────────────────────────────────────────────────────────────────
    // 1. AUTENTICACIÓN
    // ────────────────────────────────────────────────────────────────────────

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        { error: "Debés iniciar sesión para reservar." },
        { status: 401 },
      );
    }

    // ────────────────────────────────────────────────────────────────────────
    // 2. DATOS DE LA RESERVA
    // ────────────────────────────────────────────────────────────────────────

    const body = await request.json();

    const {
      businessId,
      barberId,
      serviceId,
      startsAt,
    } = body;

    if (!businessId || !barberId || !serviceId || !startsAt) {
      return Response.json(
        { error: "Faltan datos para crear la reserva." },
        { status: 400 },
      );
    }

    const start = new Date(startsAt);

    if (Number.isNaN(start.getTime())) {
      return Response.json(
        { error: "La fecha del turno no es válida." },
        { status: 400 },
      );
    }

    // ────────────────────────────────────────────────────────────────────────
    // 3. SERVICIO
    // ────────────────────────────────────────────────────────────────────────

    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        businessId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        durationMinutes: true,
        priceInCents: true,
      },
    });

    if (!service) {
      return Response.json(
        { error: "El servicio no existe o no está disponible." },
        { status: 404 },
      );
    }

    // ────────────────────────────────────────────────────────────────────────
    // 4. BARBERO
    // ────────────────────────────────────────────────────────────────────────

    const barber = await prisma.barber.findFirst({
      where: {
        id: barberId,
        businessId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!barber) {
      return Response.json(
        { error: "El barbero no existe o no está disponible." },
        { status: 404 },
      );
    }

    // ────────────────────────────────────────────────────────────────────────
    // 5. VERIFICAR DISPONIBILIDAD REAL
    // ────────────────────────────────────────────────────────────────────────

    // Los slots del MVP se manejan como "wall clock" de Argentina.
    // Por eso la fecha se obtiene directamente del ISO generado
    // por availability.ts.

    const date = start.toISOString().split("T")[0];

    const availableSlots = await getAvailableSlots(
      businessId,
      barberId,
      serviceId,
      date,
    );

    const requestedSlot = start.toISOString();

    const slotStillAvailable = availableSlots.some(
      (slot) => slot === requestedSlot,
    );

    if (!slotStillAvailable) {
      return Response.json(
        { error: "Ese horario ya no está disponible." },
        { status: 409 },
      );
    }

    // ────────────────────────────────────────────────────────────────────────
    // 6. CALCULAR FINAL DEL TURNO
    // ────────────────────────────────────────────────────────────────────────

    const end = new Date(
      start.getTime() +
        service.durationMinutes * 60 * 1000,
    );

    // ────────────────────────────────────────────────────────────────────────
    // 7. CLIENTE
    // ────────────────────────────────────────────────────────────────────────

    let customer = await prisma.customer.findFirst({
      where: {
        userId: session.user.id,
        businessId,
      },
    });

    if (!customer) {
      const user = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          name: true,
          email: true,
          phone: true,
        },
      });

      if (!user) {
        return Response.json(
          { error: "No se encontró el usuario." },
          { status: 404 },
        );
      }

      if (!user.phone) {
        return Response.json(
          {
            error:
              "Necesitás tener un teléfono cargado en tu cuenta para reservar.",
          },
          { status: 400 },
        );
      }

      customer = await prisma.customer.create({
        data: {
          businessId,
          userId: session.user.id,
          name: user.name ?? "Cliente",
          phone: user.phone,
          email: user.email,
        },
      });
    }

    // ────────────────────────────────────────────────────────────────────────
    // 8. ÚLTIMA COMPROBACIÓN DE CONFLICTO
    // ────────────────────────────────────────────────────────────────────────

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        barberId,

        status: {
          in: ["PENDING", "CONFIRMED"],
        },

        startsAt: {
          lt: end,
        },

        endsAt: {
          gt: start,
        },
      },
    });

    if (conflictingBooking) {
      return Response.json(
        {
          error:
            "Ese horario acaba de ser reservado por otra persona.",
        },
        { status: 409 },
      );
    }

    // ────────────────────────────────────────────────────────────────────────
    // 9. CREAR RESERVA
    // ────────────────────────────────────────────────────────────────────────

    const booking = await prisma.booking.create({
      data: {
        businessId,
        barberId,
        serviceId,
        customerId: customer.id,
        startsAt: start,
        endsAt: end,
        status: "PENDING",
      },
    });

    // ────────────────────────────────────────────────────────────────────────
    // 10. RESPUESTA
    // ────────────────────────────────────────────────────────────────────────

    return Response.json({
      success: true,

      booking: {
        id: booking.id,
        startsAt: booking.startsAt,
        endsAt: booking.endsAt,
      },
    });
  } catch (error) {
    console.error("Error creando reserva:", error);

    return Response.json(
      { error: "No se pudo crear el turno." },
      { status: 500 },
    );
  }
}