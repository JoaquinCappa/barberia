"use client";

import { useState, useTransition } from "react";
import {
  createBlockedTime,
  deleteBlockedTime,
} from "@/lib/actions/blockedTimes";

type Barber = {
  id: string;
  name: string;
};

type BlockedTime = {
  id: string;
  startsAt: string;
  endsAt: string;
  reason: string | null;
  barberName: string;
};

function formatDate(iso: string) {
  const date = new Date(iso);

  return date.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function formatTime(iso: string) {
  const date = new Date(iso);

  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export default function BloqueosClient({
  barbers,
  blockedTimes,
}: {
  barbers: Barber[];
  blockedTimes: BlockedTime[];
}) {
  const [isPending, startTransition] = useTransition();

  const [date, setDate] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [barberId, setBarberId] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(formData: FormData) {
    setError("");

    startTransition(async () => {
      const result = await createBlockedTime(null, formData);

      if (!result.success) {
        setError(result.error);
        return;
      }

      window.location.reload();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("¿Eliminar este bloqueo?")) return;

    startTransition(async () => {
      const result = await deleteBlockedTime(id);

      if (!result.success) {
        setError(result.error);
        return;
      }

      window.location.reload();
    });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Bloqueos</h1>
        <p className="mt-1 text-sm text-stone-400">
          Bloqueá horarios en los que no se podrán tomar reservas.
        </p>
      </div>

      {/* Crear bloqueo */}
      <div className="mb-8 rounded-xl border border-stone-800 bg-stone-900 p-5">
        <h2 className="mb-4 text-lg font-medium">
          Nuevo bloqueo
        </h2>

        <form action={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-stone-400">
                Fecha
              </label>

              <input
                name="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-stone-400">
                Profesional
              </label>

              <select
                name="barberId"
                value={barberId}
                onChange={(e) => setBarberId(e.target.value)}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm outline-none focus:border-amber-400"
              >
                <option value="">
                  Todo el negocio
                </option>

                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-stone-400">
                Desde
              </label>

              <input
                name="startsAt"
                type="time"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-stone-400">
                Hasta
              </label>

              <input
                name="endsAt"
                type="time"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                required
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm outline-none focus:border-amber-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-stone-400">
                Motivo
              </label>

              <input
                name="reason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Almuerzo, turno personal, vacaciones..."
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-5 rounded-lg bg-amber-400 px-5 py-2 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Bloquear horario"}
          </button>
        </form>
      </div>

      {/* Lista */}
      <div>
        <h2 className="mb-3 text-lg font-medium">
          Horarios bloqueados
        </h2>

        <div className="overflow-hidden rounded-xl border border-stone-800 bg-stone-900">
          {blockedTimes.length === 0 ? (
            <p className="p-6 text-sm text-stone-500">
              No hay horarios bloqueados.
            </p>
          ) : (
            <div className="divide-y divide-stone-800">
              {blockedTimes.map((block) => (
                <div
                  key={block.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-4"
                >
                  <div>
                    <p className="font-medium">
                      {formatDate(block.startsAt)}
                    </p>

                    <p className="text-sm text-stone-400">
                      {formatTime(block.startsAt)} –{" "}
                      {formatTime(block.endsAt)}
                    </p>

                    <p className="mt-1 text-xs text-stone-500">
                      {block.barberName}
                      {block.reason
                        ? ` · ${block.reason}`
                        : ""}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(block.id)}
                    disabled={isPending}
                    className="rounded-lg border border-red-900 px-3 py-1.5 text-xs text-red-400 hover:border-red-700 hover:text-red-300 disabled:opacity-40"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}