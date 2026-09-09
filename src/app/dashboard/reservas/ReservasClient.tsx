"use client";

import { useTransition, useState } from "react";
import { updateBookingStatus } from "@/lib/actions/bookings";

type Booking = {
  id: string;
  startsAt: string; // ISO string (UTC wall-clock)
  endsAt: string;
  status: string;
  service: { name: string };
  barber: { name: string };
  customer: { name: string; phone: string; email: string | null };
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Completado",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-800",
  CONFIRMED: "text-green-400 bg-green-400/10 border-green-800",
  CANCELLED: "text-red-400 bg-red-400/10 border-red-800",
  COMPLETED: "text-stone-400 bg-stone-400/10 border-stone-700",
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

const STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
type Status = (typeof STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<Status, Status[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

function BookingRow({ booking }: { booking: Booking }) {
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(booking.status);

  const handleStatus = (status: Status) => {
    startTransition(async () => {
      const result = await updateBookingStatus(booking.id, status);
      if (result.success) setCurrentStatus(status);
    });
  };

  return (
    <div className="flex flex-wrap items-start gap-4 p-4">
      {/* Date/time */}
      <div className="w-32 shrink-0">
        <p className="text-sm font-medium">{formatDate(booking.startsAt)}</p>
        <p className="text-xs text-stone-400">
          {formatTime(booking.startsAt)}–{formatTime(booking.endsAt)}
        </p>
      </div>

      {/* Customer */}
      <div className="min-w-[140px] flex-1">
        <p className="font-medium">{booking.customer.name}</p>
        <p className="text-xs text-stone-400">{booking.customer.phone}</p>
      </div>

      {/* Service / barber */}
      <div className="min-w-[140px] flex-1 text-sm text-stone-400">
        <p>{booking.service.name}</p>
        <p>{booking.barber.name}</p>
      </div>

      {/* Status badge */}
      <span
        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[currentStatus]}`}
      >
        {STATUS_LABEL[currentStatus]}
      </span>

      {/* Status buttons */}
      <div className="flex flex-wrap gap-1">
        {ALLOWED_TRANSITIONS[currentStatus as Status].map((s) => (
          <button
            key={s}
            onClick={() => handleStatus(s)}
            disabled={isPending}
            className="rounded border border-stone-700 px-2 py-1 text-xs text-stone-400 hover:border-stone-500 hover:text-stone-200 disabled:opacity-40"
          >
            → {STATUS_LABEL[s]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ReservasClient({ bookings }: { bookings: Booking[] }) {
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Reservas</h1>
        {/* Filter tabs */}
        <div className="flex gap-2">
          {["all", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filter === s
                  ? "border-amber-400 bg-amber-400/10 text-amber-400"
                  : "border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200"
              }`}
            >
              {s === "all" ? "Todas" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-stone-800 bg-stone-900">
        {filtered.length === 0 ? (
          <p className="p-6 text-sm text-stone-500">
            No hay reservas con este filtro.
          </p>
        ) : (
          <div className="divide-y divide-stone-800">
            {filtered.map((b) => (
              <BookingRow key={b.id} booking={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
