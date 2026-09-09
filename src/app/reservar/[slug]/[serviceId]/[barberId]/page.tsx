import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BookingSelector from "./BookingSelector";

type Props = {
  params: Promise<{
    slug: string;
    serviceId: string;
    barberId: string;
  }>;
};

export default async function BarberPage({ params }: Props) {
  const { slug, serviceId, barberId } = await params;

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
          id: barberId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          bio: true,
          imageUrl: true,
        },
      },
    },
  });

  if (
    !business ||
    business.services.length === 0 ||
    business.barbers.length === 0
  ) {
    notFound();
  }

  const service = business.services[0];
  const barber = business.barbers[0];

  return (
    <main
      className="min-h-screen px-5 py-10 sm:px-8 lg:px-10"
      style={{
        backgroundColor: "var(--theme-background)",
        color: "var(--theme-text)",
      }}
    >
      <div className="mx-auto w-full max-w-4xl">

        {/* Navegación */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/reservar/${slug}/${service.id}`}
            className="text-sm transition-opacity hover:opacity-70"
            style={{
              color:
                "color-mix(in srgb, var(--theme-text) 55%, transparent)",
            }}
          >
            ← Volver a profesionales
          </Link>

          {/* Cambiá /cuenta si tu ruta de cuenta tiene otro nombre */}
          <Link
            href="/cuenta"
            className="rounded-2xl border px-5 py-3 text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              backgroundColor: "var(--theme-surface)",
              borderColor:
                "color-mix(in srgb, var(--theme-text) 12%, transparent)",
              color: "var(--theme-text)",
            }}
          >
            Mi cuenta
          </Link>
        </div>

        {/* Profesional */}
        <section className="mt-8">
          <p
            className="text-sm font-semibold tracking-[0.2em]"
            style={{
              color: "var(--theme-primary)",
            }}
          >
            {business.name.toUpperCase()}
          </p>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">

            {/* Foto */}
            <div
              className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full"
              style={{
                backgroundColor: "var(--theme-surface)",
              }}
            >
              {barber.imageUrl ? (
                <img
                  src={barber.imageUrl}
                  alt={barber.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  className="text-3xl font-semibold"
                  style={{
                    color:
                      "color-mix(in srgb, var(--theme-text) 40%, transparent)",
                  }}
                >
                  {barber.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {barber.name}
              </h1>

              {barber.bio && (
                <p
                  className="mt-2 max-w-xl text-sm leading-6"
                  style={{
                    color:
                      "color-mix(in srgb, var(--theme-text) 60%, transparent)",
                  }}
                >
                  {barber.bio}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Servicio */}
        <section className="mt-12">
          <p
            className="text-sm font-semibold tracking-[0.2em]"
            style={{
              color: "var(--theme-primary)",
            }}
          >
            SERVICIO
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            {service.name}
          </h2>

          {service.description && (
            <p
              className="mt-2 text-sm"
              style={{
                color:
                  "color-mix(in srgb, var(--theme-text) 55%, transparent)",
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

        {/* Reserva */}
        <section className="mt-12">
          <BookingSelector
            businessId={business.id}
            barberId={barber.id}
            serviceId={service.id}
            serviceName={service.name}
            priceInCents={service.priceInCents}
          />
        </section>
      </div>
    </main>
  );
}