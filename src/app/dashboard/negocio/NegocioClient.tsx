"use client";

import { useActionState } from "react";
import { updateBusiness } from "@/lib/actions/business";

type Business = {
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  logoUrl: string | null;
};

const inputClass =
  "h-10 w-full rounded-lg border border-stone-700 bg-stone-800 px-3 text-sm text-stone-100 focus:border-amber-400 focus:outline-none";

export default function NegocioClient({
  initialBusiness,
}: {
  initialBusiness: Business;
}) {
  const [state, formAction, pending] = useActionState(
    updateBusiness,
    null,
  );

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <p className="text-sm font-semibold tracking-[0.2em] text-amber-400">
          NEGOCIO
        </p>

        <h1 className="mt-2 text-2xl font-semibold">
          Datos de tu barbería
        </h1>

        <p className="mt-2 text-sm text-stone-500">
          Actualizá la información que aparece en tu página pública.
        </p>
      </div>

      <form action={formAction}>
        <div className="rounded-xl border border-stone-800 bg-stone-900 p-6">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-stone-400">
                Nombre
              </label>

              <input
                type="text"
                name="name"
                required
                defaultValue={initialBusiness.name}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-stone-400">
                Descripción
              </label>

              <textarea
                name="description"
                rows={4}
                defaultValue={initialBusiness.description ?? ""}
                className="w-full resize-none rounded-lg border border-stone-700 bg-stone-800 px-3 py-3 text-sm text-stone-100 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-stone-400">
                Teléfono
              </label>

              <input
                type="tel"
                name="phone"
                defaultValue={initialBusiness.phone ?? ""}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-stone-400">
                Email
              </label>

              <input
                type="email"
                name="email"
                defaultValue={initialBusiness.email ?? ""}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-stone-400">
                Dirección
              </label>

              <input
                type="text"
                name="address"
                defaultValue={initialBusiness.address ?? ""}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-stone-400">
                URL del logo
              </label>

              <input
                type="url"
                name="logoUrl"
                defaultValue={initialBusiness.logoUrl ?? ""}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {state && !state.success && (
          <p className="mt-4 text-sm text-red-400">
            {state.error}
          </p>
        )}

        {state?.success && (
          <p className="mt-4 text-sm text-green-400">
            Cambios guardados correctamente.
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-300 disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}