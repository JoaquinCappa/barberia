"use client";

import { useState, useTransition } from "react";
import { saveBusinessHours, type DayConfig } from "@/lib/actions/hours";

const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

// Monday-first display order
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const inputCls =
  "rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-400 focus:outline-none";

type StoredHours = {
  dayOfWeek: number;
  isClosed: boolean;
  opensAt: string; // "HH:MM"
  closesAt: string; // "HH:MM"
};

export default function HorariosClient({ hours }: { hours: StoredHours[] }) {
  const hoursMap = Object.fromEntries(hours.map((h) => [h.dayOfWeek, h]));

  const defaultDay = (dow: number): DayConfig => ({
    dayOfWeek: dow,
    isClosed: hoursMap[dow]?.isClosed ?? false,
    opensAt: hoursMap[dow]?.opensAt ?? "09:00",
    closesAt: hoursMap[dow]?.closesAt ?? "18:00",
  });

  const [days, setDays] = useState<DayConfig[]>(
    DAY_ORDER.map((dow) => defaultDay(dow)),
  );
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const update = (dow: number, patch: Partial<DayConfig>) => {
    setDays((prev) =>
      prev.map((d) => (d.dayOfWeek === dow ? { ...d, ...patch } : d)),
    );
    setSaved(false);
  };

  const handleSave = () => {
    setError("");
    startTransition(async () => {
      const result = await saveBusinessHours(days);
      if (result.success) {
        setSaved(true);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Horarios de atención</h1>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-amber-300 disabled:opacity-50"
        >
          {isPending ? "Guardando…" : "Guardar horarios"}
        </button>
      </div>

      {saved && (
        <div className="mb-4 rounded-lg border border-green-800 bg-green-900/30 px-4 py-3 text-sm text-green-400">
          Horarios guardados correctamente.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-stone-800 bg-stone-900 divide-y divide-stone-800">
        {days.map((day) => (
          <div
            key={day.dayOfWeek}
            className="flex flex-wrap items-center gap-4 px-5 py-4"
          >
            {/* Day name */}
            <span className="w-28 text-sm font-medium text-stone-200">
              {DAY_NAMES[day.dayOfWeek]}
            </span>

            {/* Closed toggle */}
            <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-400">
              <input
                type="checkbox"
                checked={!day.isClosed}
                onChange={(e) =>
                  update(day.dayOfWeek, { isClosed: !e.target.checked })
                }
                className="h-4 w-4 accent-amber-400"
              />
              Abierto
            </label>

            {/* Time inputs */}
            {!day.isClosed && (
              <>
                <div className="flex items-center gap-2 text-sm text-stone-400">
                  <span>De</span>
                  <input
                    type="time"
                    className={inputCls}
                    value={day.opensAt}
                    onChange={(e) =>
                      update(day.dayOfWeek, { opensAt: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-400">
                  <span>a</span>
                  <input
                    type="time"
                    className={inputCls}
                    value={day.closesAt}
                    onChange={(e) =>
                      update(day.dayOfWeek, { closesAt: e.target.value })
                    }
                  />
                </div>
              </>
            )}

            {day.isClosed && (
              <span className="text-sm text-stone-600">Cerrado</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
