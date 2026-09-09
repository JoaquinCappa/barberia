import Link from "next/link";
import { notFound } from "next/navigation";
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

  const buttonClass =
    theme.buttonStyle === "outline"
      ? "border-2 bg-transparent"
      : "border-2";

  return (
    <main
      className="min-h-screen px-5 py-10 sm:px-8 lg:px-10"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: font,
      }}
    >
      <div className="mx-auto w-full max-w-5xl">

        {/* Volver */}
        <Link
          href="/reservar"
          className="text-sm opacity-60 transition hover:opacity-100"
          style={{
            color: theme.textColor,
          }}
        >
          ← Volver a barberías
        </Link>

        {/* Cabecera */}
        <div
          className="mt-8 overflow-hidden border"
          style={{
            borderRadius: radius,
            borderColor: theme.surfaceColor,
            backgroundColor: theme.surfaceColor,
          }}
        >
          <div
            className="flex h-48 items-center justify-center sm:h-56"
            style={{
              backgroundColor: theme.backgroundColor,
            }}
          >
            {business.coverImageUrl ? (
              <img
                src={business.coverImageUrl}
                alt={business.name}
                className="h-full w-full object-cover"
              />
            ) : business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={business.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span
                className="text-6xl font-semibold"
                style={{
                  color: theme.primaryColor,
                }}
              >
                {business.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <h1
              className="text-3xl font-semibold tracking-tight sm:text-4xl"
              style={{
                color: theme.primaryColor,
              }}
            >
              {business.name}
            </h1>

            {business.description && (
              <p
                className="mt-3 max-w-2xl text-sm leading-6 sm:text-base"
                style={{
                  opacity: 0.7,
                }}
              >
                {business.description}
              </p>
            )}

            {theme.showAddress && business.address && (
              <p
                className="mt-4 text-sm"
                style={{
                  opacity: 0.6,
                }}
              >
                {business.address}
              </p>
            )}

            {theme.showPhone && business.phone && (
              <p
                className="mt-2 text-sm"
                style={{
                  opacity: 0.6,
                }}
              >
                {business.phone}
              </p>
            )}
          </div>
        </div>

        {/* Servicios */}
        <div className="mt-10">
          <div className="mb-5">
            <p
              className="text-sm font-semibold tracking-[0.2em]"
              style={{
                color: theme.primaryColor,
              }}
            >
              SERVICIOS
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Elegí tu servicio
            </h2>
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
              <p className="text-sm opacity-60">
                Esta barbería todavía no tiene servicios disponibles.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {business.services.map((service) => (
                <div
                  key={service.id}
                  className="border p-5 transition"
                  style={{
                    borderRadius: radius,
                    borderColor: theme.backgroundColor,
                    backgroundColor: theme.surfaceColor,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">
                        {service.name}
                      </h3>

                      {service.description && (
                        <p className="mt-2 text-sm leading-5 opacity-60">
                          {service.description}
                        </p>
                      )}
                    </div>

                    {theme.showPrices && (
                      <span
                        className="shrink-0 font-semibold"
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

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs opacity-50">
                      {service.durationMinutes} min
                    </span>

                    <Link
                      href={`/reservar/${business.slug}/${service.id}`}
                      className={`${buttonClass} px-4 py-2.5 text-sm font-semibold transition`}
                      style={{
                        borderRadius: radius,
                        borderColor: theme.primaryColor,
                        backgroundColor:
                          theme.buttonStyle === "outline"
                            ? "transparent"
                            : theme.primaryColor,
                        color:
                          theme.buttonStyle === "outline"
                            ? theme.primaryColor
                            : theme.backgroundColor,
                      }}
                    >
                      Elegir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}