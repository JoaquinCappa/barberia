"use client";

import { useActionState, useRef, useState, useEffect } from "react";
import { addBusinessPhoto, deleteBusinessPhoto } from "@/lib/actions/business-photos";

type Photo = { id: string; url: string; caption: string | null };

const MAX_PHOTOS = 8;

const btnDanger =
  "rounded-lg border border-red-800 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-900/40";
const btnPrimary =
  "rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50";
const inputCls =
  "w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 outline-none transition focus:border-amber-400";

function AddPhotoForm({ onDone }: { onDone: () => void }) {
  const [state, formAction, pending] = useActionState(addBusinessPhoto, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success === true) {
      formRef.current?.reset();
      onDone();
    }
  }, [state?.success, onDone]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
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
          placeholder="Ej: Interior de la barbería"
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

export default function GaleriaSection({
  initialPhotos,
}: {
  initialPhotos: Photo[];
}) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta foto? Esta acción no se puede deshacer.")) return;
    setDeletingId(id);
    const res = await deleteBusinessPhoto(id);
    if (res.success) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert(res.error);
    }
    setDeletingId(null);
  };

  return (
    <div className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-100">Galería del local</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            {photos.length}/{MAX_PHOTOS} fotos · Interior, exterior, ambiente
          </p>
        </div>
        {!showForm && photos.length < MAX_PHOTOS && (
          <button className={btnPrimary} onClick={() => setShowForm(true)}>
            + Agregar foto
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-5 rounded-xl border border-stone-800 bg-stone-900 p-5">
          <h3 className="mb-4 font-medium text-stone-100">Nueva foto</h3>
          <AddPhotoForm
            onDone={() => {
              setShowForm(false);
              // Refresh optimistically — page will revalidate from server action
              window.location.reload();
            }}
          />
        </div>
      )}

      {photos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-700 p-8 text-center">
          <p className="text-sm text-stone-500">
            Aún no hay fotos en la galería.{" "}
            {photos.length < MAX_PHOTOS && (
              <button
                className="text-amber-400 hover:underline"
                onClick={() => setShowForm(true)}
              >
                Agregá la primera
              </button>
            )}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-xl border border-stone-800 bg-stone-900"
            >
              <img
                src={photo.url}
                alt={photo.caption ?? "Foto del local"}
                className="h-40 w-full object-cover"
              />
              {photo.caption && (
                <p className="px-3 py-2 text-xs text-stone-400">{photo.caption}</p>
              )}
              <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  className={btnDanger}
                  onClick={() => handleDelete(photo.id)}
                  disabled={deletingId === photo.id}
                >
                  {deletingId === photo.id ? "..." : "Eliminar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

