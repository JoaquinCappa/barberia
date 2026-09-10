import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ReservarPage() {
  const businesses = await prisma.business.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logoUrl: true,
      address: true,
    },
  });

  return (
    <main className="min-h-screen bg-stone-950 px-5 py-10 text-stone-100 sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/mi-cuenta"
            className="text-sm text-stone-500 transition hover:text-stone-300"
          >
            ← Volver a mi cuenta
          </Link>

          <p className="mt-8 text-sm font-semibold tracking-[0.25em] text-amber-400">
            AGENDA
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Elegí tu barbería
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-400 sm:text-base">
            Seleccioná dónde querés reservar tu próximo turno.
          </p>
        </div>

        {/* Barberías */}
        {businesses.length === 0 ? (
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-8 text-center">
            <h2 className="text-lg font-medium">
              Todavía no hay barberías disponibles
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              Cuando haya barberías disponibles vas a poder reservar desde acá.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <Link
                key={business.id}
                href={`/reservar/${business.slug}`}
                className="group overflow-hidden rounded-2xl border border-stone-800 bg-stone-900 transition duration-200 hover:-translate-y-0.5 hover:border-stone-700 hover:bg-stone-900/80"
              >
                {/* Imagen / logo */}
                <div className="flex h-36 items-center justify-center bg-stone-800">
                  {business.logoUrl ? (
                    <img
                      src={business.logoUrl}
                      alt={business.name}
                      className="h-full w-full object-contain p-4"
                    />
                  ) : (
                    <span className="text-4xl font-semibold text-stone-600">
                      {business.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="text-lg font-semibold transition group-hover:text-amber-400">
                    {business.name}
                  </h2>

                  {business.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-stone-500">
                      {business.description}
                    </p>
                  )}

                  {business.address && (
                    <p className="mt-4 text-xs text-stone-600">
                      {business.address}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm font-medium text-amber-400">
                      Reservar
                    </span>

                    <span className="text-stone-600 transition group-hover:translate-x-1 group-hover:text-amber-400">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}