"use client";

import { useActionState, useState } from "react";
import { createBarber, deleteBarber, updateBarber } from "@/lib/actions/barbers";

type Barber = {
  id: string;
  name: string;
  bio: string | null;
  imageUrl: string | null;
  isActive: boolean;
};

const inputCls =
  "w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-400 focus:outline-none";
const labelCls = "mb-1 block text-xs font-medium text-stone-400";
const btnPrimary =
  "rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-amber-300 disabled:opacity-50";
const btnSecondary =
  "rounded-lg border border-stone-700 px-3 py-2 text-sm text-stone-300 hover:bg-stone-800";
const btnDanger =
  "rounded-lg border border-red-800 px-3 py-1 text-xs text-red-400 hover:bg-red-900/40";

function BarberForm({ onDone, initial }: { onDone: () => void; initial?: Barber }) {
  const action = initial ? updateBarber : createBarber;
  const [state, formAction, pending] = useActionState(action, null);

  if (state?.success) {
    onDone();
    return null;
  }

  return (
    <form action={formAction} className="space-y-3">
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div>
        <label className={labelCls}>Nombre *</label>
        <input
          className={inputCls}
          name="name"
          required
          defaultValue={initial?.name}
          placeholder="Nombre del profesional"
        />
      </div>

      <div>
        <label className={labelCls}>Bio</label>
        <input
          className={inputCls}
          name="bio"
          defaultValue={initial?.bio ?? ""}
          placeholder="Especialidad, años de experiencia…"
        />
      </div>

      <div>
        <label className={labelCls}>URL de foto</label>
        <input
          className={inputCls}
          name="imageUrl"
          type="url"
          defaultValue={initial?.imageUrl ?? ""}
          placeholder="https://…"
        />
      </div>

      {state && !state.success && (
        <p className="text-sm text-red-400">{state.error}</p>
      )}

      <div className="flex gap-2 pt-1">
        <button className={btnPrimary} type="submit" disabled={pending}>
          {pending ? "Guardando…" : initial ? "Actualizar" : "Crear profesional"}
        </button>
        <button className={btnSecondary} type="button" onClick={onDone}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function ProfesionalesClient({ barbers }: { barbers: Barber[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Barber | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Desactivar este profesional?")) return;
    await deleteBarber(id);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Profesionales</h1>
        {!showForm && !editing && (
          <button className={btnPrimary} onClick={() => setShowForm(true)}>
            + Nuevo profesional
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-stone-800 bg-stone-900 p-5">
          <h2 className="mb-4 font-medium">Nuevo profesional</h2>
          <BarberForm onDone={() => setShowForm(false)} />
        </div>
      )}

      <div className="rounded-xl border border-stone-800 bg-stone-900">
        {barbers.length === 0 && !showForm ? (
          <p className="p-6 text-sm text-stone-500">
            No hay profesionales aún. Creá el primero.
          </p>
        ) : (
          <div className="divide-y divide-stone-800">
            {barbers.map((b) => (
              <div key={b.id} className="p-4">
                {editing?.id === b.id ? (
                  <BarberForm initial={b} onDone={() => setEditing(null)} />
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {b.imageUrl ? (
                        <img
                          src={b.imageUrl}
                          alt={b.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-sm font-semibold text-amber-400">
                          {b.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">
                          {b.name}
                          {!b.isActive && (
                            <span className="ml-2 text-xs text-stone-500">(inactivo)</span>
                          )}
                        </p>
                        {b.bio && <p className="text-sm text-stone-400">{b.bio}</p>}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button className={btnSecondary} onClick={() => setEditing(b)}>
                        Editar
                      </button>
                      <button className={btnDanger} onClick={() => handleDelete(b.id)}>
                        Desactivar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
