import { prisma } from "@/lib/prisma";

/**
 * Extrae HH:MM de un DateTime Prisma @db.Time.
 * Los horarios del negocio representan hora local.
 */
function getUTCTime(d: Date): { h: number; m: number } {
  return {
    h: d.getUTCHours(),
    m: d.getUTCMinutes(),
  };
}

/**
 * Obtiene la fecha y hora actual de Argentina.
 *
 * Devuelve los componentes como "wall clock":
 * 2026-09-08 22:42
 */
function getArgentinaNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

export async function getAvailableSlots(
  businessId: string,
  barberId: string,
  serviceId: string,
  date: string,
): Promise<string[]> {
  // ── 1. Servicio ────────────────────────────────────────────────────────────

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      businessId,
      isActive: true,
    },
    select: {
      durationMinutes: true,
    },
  });

  if (!service) return [];

  // ── 2. Fecha solicitada ───────────────────────────────────────────────────

  const [year, month, day] = date.split("-").map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return [];
  }

  // ── 3. Fecha/hora actual en Argentina ─────────────────────────────────────

  const now = getArgentinaNow();

  console.log("ARGENTINA NOW:", now);
console.log("REQUESTED DATE:", date);

  const requestedDateMs = Date.UTC(year, month - 1, day);
  const todayDateMs = Date.UTC(
    now.year,
    now.month - 1,
    now.day,
  );

  // Nunca permitir reservar días anteriores a hoy.
  if (requestedDateMs < todayDateMs) {
    return [];
  }

  // ── 4. Día de la semana ───────────────────────────────────────────────────

  const dayOfWeek = new Date(requestedDateMs).getUTCDay();

  // ── 5. Horarios del negocio ───────────────────────────────────────────────

  const businessHours = await prisma.businessHours.findUnique({
    where: {
      businessId_dayOfWeek: {
        businessId,
        dayOfWeek,
      },
    },
  });

  if (!businessHours || businessHours.isClosed) {
    return [];
  }

console.log("========== BUSINESS HOURS ==========");
console.log({
  dayOfWeek,
  isClosed: businessHours.isClosed,
  opensAt: businessHours.opensAt,
  opensAtISO: businessHours.opensAt.toISOString(),
  closesAt: businessHours.closesAt,
  closesAtISO: businessHours.closesAt.toISOString(),
});
console.log("====================================");

const { h: openH, m: openM } = getUTCTime(businessHours.opensAt);
const { h: closeH, m: closeM } = getUTCTime(businessHours.closesAt);

  // ── 6. Generar slots ──────────────────────────────────────────────────────

  const durationMs = service.durationMinutes * 60_000;

  const dayStartMs = Date.UTC(
    year,
    month - 1,
    day,
    openH,
    openM,
  );

  const dayEndMs = Date.UTC(
    year,
    month - 1,
    day,
    closeH,
    closeM,
  );

  const slots: Array<{ s: number; e: number }> = [];

  for (
    let t = dayStartMs;
    t + durationMs <= dayEndMs;
    t += durationMs
  ) {
    slots.push({
      s: t,
      e: t + durationMs,
    });
  }

  if (slots.length === 0) {
    return [];
  }

  // ── 7. Conflictos existentes ──────────────────────────────────────────────

  const rangeStart = new Date(dayStartMs);
  const rangeEnd = new Date(dayEndMs);

  const [bookings, blocks] = await Promise.all([
    prisma.booking.findMany({
      where: {
        barberId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        startsAt: {
          lt: rangeEnd,
        },
        endsAt: {
          gt: rangeStart,
        },
      },
      select: {
        startsAt: true,
        endsAt: true,
      },
    }),

    prisma.blockedTime.findMany({
      where: {
        businessId,
        OR: [
          { barberId },
          { barberId: null },
        ],
        startsAt: {
          lt: rangeEnd,
        },
        endsAt: {
          gt: rangeStart,
        },
      },
      select: {
        startsAt: true,
        endsAt: true,
      },
    }),
  ]);

  console.log("========== BLOQUEOS ==========");
console.log(
  blocks.map((block) => ({
    startsAt: block.startsAt,
    startsAtISO: block.startsAt.toISOString(),
    endsAt: block.endsAt,
    endsAtISO: block.endsAt.toISOString(),
  })),
);
console.log("RANGO BUSCADO:", {
  rangeStart: rangeStart.toISOString(),
  rangeEnd: rangeEnd.toISOString(),
});
console.log("BARBER ID:", barberId);
console.log("BUSINESS ID:", businessId);
console.log("==============================");

  const conflicts = [
    ...bookings.map((booking) => ({
      s: booking.startsAt.getTime(),
      e: booking.endsAt.getTime(),
    })),

    ...blocks.map((block) => ({
      s: block.startsAt.getTime(),
      e: block.endsAt.getTime(),
    })),
  ];

  // ── 8. Hora actual para el día seleccionado ───────────────────────────────

  let currentTimeMs = 0;

  console.log("========== DISPONIBILIDAD ==========");
console.log("ARGENTINA NOW:", now);
console.log("REQUESTED DATE:", date);
console.log("requestedDateMs:", requestedDateMs);
console.log("todayDateMs:", todayDateMs);
console.log(
  "ES HOY:",
  requestedDateMs === todayDateMs
);

  if (requestedDateMs === todayDateMs) {
    currentTimeMs = Date.UTC(
      now.year,
      now.month - 1,
      now.day,
      now.hour,
      now.minute,
      now.second,
    );
  }
  console.log(
  "SLOTS ANTES DEL FILTRO:",
  slots.map((slot) => ({
    start: new Date(slot.s).toISOString(),
    end: new Date(slot.e).toISOString(),
  }))
);

console.log(
  "CURRENT TIME:",
  new Date(currentTimeMs).toISOString()
);

  // ── 9. Filtrar ─────────────────────────────────────────────────────────────

  const availableSlots = slots
  .filter((slot) => {
    if (requestedDateMs === todayDateMs) {
      return slot.s > currentTimeMs;
    }

    return true;
  })
  .filter((slot) => {
    return !conflicts.some(
      (conflict) =>
        slot.s < conflict.e &&
        slot.e > conflict.s,
    );
  });

console.log(
  "SLOTS FINALES:",
  availableSlots.map((slot) =>
    new Date(slot.s).toISOString()
  )
);

console.log("===================================");

return availableSlots.map((slot) =>
  new Date(slot.s).toISOString()
);
}