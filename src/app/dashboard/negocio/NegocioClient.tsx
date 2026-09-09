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
  coverImageUrl: string | null;
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
                Logo
              </label>

              {initialBusiness.logoUrl && (
                <div className="mb-3">
                  <img
                    src={initialBusiness.logoUrl}
                    alt="Logo actual"
                    className="h-24 w-24 rounded-xl border border-stone-700 object-cover"
                  />
                </div>
              )}

              <input
                type="file"
                name="logo"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="block w-full cursor-pointer rounded-lg border border-stone-700 bg-stone-800 text-sm text-stone-300 file:mr-4 file:border-0 file:bg-amber-400 file:px-4 file:py-2.5 file:font-semibold file:text-stone-950 hover:file:bg-amber-300"
              />

              <p className="mt-2 text-xs text-stone-500">
                PNG, JPG, WEBP o GIF.
              </p>
            </div>
            <div>
            <label className="mb-2 block text-sm text-stone-400">
              Imagen de presentación
            </label>

            {initialBusiness.coverImageUrl && (
              <div className="mb-3">
                <img
                  src={initialBusiness.coverImageUrl}
                  alt="Imagen de presentación actual"
                  className="h-40 w-full rounded-xl border border-stone-700 object-cover"
                />
              </div>
            )}

            <input
              type="file"
              name="cover"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="block w-full cursor-pointer rounded-lg border border-stone-700 bg-stone-800 text-sm text-stone-300 file:mr-4 file:border-0 file:bg-amber-400 file:px-4 file:py-2.5 file:font-semibold file:text-stone-950 hover:file:bg-amber-300"
            />

            <p className="mt-2 text-xs text-stone-500">
              Recomendado: imagen horizontal. PNG, JPG, WEBP o GIF. Máximo 5 MB.
            </p>
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