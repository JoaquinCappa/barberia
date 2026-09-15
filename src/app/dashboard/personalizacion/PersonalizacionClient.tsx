"use client";

import { useActionState, useMemo, useState } from "react";
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

type ContrastResult = {
  ratio: number;
  valid: boolean;
};

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

const inputClass =
  "h-10 w-full rounded-lg border border-stone-700 bg-stone-800 px-3 text-sm text-stone-100 focus:border-amber-400 focus:outline-none";

function hexToRgb(hex: string) {
  if (!HEX_COLOR_REGEX.test(hex)) {
    return null;
  }

  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

function getRelativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return null;
  }

  const channels = [rgb.r, rgb.g, rgb.b].map((channel) => {
    const value = channel / 255;

    return value <= 0.04045
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });

  return (
    0.2126 * channels[0] +
    0.7152 * channels[1] +
    0.0722 * channels[2]
  );
}

function getContrastRatio(
  firstColor: string,
  secondColor: string,
): number | null {
  const firstLuminance = getRelativeLuminance(firstColor);
  const secondLuminance = getRelativeLuminance(secondColor);

  if (firstLuminance === null || secondLuminance === null) {
    return null;
  }

  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function formatRatio(ratio: number | null) {
  return ratio === null ? "—" : `${ratio.toFixed(2)}:1`;
}

function getBestTextColor(background: string) {
  const whiteContrast = getContrastRatio(background, "#ffffff") ?? 0;
  const darkContrast = getContrastRatio(background, "#171717") ?? 0;

  return whiteContrast >= darkContrast ? "#ffffff" : "#171717";
}

function isValidColor(color: string) {
  return HEX_COLOR_REGEX.test(color);
}

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

  const [textColor, setTextColor] = useState(initialTheme.textColor);

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

  const [showPhone, setShowPhone] = useState(initialTheme.showPhone);

  const [showPrices, setShowPrices] = useState(
    initialTheme.showPrices,
  );

  const backgroundContrast = useMemo(
    () => getContrastRatio(backgroundColor, textColor),
    [backgroundColor, textColor],
  );

  const surfaceContrast = useMemo(
    () => getContrastRatio(surfaceColor, textColor),
    [surfaceColor, textColor],
  );

  const primaryContrastWithBackground = useMemo(
    () => getContrastRatio(primaryColor, backgroundColor),
    [primaryColor, backgroundColor],
  );

  const primaryContrastWithSurface = useMemo(
    () => getContrastRatio(primaryColor, surfaceColor),
    [primaryColor, surfaceColor],
  );

  const primaryContrast = Math.max(
    primaryContrastWithBackground ?? 0,
    primaryContrastWithSurface ?? 0,
  );

  const buttonTextColor = useMemo(
    () => getBestTextColor(primaryColor),
    [primaryColor],
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

  const colorsAreValid =
    isValidColor(primaryColor) &&
    isValidColor(backgroundColor) &&
    isValidColor(surfaceColor) &&
    isValidColor(textColor);

  const contrastIsValid =
    backgroundContrast !== null &&
    backgroundContrast >= 4.5 &&
    surfaceContrast !== null &&
    surfaceContrast >= 4.5 &&
    primaryContrast >= 4.5;

  const canSave = colorsAreValid && contrastIsValid && !pending;

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Personalización</h1>

        <p className="mt-2 text-sm text-stone-500">
          Personalizá la apariencia de la página pública de tu barbería.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_480px]">
        <form action={formAction}>
          <div className="sticky top-4 z-30 mb-6 flex items-center justify-between gap-4 rounded-xl border border-stone-800 bg-stone-950/95 p-5 shadow-lg backdrop-blur">
          <div>
            <h2 className="text-base font-semibold text-stone-100">
              Personalización de tu barbería
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Los cambios se aplican a la página pública.
            </p>
          </div>

          <button
            type="submit"
            disabled={!canSave}
            className="shrink-0 rounded-xl bg-amber-400 px-5 py-3 font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

          <section className="rounded-xl border border-stone-800 bg-stone-900 p-6">
            <h2 className="font-semibold">Colores</h2>

            <p className="mt-1 text-sm text-stone-500">
              Elegí los colores de tu marca. La plataforma verifica la
              legibilidad antes de guardar.
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

            <div className="mt-6 space-y-3 rounded-lg border border-stone-800 bg-stone-950 p-4">
              <h3 className="text-sm font-semibold text-stone-200">
                Comprobación de contraste
              </h3>

              <ContrastRow
                label="Fondo y texto"
                ratio={backgroundContrast}
                minimum={4.5}
              />

              <ContrastRow
                label="Tarjetas y texto"
                ratio={surfaceContrast}
                minimum={4.5}
              />

              <ContrastRow
                label="Color principal y fondos"
                ratio={primaryContrast}
                minimum={4.5}
              />

              {!colorsAreValid && (
                <p className="text-xs text-red-400">
                  Todos los colores deben tener formato HEX válido, por
                  ejemplo: #FBBF24.
                </p>
              )}

              {colorsAreValid && !contrastIsValid && (
                <p className="text-xs text-red-400">
                  No podés guardar esta combinación porque algunos textos
                  podrían ser ilegibles. Cambiá el fondo, las tarjetas o el
                  color del texto.
                </p>
              )}

              {colorsAreValid && contrastIsValid && (
                <p className="text-xs text-green-400">
                  La combinación de colores cumple los mínimos de contraste.
                </p>
              )}
            </div>
          </section>

          <section className="mt-6 rounded-xl border border-stone-800 bg-stone-900 p-6">
            <h2 className="font-semibold">Estilo</h2>

            <p className="mt-1 text-sm text-stone-500">
              Definí cómo se ven los elementos.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm text-stone-400">
                  Bordes
                </label>

                <select
                  name="borderRadius"
                  value={borderRadius}
                  onChange={(event) =>
                    setBorderRadius(event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="none">Cuadrados</option>
                  <option value="medium">Medios</option>
                  <option value="large">Redondeados</option>
                  <option value="xl">Muy redondeados</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-stone-400">
                  Botones
                </label>

                <select
                  name="buttonStyle"
                  value={buttonStyle}
                  onChange={(event) =>
                    setButtonStyle(event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="filled">Rellenos</option>
                  <option value="outline">Contorno</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-stone-400">
                  Tipografía
                </label>

                <select
                  name="fontFamily"
                  value={fontFamily}
                  onChange={(event) =>
                    setFontFamily(event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="default">Predeterminada</option>
                  <option value="serif">Elegante</option>
                  <option value="mono">Monoespaciada</option>
                </select>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-xl border border-stone-800 bg-stone-900 p-6">
            <h2 className="font-semibold">Información visible</h2>

            <p className="mt-1 text-sm text-stone-500">
              Elegí qué información mostrar en tu página.
            </p>

            <div className="mt-6 space-y-4">
              <CheckOption
                name="showAddress"
                checked={showAddress}
                onChange={setShowAddress}
                label="Mostrar dirección"
              />

              <CheckOption
                name="showPhone"
                checked={showPhone}
                onChange={setShowPhone}
                label="Mostrar teléfono"
              />

              <CheckOption
                name="showPrices"
                checked={showPrices}
                onChange={setShowPrices}
                label="Mostrar precios"
              />
            </div>
          </section>

          {state && !state.success && (
            <p className="mt-4 text-sm text-red-400">{state.error}</p>
          )}

          {state?.success && (
            <p className="mt-4 text-sm text-green-400">
              Cambios guardados correctamente.
            </p>
          )}

        </form>

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
                  color: textColor,
                }}
              >
                Tu estilo. Tu corte. Tu momento.
              </p>

              {showAddress && (
                <p
                  className="mt-4 text-xs"
                  style={{
                    color: textColor,
                  }}
                >
                  Av. San Martín 1234
                </p>
              )}

              {showPhone && (
                <p
                  className="mt-1 text-xs"
                  style={{
                    color: textColor,
                  }}
                >
                  +54 261 555-1234
                </p>
              )}
            </div>

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

              <PreviewService
                title="Corte clásico"
                description="Corte de pelo tradicional."
                duration="30 min"
                price="$8.000"
                showPrice={showPrices}
                backgroundColor={surfaceColor}
                textColor={textColor}
                primaryColor={primaryColor}
                buttonStyle={buttonStyle}
                buttonTextColor={buttonTextColor}
                radius={radius}
              />

              <PreviewService
                title="Corte + barba"
                description="Corte completo con perfilado."
                duration="45 min"
                price="$12.000"
                showPrice={showPrices}
                backgroundColor={surfaceColor}
                textColor={textColor}
                primaryColor={primaryColor}
                buttonStyle={buttonStyle}
                buttonTextColor={buttonTextColor}
                radius={radius}
              />

              <div
                className="mt-6 border-t pt-5 text-center"
                style={{
                  borderColor: surfaceColor,
                }}
              >
                <p
                  className="text-xs"
                  style={{
                    color: textColor,
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
  const valid = isValidColor(value);

  return (
    <div>
      <label className="mb-2 block text-sm text-stone-400">
        {label}
      </label>

      <div className="flex gap-3">
        <input
          type="color"
          value={valid ? value : "#000000"}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-14 cursor-pointer rounded-lg border border-stone-700 bg-stone-800 p-1"
          aria-label={`Seleccionar ${label.toLowerCase()}`}
        />

        <input
          type="text"
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} flex-1 ${
            valid ? "" : "border-red-500"
          }`}
          placeholder="#FBBF24"
          aria-invalid={!valid}
        />
      </div>

      {!valid && (
        <p className="mt-1 text-xs text-red-400">
          Ingresá un color HEX válido.
        </p>
      )}
    </div>
  );
}

function ContrastRow({
  label,
  ratio,
  minimum,
}: {
  label: string;
  ratio: number | null;
  minimum: number;
}) {
  const valid = ratio !== null && ratio >= minimum;

  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="text-stone-400">{label}</span>

      <span className={valid ? "text-green-400" : "text-red-400"}>
        {formatRatio(ratio)} {valid ? "✓" : `✕ mínimo ${minimum}:1`}
      </span>
    </div>
  );
}

function CheckOption({
  name,
  checked,
  onChange,
  label,
}: {
  name: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-amber-400"
      />

      <span className="text-sm text-stone-300">{label}</span>
    </label>
  );
}

function PreviewService({
  title,
  description,
  duration,
  price,
  showPrice,
  backgroundColor,
  textColor,
  primaryColor,
  buttonStyle,
  buttonTextColor,
  radius,
}: {
  title: string;
  description: string;
  duration: string;
  price: string;
  showPrice: boolean;
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  buttonStyle: string;
  buttonTextColor: string;
  radius: string;
}) {
  return (
    <div
      className="mt-5 border p-4"
      style={{
        borderColor: primaryColor,
        backgroundColor,
        borderRadius: radius,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{title}</h3>

          <p
            className="mt-2 text-xs"
            style={{
              color: textColor,
            }}
          >
            {description}
          </p>
        </div>

        {showPrice && (
          <span
            className="shrink-0 text-sm font-bold"
            style={{
              color: primaryColor,
            }}
          >
            {price}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span
          className="text-xs"
          style={{
            color: textColor,
          }}
        >
          {duration}
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
                : buttonTextColor,
          }}
        >
          Elegir
        </button>
      </div>
    </div>
  );
}