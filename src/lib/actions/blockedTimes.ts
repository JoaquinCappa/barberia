"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

async function getBusinessId(): Promise<string> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.businessId) {
    throw new Error("No autenticado o sin negocio.");
  }

  return session.user.businessId;
}

export async function createBlockedTime(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const businessId = await getBusinessId();

    const date = String(formData.get("date") || "");
    const startsAt = String(formData.get("startsAt") || "");
    const endsAt = String(formData.get("endsAt") || "");
    const reason = String(formData.get("reason") || "").trim();
    const barberId = String(formData.get("barberId") || "");

    if (!date || !startsAt || !endsAt) {
      return {
        success: false,
        error: "Completá fecha y horarios.",
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Validar formato
    // ─────────────────────────────────────────────────────────────

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !/^\d{2}:\d{2}$/.test(startsAt) ||
      !/^\d{2}:\d{2}$/.test(endsAt)
    ) {
      return {
        success: false,
        error: "Fecha u horario inválido.",
      };
    }

    const [year, month, day] = date.split("-").map(Number);
    const [startHour, startMinute] = startsAt.split(":").map(Number);
    const [endHour, endMinute] = endsAt.split(":").map(Number);

    if (
      startHour > 23 ||
      endHour > 23 ||
      startMinute > 59 ||
      endMinute > 59
    ) {
      return {
        success: false,
        error: "Horario inválido.",
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Crear fechas como "naive UTC"
    // ─────────────────────────────────────────────────────────────

    const start = new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        startHour,
        startMinute,
        0,
      ),
    );

    const end = new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        endHour,
        endMinute,
        0,
      ),
    );

    // ─────────────────────────────────────────────────────────────
    // Validar que Hasta sea después de Desde
    // ─────────────────────────────────────────────────────────────

    if (end <= start) {
      return {
        success: false,
        error: "La hora de finalización debe ser posterior.",
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Verificar que el horario no esté en el pasado
    // ─────────────────────────────────────────────────────────────

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

    if (start <= naiveNow) {
      return {
        success: false,
        error: "No podés bloquear un horario que ya pasó.",
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Verificar horario de atención del negocio
    // ─────────────────────────────────────────────────────────────

    const dayOfWeek = new Date(
      Date.UTC(year, month - 1, day),
    ).getUTCDay();

    const businessHours = await prisma.businessHours.findUnique({
      where: {
        businessId_dayOfWeek: {
          businessId,
          dayOfWeek,
        },
      },
    });

    if (!businessHours || businessHours.isClosed) {
      return {
        success: false,
        error: "La barbería está cerrada ese día.",
      };
    }

    const openHour = businessHours.opensAt.getUTCHours();
    const openMinute = businessHours.opensAt.getUTCMinutes();

    const closeHour = businessHours.closesAt.getUTCHours();
    const closeMinute = businessHours.closesAt.getUTCMinutes();

    const openingTime =
      openHour * 60 + openMinute;

    const closingTime =
      closeHour * 60 + closeMinute;

    const startTime =
      startHour * 60 + startMinute;

    const endTime =
      endHour * 60 + endMinute;

    if (startTime < openingTime) {
      return {
        success: false,
        error: `La barbería abre a las ${String(openHour).padStart(2, "0")}:${String(openMinute).padStart(2, "0")}.`,
      };
    }

    if (endTime > closingTime) {
      return {
        success: false,
        error: `La barbería cierra a las ${String(closeHour).padStart(2, "0")}:${String(closeMinute).padStart(2, "0")}.`,
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Verificar profesional
    // ─────────────────────────────────────────────────────────────

    if (barberId) {
      const barber = await prisma.barber.findFirst({
        where: {
          id: barberId,
          businessId,
          isActive: true,
        },
      });

      if (!barber) {
        return {
          success: false,
          error: "Profesional no válido.",
        };
      }
    }

    // ─────────────────────────────────────────────────────────────
    // Verificar reservas existentes dentro del bloqueo
    // ─────────────────────────────────────────────────────────────

    const conflictingBookings =
      await prisma.booking.findMany({
        where: {
          businessId,

          // Solo nos preocupan reservas activas.
          status: {
            in: ["PENDING", "CONFIRMED"],
          },

          // Si se seleccionó un profesional,
          // solamente comprobamos sus reservas.
          //
          // Si barberId está vacío, el bloqueo es general
          // y comprobamos las reservas de todos los profesionales.
          ...(barberId
            ? {
                barberId,
              }
            : {}),

          // Hay conflicto cuando los intervalos de tiempo
          // se superponen.
          startsAt: {
            lt: end,
          },

          endsAt: {
            gt: start,
          },
        },

        select: {
          id: true,
          startsAt: true,
          endsAt: true,
          customer: {
            select: {
              name: true,
            },
          },
          service: {
            select: {
              name: true,
            },
          },
        },

        orderBy: {
          startsAt: "asc",
        },
      });

    if (conflictingBookings.length > 0) {
      const cantidad = conflictingBookings.length;

      return {
        success: false,
        error:
          cantidad === 1
            ? "No podés crear este bloqueo porque hay un turno reservado dentro de ese horario. Cancelalo o gestioná ese turno primero."
            : `No podés crear este bloqueo porque hay ${cantidad} turnos reservados dentro de ese horario. Cancelalos o gestionálos primero.`,
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Crear bloqueo
    // ─────────────────────────────────────────────────────────────

    await prisma.blockedTime.create({
      data: {
        businessId,
        barberId: barberId || null,
        startsAt: start,
        endsAt: end,
        reason: reason || null,
      },
    });

    revalidatePath("/dashboard/bloqueos");

    return {
      success: true,
    };
  } catch (e) {
    return {
      success: false,
      error:
        e instanceof Error
          ? e.message
          : "Error.",
    };
  }
}

export async function deleteBlockedTime(
  id: string,
): Promise<ActionResult> {
  try {
    const businessId = await getBusinessId();

    await prisma.blockedTime.deleteMany({
      where: {
        id,
        businessId,
      },
    });

    revalidatePath("/dashboard/bloqueos");

    return {
      success: true,
    };
  } catch (e) {
    return {
      success: false,
      error:
        e instanceof Error
          ? e.message
          : "Error.",
    };
  }
}