"use client";

import { useState } from "react";
import Link from "next/link";

type BarberPhoto = {
  id: string;
  url: string;
  caption: string | null;
};

type Barber = {
  id: string;
  name: string;
  bio: string | null;
  imageUrl: string | null;
  photos: BarberPhoto[];
};

type Props = {
  barber: Barber;
  bookingHref: string;
};

export default function BarberCard({
  barber,
  bookingHref,
}: Props) {
  const [showPhotos, setShowPhotos] = useState(false);

  return (
    <article
      className="overflow-hidden rounded-2xl border"
      style={{
        backgroundColor: "var(--theme-surface)",
        borderColor:
          "color-mix(in srgb, var(--theme-text) 12%, transparent)",
      }}
    >
      {/* Información del barbero */}
      <div className="flex items-center gap-5 p-5">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--theme-text) 8%, transparent)",
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
              className="text-2xl font-semibold"
              style={{
                color:
                  "color-mix(in srgb, var(--theme-text) 40%, transparent)",
              }}
            >
              {barber.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-semibold">{barber.name}</h3>

          {barber.bio && (
            <p
              className="mt-1 text-sm leading-6"
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

      {/* Botón para mostrar u ocultar trabajos */}
      {barber.photos.length > 0 && (
        <div
          className="border-t px-5 py-4"
          style={{
            borderColor:
              "color-mix(in srgb, var(--theme-text) 10%, transparent)",
          }}
        >
          <button
            type="button"
            onClick={() => setShowPhotos((current) => !current)}
            className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{
              color: "var(--theme-primary)",
            }}
          >
            {showPhotos ? "Ocultar trabajos" : "Ver trabajos"}
            <span
              className={`transition-transform ${
                showPhotos ? "rotate-180" : ""
              }`}
            >
              ↓
            </span>
          </button>
        </div>
      )}

      {/* Trabajos ocultos inicialmente */}
      {showPhotos && (
        <div
          className="border-t px-5 py-5"
          style={{
            borderColor:
              "color-mix(in srgb, var(--theme-text) 10%, transparent)",
          }}
        >
          <h4 className="mb-4 text-lg font-semibold">
            Trabajos de {barber.name}
          </h4>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {barber.photos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-xl"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--theme-text) 6%, transparent)",
                }}
              >
                <img
                  src={photo.url}
                  alt={
                    photo.caption ||
                    `Trabajo realizado por ${barber.name}`
                  }
                  className="aspect-square h-full w-full object-cover"
                />

                {photo.caption && (
                  <p
                    className="px-3 py-2 text-xs"
                    style={{
                      color:
                        "color-mix(in srgb, var(--theme-text) 65%, transparent)",
                    }}
                  >
                    {photo.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Elegir día y horario */}
      <div
        className="border-t px-5 py-4"
        style={{
          borderColor:
            "color-mix(in srgb, var(--theme-text) 10%, transparent)",
        }}
      >
        <Link
          href={bookingHref}
          className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition hover:opacity-90"
          style={{
            backgroundColor: "var(--theme-primary)",
            color: "var(--theme-background)",
          }}
        >
          Elegir día y horario →
        </Link>
      </div>
    </article>
  );
}