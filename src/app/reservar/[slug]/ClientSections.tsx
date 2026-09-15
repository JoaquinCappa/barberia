"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ImageIcon,
} from "lucide-react";

type Photo = {
  id: string;
  url: string;
  caption: string | null;
};

type Barber = {
  id: string;
  name: string;
  bio: string | null;
  specialties: string | null;
  imageUrl: string | null;
  photos: Photo[];
};

type Theme = {
  backgroundColor: string;
  surfaceColor: string;
  primaryColor: string;
  textColor: string;
};

export function ExpandableBusinessGallery({
  photos,
  radius,
  theme,
  businessName,
}: {
  photos: Photo[];
  radius: string;
  theme: Theme;
  businessName: string;
}) {
  const [expanded, setExpanded] = useState(false);

  if (photos.length === 0) {
    return null;
  }

  return (
    <section className="mt-6 sm:mt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Galería
        </h2>

        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            backgroundColor: theme.surfaceColor,
            border: `1px solid ${theme.primaryColor}`,
            color: theme.primaryColor,
          }}
          aria-expanded={expanded}
        >
          <ImageIcon size={16} />

          {expanded ? "Ocultar fotos" : "Ver fotos del lugar"}

          {expanded ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>
      </div>

      {expanded && (
        <div className="grid animate-in grid-cols-1 gap-3 fade-in slide-in-from-top-4 duration-500 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-[4/3] w-full overflow-hidden border shadow-sm"
              style={{
                borderRadius: radius,
                borderColor: theme.surfaceColor,
              }}
            >
              <Image
                src={photo.url}
                alt={photo.caption ?? `Foto de ${businessName}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />

              {photo.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
                  <p className="text-xs font-medium text-white drop-shadow-md">
                    {photo.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function BarberCard({
  barber,
  radius,
  theme,
  isOutlineButton,
  businessSlug,
}: {
  barber: Barber;
  radius: string;
  theme: Theme;
  isOutlineButton: boolean;
  businessSlug: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const firstName = barber.name.split(" ")[0];

  const bookingHref = `/reservar/${businessSlug}`;

  return (
    <div
      className="flex h-full flex-col overflow-hidden border"
      style={{
        borderRadius: radius,
        borderColor: theme.backgroundColor,
        backgroundColor: theme.surfaceColor,
      }}
    >
      <div className="flex h-full flex-col justify-between p-5 sm:p-6">
        <div>
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-sm"
              style={{
                backgroundColor: theme.backgroundColor,
              }}
            >
              {barber.imageUrl ? (
                <Image
                  src={barber.imageUrl}
                  alt={barber.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  className="text-2xl font-semibold"
                  style={{
                    opacity: 0.3,
                  }}
                >
                  {firstName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <h3 className="text-lg font-semibold leading-tight">
                {barber.name}
              </h3>

              {barber.specialties && (
                <p
                  className="mt-1 text-xs font-medium leading-relaxed"
                  style={{
                    color: theme.primaryColor,
                  }}
                >
                  {barber.specialties}
                </p>
              )}
            </div>
          </div>

          {barber.bio && (
            <p
              className="mt-4 text-sm leading-relaxed"
              style={{
                opacity: 0.7,
              }}
            >
              {barber.bio}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href={bookingHref}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
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
            Elegir turno con {firstName}
            <ArrowRight size={14} />
          </Link>

          {barber.photos.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                borderRadius: radius,
                border: "1px solid transparent",
                color: theme.textColor,
                opacity: 0.8,
              }}
              aria-expanded={expanded}
            >
              <ImageIcon size={14} />

              {expanded ? "Ocultar trabajos" : "Ver trabajos"}

              {expanded ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>
          )}
        </div>
      </div>

      {expanded && barber.photos.length > 0 && (
        <div
          className="grid animate-in grid-cols-3 gap-1 fade-in slide-in-from-top-2 duration-500"
          style={{
            backgroundColor: theme.surfaceColor,
          }}
        >
          {barber.photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square overflow-hidden"
              style={{
                borderRadius: radius,
              }}
            >
              <Image
                src={photo.url}
                alt={photo.caption ?? `Trabajo de ${barber.name}`}
                fill
                sizes="(max-width: 640px) 33vw, 15vw"
                className="object-cover transition-transform duration-500 hover:scale-110"
              />

              {photo.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 pt-4">
                  <p className="truncate text-[9px] font-medium text-white">
                    {photo.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}