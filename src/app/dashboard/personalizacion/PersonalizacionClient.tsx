"use client";

import { useActionState, useState } from "react";
import { updateBusinessTheme } from "@/lib/actions/theme";

type Theme = {
  primaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderRadius: string;
  buttonStyle: string;
  fontFamily: string;
  showAddress: boolean;
  showPhone: boolean;
  showPrices: boolean;
};

const inputClass =
  "h-10 w-full rounded-lg border border-stone-700 bg-stone-800 px-3 text-sm text-stone-100 focus:border-amber-400 focus:outline-none";

export default function PersonalizacionClient({
  initialTheme,
}: {
  initialTheme: Theme;
}) {
  const [state, formAction, pending] = useActionState(
    updateBusinessTheme,
    null,
  );

  const [primaryColor, setPrimaryColor] = useState(
    initialTheme.primaryColor,
  );

  const [backgroundColor, setBackgroundColor] = useState(
    initialTheme.backgroundColor,
  );

  const [surfaceColor, setSurfaceColor] = useState(
    initialTheme.surfaceColor,
  );

  const [textColor, setTextColor] = useState(
    initialTheme.textColor,
  );

  const [borderRadius, setBorderRadius] = useState(
    initialTheme.borderRadius,
  );

  const [buttonStyle, setButtonStyle] = useState(
    initialTheme.buttonStyle,
  );

  const [fontFamily, setFontFamily] = useState(
    initialTheme.fontFamily,
  );

  const [showAddress, setShowAddress] = useState(
    initialTheme.showAddress,
  );

  const [showPhone, setShowPhone] = useState(
    initialTheme.showPhone,
  );

  const [showPrices, setShowPrices] = useState(
    initialTheme.showPrices,
  );

  const radius =
    borderRadius === "none"
      ? "0px"
      : borderRadius === "medium"
        ? "8px"
        : borderRadius === "large"
          ? "16px"
          : "24px";

  const font =
    fontFamily === "serif"
      ? "Georgia, serif"
      : fontFamily === "mono"
        ? "monospace"
        : "system-ui, sans-serif";

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">
          Personalización
        </h1>

        <p className="mt-2 text-sm text-stone-500">
          Personalizá la apariencia de la página pública de tu barbería.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_480px]">
        {/* ========================= */}
        {/* CONFIGURACIÓN */}
        {/* ========================= */}

        <form action={formAction}>
          {/* COLORES */}
          <section className="rounded-xl border border-stone-800 bg-stone-900 p-6">
            <h2 className="font-semibold">
              Colores
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Elegí los colores de tu marca.
            </p>

            <div className="mt-6 space-y-5">
              <ColorInput
                name="primaryColor"
                label="Color principal"
                value={primaryColor}
                onChange={setPrimaryColor}
              />

              <ColorInput
                name="backgroundColor"
                label="Fondo"
                value={backgroundColor}
                onChange={setBackgroundColor}
              />

              <ColorInput
                name="surfaceColor"
                label="Tarjetas"
                value={surfaceColor}
                onChange={setSurfaceColor}
              />

              <ColorInput
                name="textColor"
                label="Texto"
                value={textColor}
                onChange={setTextColor}
              />
            </div>
          </section>

          {/* ESTILO */}
          <section className="mt-6 rounded-xl border border-stone-800 bg-stone-900 p-6">
            <h2 className="font-semibold">
              Estilo
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Definí cómo se ven los elementos.
            </p>

            <div className="mt-6 space-y-5">
              {/* BORDES */}
              <div>
                <label className="mb-2 block text-sm text-stone-400">
                  Bordes
                </label>

                <select
                  name="borderRadius"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(e.target.value)}
                  className={inputClass}
                >
                  <option value="none">Cuadrados</option>
                  <option value="medium">Medios</option>
                  <option value="large">Redondeados</option>
                  <option value="xl">Muy redondeados</option>
                </select>
              </div>

              {/* BOTONES */}
              <div>
                <label className="mb-2 block text-sm text-stone-400">
                  Botones
                </label>

                <select
                  name="buttonStyle"
                  value={buttonStyle}
                  onChange={(e) => setButtonStyle(e.target.value)}
                  className={inputClass}
                >
                  <option value="filled">Rellenos</option>
                  <option value="outline">Contorno</option>
                </select>
              </div>

              {/* TIPOGRAFÍA */}
              <div>
                <label className="mb-2 block text-sm text-stone-400">
                  Tipografía
                </label>

                <select
                  name="fontFamily"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className={inputClass}
                >
                  <option value="default">Predeterminada</option>
                  <option value="serif">Elegante</option>
                  <option value="mono">Monoespaciada</option>
                </select>
              </div>
            </div>
          </section>

          {/* INFORMACIÓN VISIBLE */}
          <section className="mt-6 rounded-xl border border-stone-800 bg-stone-900 p-6">
            <h2 className="font-semibold">
              Información visible
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Elegí qué información mostrar en tu página.
            </p>

            <div className="mt-6 space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="showAddress"
                  checked={showAddress}
                  onChange={(e) => setShowAddress(e.target.checked)}
                  className="h-4 w-4 accent-amber-400"
                />

                <span className="text-sm text-stone-300">
                  Mostrar dirección
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="showPhone"
                  checked={showPhone}
                  onChange={(e) => setShowPhone(e.target.checked)}
                  className="h-4 w-4 accent-amber-400"
                />

                <span className="text-sm text-stone-300">
                  Mostrar teléfono
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="showPrices"
                  checked={showPrices}
                  onChange={(e) => setShowPrices(e.target.checked)}
                  className="h-4 w-4 accent-amber-400"
                />

                <span className="text-sm text-stone-300">
                  Mostrar precios
                </span>
              </label>
            </div>
          </section>

          {/* MENSAJES */}
          {state && !state.success && (
            <p className="mt-4 text-sm text-red-400">
              {state.error}
            </p>
          )}

          {state?.success && (
            <p className="mt-4 text-sm text-green-400">
              Cambios guardados.
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-6 rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-300 disabled:opacity-50"
          >
            {pending ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>

        {/* ========================= */}
        {/* VISTA PREVIA */}
        {/* ========================= */}

        <div className="xl:sticky xl:top-6 xl:self-start">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-stone-100">
                Vista previa
              </h2>

              <p className="mt-1 text-xs text-stone-500">
                Así se verá aproximadamente tu página pública.
              </p>
            </div>

            <span className="rounded-full border border-stone-800 px-3 py-1 text-xs text-stone-500">
              En vivo
            </span>
          </div>

          <div
            className="overflow-hidden border shadow-2xl"
            style={{
              backgroundColor,
              color: textColor,
              borderColor: surfaceColor,
              borderRadius: radius,
              fontFamily: font,
            }}
          >
            {/* HEADER PREVIEW */}
            <div
              className="px-6 py-8"
              style={{
                backgroundColor: surfaceColor,
              }}
            >
              <p
                className="text-xs font-semibold tracking-[0.2em]"
                style={{
                  color: primaryColor,
                }}
              >
                BARBERÍA
              </p>

              <h1
                className="mt-3 text-3xl font-bold"
                style={{
                  color: primaryColor,
                }}
              >
                Distrito Barber
              </h1>

              <p
                className="mt-3 text-sm leading-6"
                style={{
                  opacity: 0.65,
                }}
              >
                Tu estilo. Tu corte. Tu momento.
              </p>

              {showAddress && (
                <p
                  className="mt-4 text-xs"
                  style={{
                    opacity: 0.55,
                  }}
                >
                  Av. San Martín 1234
                </p>
              )}

              {showPhone && (
                <p
                  className="mt-1 text-xs"
                  style={{
                    opacity: 0.55,
                  }}
                >
                  +54 261 555-1234
                </p>
              )}
            </div>

            {/* SERVICIOS */}
            <div className="p-6">
              <p
                className="text-xs font-semibold tracking-[0.2em]"
                style={{
                  color: primaryColor,
                }}
              >
                SERVICIOS
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Elegí tu servicio
              </h2>

              {/* SERVICE 1 */}
              <div
                className="mt-5 border p-4"
                style={{
                  borderColor: surfaceColor,
                  backgroundColor: surfaceColor,
                  borderRadius: radius,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">
                      Corte clásico
                    </h3>

                    <p
                      className="mt-2 text-xs"
                      style={{
                        opacity: 0.6,
                      }}
                    >
                      Corte de pelo tradicional.
                    </p>
                  </div>

                  {showPrices && (
                    <span
                      className="shrink-0 text-sm font-bold"
                      style={{
                        color: primaryColor,
                      }}
                    >
                      $8.000
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span
                    className="text-xs"
                    style={{
                      opacity: 0.5,
                    }}
                  >
                    30 min
                  </span>

                  <button
                    type="button"
                    className="px-4 py-2 text-xs font-semibold"
                    style={{
                      borderRadius: radius,
                      border: `2px solid ${primaryColor}`,
                      backgroundColor:
                        buttonStyle === "outline"
                          ? "transparent"
                          : primaryColor,
                      color:
                        buttonStyle === "outline"
                          ? primaryColor
                          : backgroundColor,
                    }}
                  >
                    Elegir
                  </button>
                </div>
              </div>

              {/* SERVICE 2 */}
              <div
                className="mt-3 border p-4"
                style={{
                  borderColor: surfaceColor,
                  backgroundColor: surfaceColor,
                  borderRadius: radius,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">
                      Corte + barba
                    </h3>

                    <p
                      className="mt-2 text-xs"
                      style={{
                        opacity: 0.6,
                      }}
                    >
                      Corte completo con perfilado.
                    </p>
                  </div>

                  {showPrices && (
                    <span
                      className="shrink-0 text-sm font-bold"
                      style={{
                        color: primaryColor,
                      }}
                    >
                      $12.000
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span
                    className="text-xs"
                    style={{
                      opacity: 0.5,
                    }}
                  >
                    45 min
                  </span>

                  <button
                    type="button"
                    className="px-4 py-2 text-xs font-semibold"
                    style={{
                      borderRadius: radius,
                      border: `2px solid ${primaryColor}`,
                      backgroundColor:
                        buttonStyle === "outline"
                          ? "transparent"
                          : primaryColor,
                      color:
                        buttonStyle === "outline"
                          ? primaryColor
                          : backgroundColor,
                    }}
                  >
                    Elegir
                  </button>
                </div>
              </div>

              {/* FOOTER */}
              <div
                className="mt-6 border-t pt-5 text-center"
                style={{
                  borderColor: surfaceColor,
                }}
              >
                <p
                  className="text-xs"
                  style={{
                    opacity: 0.45,
                  }}
                >
                  Reservá tu turno online
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorInput({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-stone-400">
        {label}
      </label>

      <div className="flex gap-3">
        <input
          type="color"
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded-lg border border-stone-700 bg-stone-800 p-1"
        />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} flex-1`}
        />
      </div>
    </div>
  );
}