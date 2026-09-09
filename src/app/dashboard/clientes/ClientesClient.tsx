"use client";

import { useMemo, useState } from "react";

type Booking = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  service: {
    name: string;
  };
  barber: {
    name: string;
  };
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  bookings: Booking[];
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Completado",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-yellow-400",
  CONFIRMED: "text-green-400",
  CANCELLED: "text-red-400",
  COMPLETED: "text-stone-500",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatTime(iso: string) {
  const date = new Date(iso);

  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function CustomerCard({ customer }: { customer: Customer }) {
  const [open, setOpen] = useState(false);

  const completedBookings = customer.bookings.filter(
    (booking) => booking.status === "COMPLETED",
  ).length;

  const lastBooking = customer.bookings[0];

  return (
    <div className="border-b border-stone-800 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-5 text-left transition hover:bg-stone-800/40"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-stone-100">
              {customer.name}
            </p>

            <p className="mt-1 text-sm text-stone-400">
              {customer.phone}
            </p>

            {customer.email && (
              <p className="text-sm text-stone-500">
                {customer.email}
              </p>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="text-left sm:text-right">
              <p className="text-sm text-stone-300">
                {customer.bookings.length}{" "}
                {customer.bookings.length === 1 ? "turno" : "turnos"}
              </p>

              <p className="text-xs text-stone-500">
                {completedBookings} completados
              </p>
            </div>

            <span className="text-stone-500">
              {open ? "−" : "+"}
            </span>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-stone-800 bg-stone-950/40 px-5 pb-5">
          <div className="pt-5">
            <h3 className="mb-4 text-sm font-semibold text-stone-300">
              Historial de turnos
            </h3>

            {customer.bookings.length === 0 ? (
              <p className="text-sm text-stone-500">
                Este cliente todavía no tiene turnos.
              </p>
            ) : (
              <div className="space-y-3">
                {customer.bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-2 rounded-lg border border-stone-800 bg-stone-900 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {booking.service.name}
                      </p>

                      <p className="text-xs text-stone-500">
                        Con {booking.barber.name}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-sm text-stone-300">
                        {formatDate(booking.startsAt)}
                      </p>

                      <p className="text-xs text-stone-500">
                        {formatTime(booking.startsAt)}–
                        {formatTime(booking.endsAt)}
                      </p>

                      <p
                        className={`mt-1 text-xs font-medium ${
                          STATUS_COLOR[booking.status] ??
                          "text-stone-400"
                        }`}
                      >
                        {STATUS_LABEL[booking.status] ??
                          booking.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {lastBooking && (
            <p className="mt-4 text-xs text-stone-600">
              Último turno: {formatDate(lastBooking.startsAt)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ClientesClient({
  customers,
}: {
  customers: Customer[];
}) {
  const [search, setSearch] = useState("");

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query)
      );
    });
  }, [customers, search]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          Clientes
        </h1>

        <p className="mt-1 text-sm text-stone-500">
          Tus clientes y su historial de turnos.
        </p>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, teléfono o email..."
          className="w-full rounded-xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm text-stone-100 placeholder-stone-600 outline-none transition focus:border-amber-400"
        />
      </div>

      {/* List */}
      <div className="rounded-xl border border-stone-800 bg-stone-900">
        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-stone-500">
              {search
                ? "No se encontraron clientes."
                : "Todavía no tenés clientes."}
            </p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
            />
          ))
        )}
      </div>

      {filteredCustomers.length > 0 && (
        <p className="mt-3 text-xs text-stone-600">
          Mostrando {filteredCustomers.length}{" "}
          {filteredCustomers.length === 1
            ? "cliente"
            : "clientes"}
        </p>
      )}
    </div>
  );
}