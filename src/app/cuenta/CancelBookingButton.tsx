"use client";

import { useState, useTransition } from "react";
import { cancelBooking } from "@/lib/actions/bookings";

type Props = {
  bookingId: string;
};

export default function CancelBookingButton({ bookingId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  function handleCancel() {
    setError("");

    startTransition(async () => {
      const result = await cancelBooking(bookingId);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setShowModal(false);
    });
  }

  return (
    <>
      <div className="mt-4 sm:text-right">
        <button
          type="button"
          onClick={() => {
            setError("");
            setShowModal(true);
          }}
          disabled={isPending}
          className="rounded-xl border border-red-900 bg-red-400/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar turno
        </button>

        {error && (
          <p className="mt-2 text-xs text-red-400">
            {error}
          </p>
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
          onClick={() => {
            if (!isPending) {
              setShowModal(false);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-xs font-semibold tracking-[0.2em] text-amber-400">
              CANCELAR TURNO
            </p>

            <h2 className="mt-3 text-xl font-semibold text-stone-100">
              ¿Querés cancelar este turno?
            </h2>

            <p className="mt-2 text-sm leading-6 text-stone-400">
              Esta acción cancelará tu reserva y el horario volverá a
              estar disponible para otros clientes.
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-900 bg-red-400/10 px-4 py-3">
                <p className="text-sm text-red-400">
                  {error}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="rounded-xl border border-stone-700 px-4 py-2.5 text-sm font-medium text-stone-300 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Volver
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Cancelando..." : "Sí, cancelar turno"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}