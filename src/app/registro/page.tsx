"use client";

import { useActionState, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { registerCustomer } from "@/lib/actions/customer-auth";

export default function RegistroPage() {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    registerCustomer,
    null,
  );

  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (!state?.success || loggingIn) return;

    setLoggingIn(true);

    signIn("credentials", {
      email: state.email,
      password: state.password,
      role: "CUSTOMER",
      redirect: false,
    }).then((res) => {
      if (res?.ok) {
        router.push("/cliente");
      } else {
        router.push("/login");
      }
    });
  }, [state, loggingIn, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-stone-950 px-6 text-stone-100">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <p className="text-sm font-semibold tracking-[0.25em] text-amber-400">
            AGENDA
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Creá tu cuenta
          </h1>

          <p className="mt-2 text-sm text-stone-400">
            Reservá turnos más rápido y tené todos tus turnos en un solo lugar.
          </p>
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-7 shadow-2xl">

          <form action={formAction} className="space-y-4">

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-300">
                Nombre
              </label>

              <input
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Joaquín Cappa"
                className="w-full rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-300">
                Email
              </label>

              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@email.com"
                className="w-full rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-300">
                Teléfono
              </label>

              <input
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="261 123 4567"
                className="w-full rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-300">
                Contraseña
              </label>

              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {state && !state.success && (
              <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending || loggingIn}
              className="w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending
                ? "Creando cuenta..."
                : loggingIn
                  ? "Ingresando..."
                  : "Crear cuenta"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-stone-800" />

            <span className="text-xs text-stone-600">O</span>

            <div className="h-px flex-1 bg-stone-800" />
          </div>

          <p className="text-center text-sm text-stone-400">
            ¿Ya tenés una cuenta?{" "}
            <Link
              href="/login"
              className="font-medium text-amber-400 hover:text-amber-300"
            >
              Ingresar
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-stone-600">
          Al crear tu cuenta vas a poder gestionar tus turnos desde Agenda.
        </p>
      </div>
    </main>
  );
}