"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createService,
  deleteService,
  setServiceActive,
  updateService,
} from "@/lib/actions/services";

type Service = {
  id: string;
  name: string;
  description: string | null;
  priceInCents: number;
  durationMinutes: number;
  isActive: boolean;
};

const inputCls =
  "w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 outline-none transition focus:border-amber-400";

const labelCls =
  "mb-1.5 block text-xs font-medium text-stone-400";

const btnPrimary =
  "rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50";

const btnSecondary =
  "rounded-lg border border-stone-700 px-3 py-2 text-sm text-stone-300 transition hover:bg-stone-800 hover:text-stone-100";

const btnDanger =
  "rounded-lg border border-red-800 px-3 py-2 text-sm text-red-400 transition hover:bg-red-900/40";

const btnSuccess =
  "rounded-lg border border-emerald-800 px-3 py-2 text-sm text-emerald-400 transition hover:bg-emerald-900/30";

function formatPrice(cents: number) {
  return `$${(cents / 100).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function ServiceForm({
  onDone,
  initial,
}: {
  onDone: () => void;
  initial?: Service;
}) {
  const action = initial ? updateService : createService;

  const [state, formAction, pending] = useActionState(
    action,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      onDone();
    }
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      {initial && (
        <>
          <input
            type="hidden"
            name="id"
            value={initial.id}
          />

          <input
            type="hidden"
            name="isActive"
            value={String(initial.isActive)}
          />
        </>
      )}

      <div>
        <label className={labelCls}>
          Nombre *
        </label>

        <input
          className={inputCls}
          name="name"
          required
          defaultValue={initial?.name ?? ""}
          placeholder="Corte de pelo"
        />
      </div>

      <div>
        <label className={labelCls}>
          Descripción
        </label>

        <input
          className={inputCls}
          name="description"
          defaultValue={initial?.description ?? ""}
          placeholder="Opcional"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>
            Precio ($) *
          </label>

          <input
            className={inputCls}
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={
              initial
                ? (initial.priceInCents / 100).toFixed(2)
                : ""
            }
            placeholder="20000"
          />
        </div>

        <div>
          <label className={labelCls}>
            Duración (min) *
          </label>

          <input
            className={inputCls}
            name="duration"
            type="number"
            min="5"
            step="5"
            required
            defaultValue={
              initial?.durationMinutes ?? ""
            }
            placeholder="30"
          />
        </div>
      </div>

      {state && !state.success && (
        <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2">
          <p className="text-sm text-red-400">
            {state.error}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
        <button
          className={btnPrimary}
          type="submit"
          disabled={pending}
        >
          {pending
            ? "Guardando..."
            : initial
              ? "Actualizar servicio"
              : "Crear servicio"}
        </button>

        <button
          className={btnSecondary}
          type="button"
          onClick={onDone}
          disabled={pending}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function ServiciosClient({
  services,
}: {
  services: Service[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(
    null,
  );
  const [loadingId, setLoadingId] = useState<string | null>(
    null,
  );

  const handleDeactivate = async (id: string) => {
    const confirmed = confirm(
      "¿Querés desactivar este servicio?\n\nNo aparecerá para nuevos clientes, pero no se eliminará.",
    );

    if (!confirmed) return;

    setLoadingId(id);

    try {
      const result = await deleteService(id);

      if (!result.success) {
        alert(result.error);
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleActivate = async (id: string) => {
    setLoadingId(id);

    try {
      const result = await setServiceActive(
        id,
        true,
      );

      if (!result.success) {
        alert(result.error);
      }
    } finally {
      setLoadingId(null);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-100">
            Servicios
          </h1>

          <p className="mt-1 text-sm text-stone-500">
            Administrá los servicios que ofrecés.
          </p>
        </div>

        {!showForm && !editing && (
          <button
            className={btnPrimary}
            onClick={() => setShowForm(true)}
          >
            + Nuevo servicio
          </button>
        )}
      </div>

      {/* Nuevo servicio */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-stone-800 bg-stone-900 p-4 sm:p-5">
          <h2 className="mb-4 font-medium text-stone-100">
            Nuevo servicio
          </h2>

          <ServiceForm onDone={closeForm} />
        </div>
      )}

      {/* Lista */}
      <div className="overflow-hidden rounded-xl border border-stone-800 bg-stone-900">
        {services.length === 0 && !showForm ? (
          <div className="p-6">
            <p className="text-sm text-stone-500">
              No hay servicios aún. Creá el primero.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-800">
            {services.map((service) => (
              <div
                key={service.id}
                className="p-4 sm:p-5"
              >
                {editing?.id === service.id ? (
                  <ServiceForm
                    initial={service}
                    onDone={() => setEditing(null)}
                  />
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Información */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-stone-100">
                          {service.name}
                        </p>

                        <span
                          className={[
                            "rounded-full px-2 py-0.5 text-[11px] font-medium",
                            service.isActive
                              ? "bg-emerald-950/50 text-emerald-400"
                              : "bg-stone-800 text-stone-500",
                          ].join(" ")}
                        >
                          {service.isActive
                            ? "Activo"
                            : "Inactivo"}
                        </span>
                      </div>

                      {service.description && (
                        <p className="mt-1 text-sm text-stone-400">
                          {service.description}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                        <span className="font-medium text-amber-400">
                          {formatPrice(
                            service.priceInCents,
                          )}
                        </span>

                        <span className="text-stone-500">
                          {service.durationMinutes} min
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-2 sm:shrink-0">
                      <button
                        className={btnSecondary}
                        onClick={() =>
                          setEditing(service)
                        }
                      >
                        Editar
                      </button>

                      {service.isActive ? (
                        <button
                          className={btnDanger}
                          onClick={() =>
                            handleDeactivate(service.id)
                          }
                          disabled={
                            loadingId === service.id
                          }
                        >
                          {loadingId === service.id
                            ? "..."
                            : "Desactivar"}
                        </button>
                      ) : (
                        <button
                          className={btnSuccess}
                          onClick={() =>
                            handleActivate(service.id)
                          }
                          disabled={
                            loadingId === service.id
                          }
                        >
                          {loadingId === service.id
                            ? "..."
                            : "Activar"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}