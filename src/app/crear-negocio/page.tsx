"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { registerBusiness } from "@/lib/actions/business-auth";

const initialState = null;

export default function CrearNegocioPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";

  const [state, formAction, pending] = useActionState(
    registerBusiness,
    initialState,
  );

  return (
    <main className="min-h-screen bg-stone-950 px-5 py-10 text-stone-100 sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-2xl">

        {/* ENCABEZADO */}
        <div className="mb-10">
          <p className="text-sm font-semibold tracking-[0.2em] text-amber-400">
            AGENDA
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Creá tu negocio
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-500">
            Configurá tu cuenta para empezar a recibir reservas de tus
            clientes.
          </p>
        </div>

        {/* ERROR */}
        {state?.success === false && (
          <div className="mb-6 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3">
            <p className="text-sm text-red-300">
              {state.error}
            </p>
          </div>
        )}

        {/* ÉXITO */}
        {state?.success === true && (
          <div className="rounded-2xl border border-emerald-900 bg-emerald-950/40 p-6">
            <p className="text-sm font-semibold text-emerald-400">
              NEGOCIO CREADO
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Tu cuenta fue creada correctamente.
            </h2>

            <p className="mt-2 text-sm text-stone-400">
              Ya podés iniciar sesión y configurar tu negocio.
            </p>

            <a
              href="/login"
              className="mt-6 inline-flex rounded-xl bg-amber-400 px-5 py-3 font-semibold text-stone-950 transition hover:bg-amber-300"
            >
              Iniciar sesión
            </a>
          </div>
        )}

        {/* FORMULARIO */}
        {!state?.success && (
          <form action={formAction} className="space-y-10">

            {/* CÓDIGO */}
            <input
              type="hidden"
              name="code"
              value={code}
            />

            {/* NEGOCIO */}
            <section>
              <p className="text-sm font-semibold tracking-[0.2em] text-amber-400">
                NEGOCIO
              </p>

              <div className="mt-5 space-y-5">

                <div>
                  <label
                    htmlFor="businessName"
                    className="text-sm text-stone-300"
                  >
                    Nombre del negocio
                  </label>

                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    placeholder="La Barbe"
                    className="mt-2 w-full rounded-xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none transition placeholder:text-stone-600 focus:border-amber-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="slug"
                    className="text-sm text-stone-300"
                  >
                    Identificador del negocio
                  </label>

                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    required
                    placeholder="la-barbe"
                    className="mt-2 w-full rounded-xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none transition placeholder:text-stone-600 focus:border-amber-400"
                  />

                  <p className="mt-2 text-xs text-stone-600">
                    Se utilizará para generar el enlace de reservas.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="text-sm text-stone-300"
                  >
                    Dirección
                  </label>

                  <input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Av. San Martín 1234"
                    className="mt-2 w-full rounded-xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none transition placeholder:text-stone-600 focus:border-amber-400"
                  />
                </div>
              </div>
            </section>

            {/* ADMINISTRADOR */}
            <section>
              <p className="text-sm font-semibold tracking-[0.2em] text-amber-400">
                TUS DATOS
              </p>

              <div className="mt-5 space-y-5">

                <div>
                  <label
                    htmlFor="ownerName"
                    className="text-sm text-stone-300"
                  >
                    Nombre
                  </label>

                  <input
                    id="ownerName"
                    name="ownerName"
                    type="text"
                    required
                    placeholder="Juan Pérez"
                    className="mt-2 w-full rounded-xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none transition placeholder:text-stone-600 focus:border-amber-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="text-sm text-stone-300"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="juan@gmail.com"
                    className="mt-2 w-full rounded-xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none transition placeholder:text-stone-600 focus:border-amber-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="text-sm text-stone-300"
                  >
                    Teléfono
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="261 555 5555"
                    className="mt-2 w-full rounded-xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none transition placeholder:text-stone-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="text-sm text-stone-300"
                  >
                    Contraseña
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="Mínimo 8 caracteres"
                    className="mt-2 w-full rounded-xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none transition placeholder:text-stone-600 focus:border-amber-400"
                  />
                </div>
              </div>
            </section>

            {/* BOTÓN */}
            <button
              type="submit"
              disabled={pending || !code}
              className="w-full rounded-xl bg-amber-400 px-5 py-4 font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Creando negocio..." : "Crear negocio"}
            </button>

            {!code && (
              <p className="text-center text-sm text-red-400">
                Falta el código de invitación.
              </p>
            )}

          </form>
        )}
      </div>
    </main>
  );
}