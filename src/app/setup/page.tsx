"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBusinessWithOwner } from "@/lib/actions/setup";
import { signIn } from "next-auth/react";

export default function SetupPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createBusinessWithOwner, null);
  const [loading, setLoading] = useState(false);
  
  // We need to capture the email and password to auto-login after creation
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
  if (!state?.success || loading) return;

  setLoading(true);

  signIn("credentials", {
    email,
    password,
    redirect: false,
  }).then((res) => {
    if (res?.ok) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  });
}, [state?.success, loading, email, password, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-stone-950 p-6 text-stone-100">
      <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-8">
        <p className="text-sm font-medium tracking-[0.2em] text-amber-400">AGENDA</p>
        <h1 className="mt-3 text-2xl font-semibold">Crear nuevo negocio</h1>
        <p className="mt-2 text-sm text-stone-400">
          Completá los datos para empezar a gestionar tus reservas.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-400">
              Nombre del negocio
            </label>
            <input
              type="text"
              name="businessName"
              required
              className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-stone-100 placeholder-stone-500 focus:border-amber-400 focus:outline-none"
              placeholder="Ej. Barbería del Centro"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-400">
              Tu nombre (Administrador)
            </label>
            <input
              type="text"
              name="ownerName"
              required
              className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-stone-100 placeholder-stone-500 focus:border-amber-400 focus:outline-none"
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-400">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-stone-100 placeholder-stone-500 focus:border-amber-400 focus:outline-none"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-400">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-stone-100 placeholder-stone-500 focus:border-amber-400 focus:outline-none"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          {state && !state.success && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending || loading || (state && state.success) || false}
            className="mt-2 w-full rounded-lg bg-amber-400 px-4 py-2 font-semibold text-stone-950 hover:bg-amber-300 disabled:opacity-50"
          >
            {pending || loading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-stone-400">
          ¿Ya tenés cuenta?{" "}
          <a href="/login" className="text-amber-400 hover:underline">
            Ingresar
          </a>
        </p>
      </div>
    </main>
  );
}

