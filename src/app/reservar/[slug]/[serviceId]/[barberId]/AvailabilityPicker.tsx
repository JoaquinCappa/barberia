"use client";

import { useEffect, useState } from "react";

type Props = {
  businessId: string;
  barberId: string;
  serviceId: string;
};

export default function AvailabilityPicker({
  businessId,
  barberId,
  serviceId,
}: Props) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();

    date.setDate(date.getDate() + index);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return {
      value: `${year}-${month}-${day}`,
      date,
    };
  });

  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      setSelectedSlot("");
      return;
    }

    async function loadSlots() {
      setLoading(true);
      setSelectedSlot("");

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
            data.error || "No se pudieron cargar los horarios",
          );
        }

        setSlots(data.slots ?? []);
      } catch (error) {
        console.error(error);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    }

    loadSlots();
  }, [selectedDate, businessId, barberId, serviceId]);

  return (
    <div className="mt-6 space-y-8">

      {/* Días */}
      <div className="-mx-1 overflow-x-auto pb-2 sm:mx-0 sm:overflow-visible">
        <div className="flex min-w-max gap-2 sm:grid sm:min-w-0 sm:grid-cols-4 sm:gap-3 md:grid-cols-7">
          {days.map(({ value, date }) => {
            const selected = selectedDate === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedDate(value)}
                className="flex h-[92px] w-[76px] shrink-0 flex-col justify-center rounded-2xl border text-center transition sm:h-auto sm:w-auto sm:min-h-[115px] sm:px-4 sm:py-4 sm:text-left"
                style={{
                  backgroundColor: selected
                    ? "var(--theme-primary)"
                    : "var(--theme-surface)",

                  borderColor: selected
                    ? "var(--theme-primary)"
                    : "color-mix(in srgb, var(--theme-text) 12%, transparent)",

                  color: selected
                    ? "var(--theme-background)"
                    : "var(--theme-text)",
                }}
              >
                <p className="text-[10px] font-medium uppercase tracking-wide opacity-60 sm:text-xs">
                  {date.toLocaleDateString("es-AR", {
                    weekday: "short",
                  })}
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {date.getDate()}
                </p>

                <p className="text-[10px] opacity-60 sm:text-xs">
                  {date.toLocaleDateString("es-AR", {
                    month: "short",
                  })}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendario */}
      {selectedDate && (
        <div>

          <button
            type="button"
            className="rounded-2xl border px-6 py-4 text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              backgroundColor: "var(--theme-surface)",
              borderColor:
                "color-mix(in srgb, var(--theme-text) 18%, transparent)",
              color: "var(--theme-text)",
            }}
          >
            <span className="mr-2">▣</span>
            Calendario
          </button>

          {/* Horarios */}
          <div className="mt-10">

            <p
              className="mb-4 text-sm font-semibold tracking-[0.2em]"
              style={{
                color: "var(--theme-primary)",
              }}
            >
              HORARIOS
            </p>

            <h3
              className="mb-6 text-2xl font-semibold"
              style={{
                color: "var(--theme-text)",
              }}
            >
              Elegí el horario
            </h3>

            {loading ? (
              <div
                className="rounded-2xl border p-6 text-center sm:p-8"
                style={{
                  backgroundColor: "var(--theme-surface)",
                  borderColor:
                    "color-mix(in srgb, var(--theme-text) 12%, transparent)",
                }}
              >
                <p
                  className="text-sm"
                  style={{
                    color:
                      "color-mix(in srgb, var(--theme-text) 55%, transparent)",
                  }}
                >
                  Buscando horarios disponibles...
                </p>
              </div>
            ) : slots.length === 0 ? (
              <div
                className="rounded-2xl border p-6 text-center sm:p-8"
                style={{
                  backgroundColor: "var(--theme-surface)",
                  borderColor:
                    "color-mix(in srgb, var(--theme-text) 12%, transparent)",
                }}
              >
                <p
                  className="text-sm"
                  style={{
                    color:
                      "color-mix(in srgb, var(--theme-text) 55%, transparent)",
                  }}
                >
                  No hay horarios disponibles para este día.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {slots.map((slot) => {
                  const time = slot.slice(11, 16);
                  const selected = selectedSlot === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className="rounded-xl border px-3 py-4 text-sm font-medium transition sm:px-4"
                      style={{
                        backgroundColor: selected
                          ? "var(--theme-primary)"
                          : "var(--theme-surface)",

                        borderColor: selected
                          ? "var(--theme-primary)"
                          : "color-mix(in srgb, var(--theme-text) 12%, transparent)",

                        color: selected
                          ? "var(--theme-background)"
                          : "var(--theme-text)",
                      }}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Horario seleccionado */}
            {selectedSlot && (
              <div
                className="mt-6 rounded-2xl border p-4"
                style={{
                  backgroundColor: "var(--theme-surface)",
                  borderColor:
                    "color-mix(in srgb, var(--theme-primary) 35%, transparent)",
                }}
              >
                <p
                  className="text-sm"
                  style={{
                    color:
                      "color-mix(in srgb, var(--theme-text) 60%, transparent)",
                  }}
                >
                  Horario seleccionado
                </p>

                <p
                  className="mt-1 text-lg font-semibold"
                  style={{
                    color: "var(--theme-primary)",
                  }}
                >
                  {selectedSlot.slice(11, 16)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}