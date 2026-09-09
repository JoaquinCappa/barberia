"use client";

import { useActionState } from "react";
import { createBusinessInvitation } from "@/lib/actions/business-invitations";

const initialState = null;

export default function InvitacionesPanel() {
  const [state, formAction, pending] = useActionState(
    createBusinessInvitation,
    initialState,
  );

  const invitationUrl = state?.success
    ? `${window.location.origin}/crear-negocio?code=${state.code}`
    : "";

  return (
    <main className="min-h-screen bg-stone-950 px-5 py-10 text-stone-100">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-10">
          <p className="text-sm font-semibold tracking-[0.2em] text-amber-400">
            ADMINISTRACIÓN
          </p>

          <h1 className="mt-3 text-3xl font-semibold">
            Invitaciones
          </h1>

          <p className="mt-3 text-sm text-stone-500">
            Generá enlaces para que nuevos negocios creen su cuenta.
          </p>
        </div>

        <form
          action={formAction}
          className="rounded-2xl border border-stone-800 bg-stone-900 p-6"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="email"
                className="text-sm text-stone-300"
              >
                Email del dueño
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="dueno@gmail.com"
                className="mt-2 w-full rounded-xl border border-stone-800 bg-stone-950 px-4 py-3 text-sm outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label
                htmlFor="days"
                className="text-sm text-stone-300"
              >
                Válida durante
              </label>

              <select
                id="days"
                name="days"
                defaultValue="7"
                className="mt-2 w-full rounded-xl border border-stone-800 bg-stone-950 px-4 py-3 text-sm outline-none focus:border-amber-400"
              >
                <option value="1">1 día</option>
                <option value="3">3 días</option>
                <option value="7">7 días</option>
                <option value="14">14 días</option>
                <option value="30">30 días</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-6 w-full rounded-xl bg-amber-400 px-5 py-4 font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Generando..." : "Generar invitación"}
          </button>
        </form>

        {state?.success === false && (
          <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3">
            <p className="text-sm text-red-300">
              {state.error}
            </p>
          </div>
        )}

        {state?.success === true && (
          <div className="mt-6 rounded-2xl border border-emerald-900 bg-emerald-950/40 p-6">
            <p className="text-sm font-semibold text-emerald-400">
              INVITACIÓN GENERADA
            </p>

            <p className="mt-4 text-sm text-stone-400">
              Código
            </p>

            <p className="mt-1 break-all font-mono text-lg">
              {state.code}
            </p>

            <p className="mt-5 text-sm text-stone-400">
              Enlace
            </p>

            <p className="mt-1 break-all text-sm text-stone-300">
              {invitationUrl}
            </p>

            <button
              type="button"
              onClick={() =>
                navigator.clipboard.writeText(invitationUrl)
              }
              className="mt-6 rounded-xl bg-stone-100 px-5 py-3 font-semibold text-stone-950"
            >
              Copiar enlace
            </button>
          </div>
        )}
      </div>
    </main>
  );
}