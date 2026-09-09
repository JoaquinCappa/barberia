import Link from "next/link";

export default function ClientePage() {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      <header className="border-b border-stone-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-bold tracking-[0.25em] text-amber-400">
              AGENDA
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg px-4 py-2 text-sm text-stone-400 transition hover:bg-stone-900 hover:text-stone-100"
            >
              Explorar
            </Link>

            <Link
              href="/api/auth/signout"
              className="rounded-lg border border-stone-800 px-4 py-2 text-sm text-stone-400 transition hover:bg-stone-900 hover:text-stone-100"
            >
              Cerrar sesión
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm font-medium text-amber-400">
          TU AGENDA
        </p>

        <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Tus turnos, en un solo lugar.
        </h1>

        <p className="mt-4 max-w-xl text-stone-400">
          Reservá en tus barberías favoritas sin tener que completar tus
          datos cada vez.
        </p>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex rounded-xl bg-amber-400 px-5 py-3 font-semibold text-stone-950 transition hover:bg-amber-300"
          >
            Buscar una barbería
          </Link>
        </div>

        <section className="mt-16">
          <h2 className="text-xl font-semibold">
            Próximos turnos
          </h2>

          <div className="mt-5 rounded-2xl border border-stone-800 bg-stone-900 p-6">
            <p className="text-sm text-stone-500">
              Todavía no tenés turnos reservados.
            </p>

            <Link
              href="/"
              className="mt-4 inline-block text-sm font-medium text-amber-400 hover:text-amber-300"
            >
              Encontrar una barbería →
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}