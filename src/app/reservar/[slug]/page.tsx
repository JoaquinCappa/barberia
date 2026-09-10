import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  MapPin,
  Phone,
  Scissors,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  defaultBusinessTheme,
  getThemeFont,
  getThemeRadius,
} from "@/lib/business-theme";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BarberiaPage({ params }: Props) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logoUrl: true,
      coverImageUrl: true,
      address: true,
      phone: true,
      theme: true,

      services: {
        where: {
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          description: true,
          priceInCents: true,
          durationMinutes: true,
        },
      },
    },
  });

  if (!business) {
    notFound();
  }

  const theme = {
    ...defaultBusinessTheme,
    ...(business.theme ?? {}),
  };

  const radius = getThemeRadius(theme.borderRadius);
  const font = getThemeFont(theme.fontFamily);

  const isOutlineButton = theme.buttonStyle === "outline";

  return (
    <main
      className="min-h-screen px-4 py-6 sm:px-6 sm:py-10 lg:px-8"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: font,
      }}
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Navegación */}
        <Link
          href="/reservar"
          className="group inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-100"
          style={{
            color: theme.textColor,
            opacity: 0.65,
          }}
        >
          <ArrowLeft size={16} />
          Volver a barberías
        </Link>

        {/* Cabecera principal */}
        <section
          className="mt-6 overflow-hidden border shadow-sm sm:mt-8"
          style={{
            borderRadius: radius,
            borderColor: theme.surfaceColor,
            backgroundColor: theme.surfaceColor,
          }}
        >
          {/* Portada */}
          <div
            className="relative h-56 overflow-hidden sm:h-72 lg:h-80"
            style={{
              backgroundColor: theme.backgroundColor,
            }}
          >
            {business.coverImageUrl ? (
              <Image
                src={business.coverImageUrl}
                alt={`Portada de ${business.name}`}
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1152px"
                className="object-cover"
              />
            ) : business.logoUrl ? (
              <div className="relative h-full w-full">
                <Image
                  src={business.logoUrl}
                  alt={`Logo de ${business.name}`}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1152px"
                  className="object-contain p-10 sm:p-16"
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <Scissors
                  size={72}
                  strokeWidth={1.2}
                  style={{
                    color: theme.primaryColor,
                  }}
                />
              </div>
            )}

            {/* Degradado inferior para mejorar la lectura visual */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.45), transparent)",
              }}
            />
          </div>

          {/* Información */}
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div
                  className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.24em]"
                  style={{
                    color: theme.primaryColor,
                  }}
                >
                  <Scissors size={15} />
                  BARBERÍA
                </div>

                <h1
                  className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
                  style={{
                    color: theme.primaryColor,
                  }}
                >
                  {business.name}
                </h1>

                {business.description && (
                  <p
                    className="mt-4 max-w-2xl text-sm leading-7 sm:text-base"
                    style={{
                      opacity: 0.72,
                    }}
                  >
                    {business.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 text-sm">
                {theme.showAddress && business.address && (
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0"
                      style={{
                        color: theme.primaryColor,
                      }}
                    />

                    <span
                      style={{
                        opacity: 0.7,
                      }}
                    >
                      {business.address}
                    </span>
                  </div>
                )}

                {theme.showPhone && business.phone && (
                  <div className="flex items-center gap-3">
                    <Phone
                      size={17}
                      className="shrink-0"
                      style={{
                        color: theme.primaryColor,
                      }}
                    />

                    <span
                      style={{
                        opacity: 0.7,
                      }}
                    >
                      {business.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Servicios */}
        <section className="mt-12 sm:mt-16">
          <div className="mb-6">
            <div
              className="flex items-center gap-2 text-xs font-semibold tracking-[0.24em]"
              style={{
                color: theme.primaryColor,
              }}
            >
              <Scissors size={15} />
              SERVICIOS
            </div>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Elegí tu servicio
            </h2>

            <p
              className="mt-2 max-w-xl text-sm leading-6"
              style={{
                opacity: 0.6,
              }}
            >
              Seleccioná el servicio que querés realizar y elegí el horario
              disponible.
            </p>
          </div>

          {business.services.length === 0 ? (
            <div
              className="p-8 text-center"
              style={{
                borderRadius: radius,
                border: `1px solid ${theme.backgroundColor}`,
                backgroundColor: theme.surfaceColor,
              }}
            >
              <Scissors
                size={32}
                className="mx-auto mb-3"
                style={{
                  color: theme.primaryColor,
                }}
              />

              <p className="text-sm opacity-60">
                Esta barbería todavía no tiene servicios disponibles.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {business.services.map((service) => (
                <article
                  key={service.id}
                  className="group flex flex-col justify-between border p-5 transition duration-200 hover:-translate-y-1 sm:p-6"
                  style={{
                    borderRadius: radius,
                    borderColor: theme.backgroundColor,
                    backgroundColor: theme.surfaceColor,
                  }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-semibold leading-6">
                        {service.name}
                      </h3>

                      {theme.showPrices && (
                        <span
                          className="shrink-0 text-base font-semibold"
                          style={{
                            color: theme.primaryColor,
                          }}
                        >
                          $
                          {(service.priceInCents / 100).toLocaleString(
                            "es-AR",
                          )}
                        </span>
                      )}
                    </div>

                    {service.description && (
                      <p
                        className="mt-3 text-sm leading-6"
                        style={{
                          opacity: 0.6,
                        }}
                      >
                        {service.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-7 flex items-center justify-between gap-4">
                    <div
                      className="flex items-center gap-2 text-xs"
                      style={{
                        opacity: 0.55,
                      }}
                    >
                      <Clock size={15} />
                      {service.durationMinutes} minutos
                    </div>

                    <Link
                      href={`/reservar/${business.slug}/${service.id}`}
                      className="group/button inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition hover:opacity-90"
                      style={{
                        borderRadius: radius,
                        border: `1px solid ${theme.primaryColor}`,
                        backgroundColor: isOutlineButton
                          ? "transparent"
                          : theme.primaryColor,
                        color: isOutlineButton
                          ? theme.primaryColor
                          : theme.backgroundColor,
                      }}
                    >
                      Elegir
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover/button:translate-x-1"
                      />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Pie de página */}
        <footer
          className="mt-14 border-t py-6 text-center text-xs sm:mt-20"
          style={{
            borderColor: theme.surfaceColor,
            opacity: 0.5,
          }}
        >
          Reservá tu turno de forma rápida y sencilla.
        </footer>
      </div>
    </main>
  );
}