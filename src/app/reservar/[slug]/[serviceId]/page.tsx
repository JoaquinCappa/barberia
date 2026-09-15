import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BarberCard from "./BarberCard";

type Props = {
  params: Promise<{
    slug: string;
    serviceId: string;
  }>;
};

export default async function ServicePage({ params }: Props) {
  const { slug, serviceId } = await params;

  const business = await prisma.business.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      name: true,
      services: {
        where: {
          id: serviceId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          priceInCents: true,
          durationMinutes: true,
        },
      },
      barbers: {
        where: {
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          bio: true,
          imageUrl: true,
          photos: {
            orderBy: {
              sortOrder: "asc",
            },
            select: {
              id: true,
              url: true,
              caption: true,
            },
          },
        },
      },
    },
  });

  if (!business || business.services.length === 0) {
    notFound();
  }

  const service = business.services[0];

  return (
    <main
      className="min-h-screen px-5 py-10 sm:px-8 lg:px-10"
      style={{
        backgroundColor: "var(--theme-background)",
        color: "var(--theme-text)",
      }}
    >
      <div className="mx-auto w-full max-w-4xl">
        {/* Volver */}
        <Link
          href={`/reservar/${slug}`}
          className="text-sm transition-opacity hover:opacity-70"
          style={{
            color: "var(--theme-primary)",
          }}
        >
          ← Volver a servicios
        </Link>

        {/* Servicio seleccionado */}
        <section className="mt-8">
          <p
            className="text-sm font-semibold tracking-[0.2em]"
            style={{
              color: "var(--theme-primary)",
            }}
          >
            {business.name.toUpperCase()}
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {service.name}
          </h1>

          {service.description && (
            <p
              className="mt-3 max-w-2xl text-sm leading-6 sm:text-base"
              style={{
                color: "color-mix(in srgb, var(--theme-text) 60%, transparent)",
              }}
            >
              {service.description}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <span
              className="rounded-full border px-4 py-2 text-sm"
              style={{
                backgroundColor: "var(--theme-surface)",
                borderColor:
                  "color-mix(in srgb, var(--theme-text) 12%, transparent)",
                color:
                  "color-mix(in srgb, var(--theme-text) 80%, transparent)",
              }}
            >
              {service.durationMinutes} min
            </span>

            <span
              className="rounded-full border px-4 py-2 text-sm font-medium"
              style={{
                backgroundColor: "var(--theme-surface)",
                borderColor:
                  "color-mix(in srgb, var(--theme-primary) 35%, transparent)",
                color: "var(--theme-primary)",
              }}
            >
              ${(service.priceInCents / 100).toLocaleString("es-AR")}
            </span>
          </div>
        </section>

        {/* Elección de barbero */}
        <section className="mt-12">
          <div className="mb-6">
            <p
              className="text-sm font-semibold tracking-[0.2em]"
              style={{
                color: "var(--theme-primary)",
              }}
            >
              PROFESIONAL
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Elegí tu barbero
            </h2>

            <p
              className="mt-2 text-sm"
              style={{
                color:
                  "color-mix(in srgb, var(--theme-text) 55%, transparent)",
              }}
            >
              Seleccioná quién querés que te atienda para ver los días y
              horarios disponibles.
            </p>
          </div>

          {business.barbers.length === 0 ? (
            <div
              className="rounded-2xl border p-8 text-center"
              style={{
                backgroundColor: "var(--theme-surface)",
                borderColor:
                  "color-mix(in srgb, var(--theme-text) 12%, transparent)",
              }}
            >
              <p
                className="text-sm"
                style={{
                  color:
                    "color-mix(in srgb, var(--theme-text) 55%, transparent)",
                }}
              >
                Esta barbería todavía no tiene barberos disponibles.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {business.barbers.map((barber) => (
                <BarberCard
                  key={barber.id}
                  barber={barber}
                  bookingHref={`/reservar/${slug}/${service.id}/${barber.id}`}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}