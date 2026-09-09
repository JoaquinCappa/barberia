"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  businessId: string;
  barberId: string;
  serviceId: string;
  serviceName: string;
  priceInCents: number;
};

type Day = {
  date: string;
  dayName: string;
  dayNumber: number;
  month: string;
};

function getArgentinaToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
  };
}

function dateToString(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function stringToDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function generateDays(startDate: Date): Day[] {
  const days: Day[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    days.push({
      date: dateToString(date),

      dayName: new Intl.DateTimeFormat("es-AR", {
        weekday: "short",
      })
        .format(date)
        .replace(".", "")
        .toUpperCase(),

      dayNumber: date.getDate(),

      month: new Intl.DateTimeFormat("es-AR", {
        month: "short",
      })
        .format(date)
        .replace(".", "")
        .toLowerCase(),
    });
  }

  return days;
}

function formatTime(iso: string) {
  const date = new Date(iso);

  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export default function BookingSelector({
  businessId,
  barberId,
  serviceId,
  serviceName,
  priceInCents,
}: Props) {
  const router = useRouter();

  const argentinaToday = useMemo(() => {
    const today = getArgentinaToday();

    return new Date(today.year, today.month - 1, today.day);
  }, []);

  const [visibleStartDate, setVisibleStartDate] =
    useState(argentinaToday);

  const days = useMemo(
    () => generateDays(visibleStartDate),
    [visibleStartDate],
  );

  const [selectedDate, setSelectedDate] = useState(
    dateToString(argentinaToday),
  );

  const [calendarOpen, setCalendarOpen] = useState(false);

  const [calendarMonth, setCalendarMonth] = useState(
    new Date(
      argentinaToday.getFullYear(),
      argentinaToday.getMonth(),
      1,
    ),
  );

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // ============================================================
  // CARGAR HORARIOS
  // ============================================================

  useEffect(() => {
    async function loadSlots() {
      setLoading(true);
      setSelectedSlot(null);
      setError(null);

      try {
        const params = new URLSearchParams({
          businessId,
          barberId,
          serviceId,
          date: selectedDate,
        });

        const response = await fetch(
          `/api/disponibilidad?${params.toString()}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ?? "No se pudieron cargar los horarios.",
          );
        }

        setSlots(data.slots ?? []);
      } catch (error) {
        console.error(error);

        setSlots([]);

        setError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los horarios.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadSlots();
  }, [selectedDate, businessId, barberId, serviceId]);

  // ============================================================
  // SELECCIONAR FECHA
  // ============================================================

  function selectDate(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null);
  }

  // ============================================================
  // CALENDARIO
  // ============================================================

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);

    let firstDayIndex = firstDay.getDay();

    // Domingo = 0.
    // Queremos que la semana empiece en lunes.
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const daysInMonth = new Date(
      year,
      month + 1,
      0,
    ).getDate();

    const result: (Date | null)[] = [];

    for (let i = 0; i < firstDayIndex; i++) {
      result.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      result.push(new Date(year, month, day));
    }

    return result;
  }, [calendarMonth]);

  function previousMonth() {
    const previous = new Date(calendarMonth);

    previous.setMonth(calendarMonth.getMonth() - 1);

    const currentMonth = new Date(
      argentinaToday.getFullYear(),
      argentinaToday.getMonth(),
      1,
    );

    if (previous < currentMonth) {
      return;
    }

    setCalendarMonth(previous);
  }

  function nextMonth() {
    const next = new Date(calendarMonth);

    next.setMonth(calendarMonth.getMonth() + 1);

    setCalendarMonth(next);
  }

  function isPast(date: Date) {
    const today = new Date(
      argentinaToday.getFullYear(),
      argentinaToday.getMonth(),
      argentinaToday.getDate(),
    );

    const candidate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    return candidate < today;
  }

  // ============================================================
  // CONFIRMAR TURNO
  // ============================================================

  async function handleConfirm() {
    if (!selectedSlot || confirming) {
      return;
    }

    setConfirming(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          barberId,
          serviceId,
          startsAt: selectedSlot,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "No se pudo confirmar el turno.",
        );
      }

      setConfirmed(true);

      setTimeout(() => {
        router.push("/cuenta");
      }, 1200);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo confirmar el turno.",
      );
    } finally {
      setConfirming(false);
    }
  }

  // ============================================================
  // ESTILOS DEL TEMA
  // ============================================================

  const themePrimary = "var(--theme-primary)";
  const themeBackground = "var(--theme-background)";
  const themeSurface = "var(--theme-surface)";
  const themeText = "var(--theme-text)";

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section
      className="mt-12"
      style={
        {
          color: themeText,
        } as React.CSSProperties
      }
    >
      {/* FECHA */}

      <p
        className="text-sm font-semibold tracking-[0.2em]"
        style={{ color: themePrimary }}
      >
        FECHA
      </p>

      <h2 className="mt-2 text-2xl font-semibold">
        Elegí el día
      </h2>

      <p
        className="mt-2 text-sm"
        style={{
          color: `color-mix(in srgb, ${themeText} 55%, transparent)`,
        }}
      >
        Seleccioná cuándo querés reservar tu turno.
      </p>

      {/* CONTENEDOR */}

      <div
        className="relative mt-6 rounded-2xl border p-5 sm:p-8"
        style={{
          backgroundColor: themeSurface,
          borderColor: `color-mix(in srgb, ${themeText} 12%, transparent)`,
        }}
      >
        {/* ====================================================
            DÍAS
        ==================================================== */}

        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible lg:grid-cols-7">
              {days.map((day) => {
                const selected = selectedDate === day.date;

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => selectDate(day.date)}
                    className="min-w-[72px] shrink-0 rounded-xl border px-3 py-3 text-center transition sm:min-w-0 sm:rounded-2xl sm:p-4 sm:text-left"
                    style={{
                      backgroundColor: selected
                        ? themePrimary
                        : themeBackground,
                      borderColor: selected
                        ? themePrimary
                        : `color-mix(in srgb, ${themeText} 12%, transparent)`,
                      color: selected
                        ? themeBackground
                        : themeText,
                    }}
                  >
                    <p
                      className="text-xs font-medium uppercase"
                      style={{
                        opacity: selected ? 1 : 0.55,
                      }}
                    >
                      {day.dayName}
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {day.dayNumber}
                    </p>

                    <p
                      className="mt-1 text-xs"
                      style={{
                        opacity: selected ? 1 : 0.55,
                      }}
                    >
                      {day.month}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ====================================================
            BOTÓN CALENDARIO
        ==================================================== */}

        <button
          type="button"
          onClick={() =>
            setCalendarOpen((value) => !value)
          }
          className="mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition"
          style={{
            backgroundColor: calendarOpen
              ? themePrimary
              : themeBackground,
            borderColor: calendarOpen
              ? themePrimary
              : `color-mix(in srgb, ${themeText} 20%, transparent)`,
            color: calendarOpen
              ? themeBackground
              : themeText,
          }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect
              x="3"
              y="4"
              width="18"
              height="17"
              rx="2"
            />

            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>

          Calendario
        </button>

        {/* ====================================================
            CALENDARIO
        ==================================================== */}

        {calendarOpen && (
          <div
            className="mt-4 rounded-2xl border p-5"
            style={{
              backgroundColor: themeBackground,
              borderColor: `color-mix(in srgb, ${themeText} 12%, transparent)`,
            }}
          >
            {/* CABECERA */}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={previousMonth}
                className="h-9 w-9 rounded-lg transition"
                style={{
                  color: themeText,
                }}
              >
                ←
              </button>

              <p className="text-sm font-semibold capitalize">
                {new Intl.DateTimeFormat("es-AR", {
                  month: "long",
                  year: "numeric",
                }).format(calendarMonth)}
              </p>

              <button
                type="button"
                onClick={nextMonth}
                className="h-9 w-9 rounded-lg transition"
                style={{
                  color: themeText,
                }}
              >
                →
              </button>
            </div>

            {/* DÍAS DE LA SEMANA */}

            <div className="mt-5 grid grid-cols-7 gap-1 text-center">
              {[
                "LU",
                "MA",
                "MI",
                "JU",
                "VI",
                "SA",
                "DO",
              ].map((day) => (
                <p
                  key={day}
                  className="py-1 text-[10px] font-semibold"
                  style={{
                    opacity: 0.45,
                  }}
                >
                  {day}
                </p>
              ))}
            </div>

            {/* DÍAS */}

            <div className="mt-1 grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="h-9"
                    />
                  );
                }

                const value = dateToString(date);
                const selected = value === selectedDate;
                const past = isPast(date);

                return (
                  <button
                    key={value}
                    type="button"
                    disabled={past}
                    onClick={() => {
                      selectDate(value);
                      setCalendarOpen(false);
                    }}
                    className="flex h-9 items-center justify-center rounded-lg text-xs transition"
                    style={{
                      backgroundColor: selected
                        ? themePrimary
                        : "transparent",
                      color: past
                        ? `color-mix(in srgb, ${themeText} 25%, transparent)`
                        : selected
                          ? themeBackground
                          : themeText,
                      cursor: past
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div
              className="mt-4 border-t pt-4"
              style={{
                borderColor: `color-mix(in srgb, ${themeText} 10%, transparent)`,
              }}
            >
              <p
                className="text-xs"
                style={{
                  opacity: 0.45,
                }}
              >
                Seleccioná una fecha para verla entre
                los próximos días.
              </p>
            </div>
          </div>
        )}

        {/* ====================================================
            HORARIOS
        ==================================================== */}

        <div className="mt-10">
          <p
            className="text-sm font-semibold tracking-[0.2em]"
            style={{ color: themePrimary }}
          >
            HORARIOS
          </p>

          <h3 className="mt-2 text-2xl font-semibold">
            Elegí el horario
          </h3>

          {loading ? (
            <div
              className="mt-5 rounded-2xl border p-6 text-center"
              style={{
                backgroundColor: themeBackground,
                borderColor: `color-mix(in srgb, ${themeText} 12%, transparent)`,
              }}
            >
              <p
                className="text-sm"
                style={{ opacity: 0.55 }}
              >
                Buscando horarios disponibles...
              </p>
            </div>
          ) : slots.length === 0 ? (
            <div
              className="mt-5 rounded-2xl border p-6 text-center"
              style={{
                backgroundColor: themeBackground,
                borderColor: `color-mix(in srgb, ${themeText} 12%, transparent)`,
              }}
            >
              <p
                className="text-sm"
                style={{ opacity: 0.55 }}
              >
                No hay horarios disponibles para este día.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {slots.map((slot) => {
                const selected = selectedSlot === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className="rounded-xl border px-4 py-4 text-sm font-medium transition"
                    style={{
                      backgroundColor: selected
                        ? themePrimary
                        : themeBackground,
                      borderColor: selected
                        ? themePrimary
                        : `color-mix(in srgb, ${themeText} 12%, transparent)`,
                      color: selected
                        ? themeBackground
                        : themeText,
                    }}
                  >
                    {formatTime(slot)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            className="mt-5 rounded-xl border p-4 text-sm"
            style={{
              borderColor: "#ef4444",
              color: "#ef4444",
            }}
          >
            {error}
          </div>
        )}

        {/* ====================================================
            CONFIRMAR
        ==================================================== */}

        {selectedSlot && !confirmed && (
          <div className="mt-8">
            <div
              className="mb-4 rounded-xl border p-4"
              style={{
                backgroundColor: themeBackground,
                borderColor: `color-mix(in srgb, ${themeText} 12%, transparent)`,
              }}
            >
              <p
                className="text-xs uppercase tracking-wider"
                style={{ opacity: 0.45 }}
              >
                Tu turno
              </p>

              <p className="mt-1 font-semibold">
                {serviceName}
              </p>

              <p
                className="mt-1 text-sm"
                style={{ opacity: 0.6 }}
              >
                {stringToDate(selectedDate).toLocaleDateString(
                  "es-AR",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  },
                )}{" "}
                · {formatTime(selectedSlot)}
              </p>

              <p
                className="mt-2 font-medium"
                style={{ color: themePrimary }}
              >
                ${(priceInCents / 100).toLocaleString("es-AR")}
              </p>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full rounded-xl px-5 py-4 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: themePrimary,
                color: themeBackground,
              }}
            >
              {confirming
                ? "Confirmando..."
                : "Confirmar turno"}
            </button>
          </div>
        )}

        {/* ====================================================
            CONFIRMADO
        ==================================================== */}

        {confirmed && (
          <div
            className="mt-8 rounded-2xl border p-6 text-center"
            style={{
              backgroundColor: themePrimary,
              borderColor: themePrimary,
              color: themeBackground,
            }}
          >
            <p className="text-lg font-semibold">
              Turno confirmado
            </p>

            <p className="mt-1 text-sm opacity-80">
              Redirigiendo a tu cuenta...
            </p>
          </div>
        )}
      </div>
    </section>
  );
}