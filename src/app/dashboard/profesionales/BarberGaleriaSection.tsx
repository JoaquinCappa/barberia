"use client";

import { useActionState, useRef, useState, useEffect } from "react";
import { addBarberPhoto, deleteBarberPhoto } from "@/lib/actions/barber-photos";

type Photo = { id: string; url: string; caption: string | null };

const MAX_PHOTOS = 12;

const btnDanger =
  "rounded-lg border border-red-800 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-900/40";
const btnPrimary =
  "rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50";
const inputCls =
  "w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 outline-none transition focus:border-amber-400";

function AddPhotoForm({
  barberId,
  onDone,
}: {
  barberId: string;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(addBarberPhoto, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success === true) {
      formRef.current?.reset();
      onDone();
    }
  }, [state?.success, onDone]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="barberId" value={barberId} />
      <div>
        <label className="mb-1.5 block text-xs font-medium text-stone-400">
          Imagen (JPG, PNG o WEBP · máx 5 MB)
        </label>
        <input
          type="file"
          name="photo"
          required
          accept="image/jpeg,image/png,image/webp"
          className="block w-full cursor-pointer rounded-lg border border-stone-700 bg-stone-800 text-sm text-stone-300 file:mr-4 file:border-0 file:bg-amber-400 file:px-4 file:py-2.5 file:font-semibold file:text-stone-950 hover:file:bg-amber-300"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-stone-400">
          Pie de foto (opcional)
        </label>
        <input
          className={inputCls}
          name="caption"
          placeholder="Ej: Corte fade + barba"
        />
      </div>
      {state && !state.success && (
        <p className="text-sm text-red-400">{state.error}</p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Subiendo..." : "Agregar foto"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-stone-700 px-4 py-2 text-sm text-stone-300 hover:bg-stone-800"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function BarberGaleriaSection({
  barberId,
  initialPhotos,
}: {
  barberId: string;
  initialPhotos: Photo[];
}) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta foto?")) return;
    setDeletingId(id);
    const res = await deleteBarberPhoto(id);
    if (res.success) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert(res.error);
    }
    setDeletingId(null);
  };

  return (
    <div className="mt-4 border-t border-stone-800 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-stone-300">
          Trabajos · {photos.length}/{MAX_PHOTOS}
        </p>
        {!showForm && photos.length < MAX_PHOTOS && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-medium text-amber-400 hover:underline"
          >
            + Agregar foto
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-4 rounded-xl border border-stone-700 bg-stone-800/50 p-4">
          <AddPhotoForm
            barberId={barberId}
            onDone={() => {
              setShowForm(false);
              window.location.reload();
            }}
          />
        </div>
      )}

      {photos.length === 0 ? (
        <p className="text-xs text-stone-600">
          Sin fotos aún.{" "}
          {photos.length < MAX_PHOTOS && (
            <button
              className="text-amber-400 hover:underline"
              onClick={() => setShowForm(true)}
            >
              Subí la primera
            </button>
          )}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative overflow-hidden rounded-lg">
              <img
                src={photo.url}
                alt={photo.caption ?? "Trabajo"}
                className="h-24 w-full object-cover"
              />
              {photo.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                  <p className="truncate text-[10px] text-white">{photo.caption}</p>
                </div>
              )}
              <button
                className="absolute right-1 top-1 hidden rounded bg-red-900/80 px-1.5 py-0.5 text-[10px] font-medium text-red-300 group-hover:flex"
                onClick={() => handleDelete(photo.id)}
                disabled={deletingId === photo.id}
              >
                {deletingId === photo.id ? "..." : "✕"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

