"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { updateBusiness } from "@/lib/actions/business";

type Business = {
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
};

type CropType = "logo" | "cover";

const inputClass =
  "h-10 w-full rounded-lg border border-stone-700 bg-stone-800 px-3 text-sm text-stone-100 focus:border-amber-400 focus:outline-none";

function ImageCropper({
  type,
  file,
  onCancel,
  onConfirm,
}: {
  type: CropType;
  file: File;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const isLogo = type === "logo";
  const canvasWidth = 800;
  const canvasHeight = isLogo ? 800 : 450;

  useEffect(() => {
    const url = URL.createObjectURL(file);

    setImageUrl(url);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  useEffect(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;

    if (!image || !canvas || !imageUrl) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const drawImage = () => {
      const sourceWidth = image.naturalWidth;
      const sourceHeight = image.naturalHeight;

      if (!sourceWidth || !sourceHeight) {
        return;
      }

      const scale = Math.max(
        canvasWidth / sourceWidth,
        canvasHeight / sourceHeight,
      );

      const renderedWidth = sourceWidth * scale * zoom;
      const renderedHeight = sourceHeight * scale * zoom;

      const x =
        (canvasWidth - renderedWidth) / 2 +
        offsetX * canvasWidth;

      const y =
        (canvasHeight - renderedHeight) / 2 +
        offsetY * canvasHeight;

      context.clearRect(0, 0, canvasWidth, canvasHeight);

      context.fillStyle = "#171717";
      context.fillRect(0, 0, canvasWidth, canvasHeight);

      context.drawImage(
        image,
        x,
        y,
        renderedWidth,
        renderedHeight,
      );
    };

    if (image.complete) {
      drawImage();
    } else {
      image.onload = drawImage;
    }

    return () => {
      image.onload = null;
    };
  }, [
    imageUrl,
    zoom,
    offsetX,
    offsetY,
    canvasWidth,
    canvasHeight,
  ]);

  function handlePointerDown(
    event: PointerEvent<HTMLCanvasElement>,
  ) {
    setDragging(true);

    setDragStart({
      x: event.clientX,
      y: event.clientY,
    });

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(
    event: PointerEvent<HTMLCanvasElement>,
  ) {
    if (!dragging) {
      return;
    }

    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;

    setOffsetX((current) =>
      Math.max(-1, Math.min(1, current + deltaX / 400)),
    );

    setOffsetY((current) =>
      Math.max(-1, Math.min(1, current + deltaY / 400)),
    );

    setDragStart({
      x: event.clientX,
      y: event.clientY,
    });
  }

  function handlePointerUp() {
    setDragging(false);
  }

  function handleConfirm() {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          return;
        }

        const croppedFile = new File(
          [blob],
          `${type}-recortado.jpg`,
          {
            type: "image/jpeg",
            lastModified: Date.now(),
          },
        );

        onConfirm(croppedFile);
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-amber-400/40 bg-stone-950 p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-stone-100">
          Recortar {isLogo ? "logo" : "imagen de presentación"}
        </h3>

        <p className="mt-1 text-sm text-stone-500">
          Arrastrá la imagen para acomodarla y ajustá el zoom.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-stone-700 bg-stone-900">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Imagen para recortar"
          className="hidden"
        />

        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="block h-auto w-full cursor-move touch-none"
        />
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-sm text-stone-400">
          <label htmlFor={`${type}-zoom`}>Zoom</label>
          <span>{zoom.toFixed(1)}x</span>
        </div>

        <input
          id={`${type}-zoom`}
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
          className="w-full accent-amber-400"
        />
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-stone-700 px-4 py-2 text-sm font-semibold text-stone-300 transition hover:bg-stone-800"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-300"
        >
          Confirmar recorte
        </button>
      </div>
    </div>
  );
}

export default function NegocioClient({
  initialBusiness,
}: {
  initialBusiness: Business;
}) {
  const [state, formAction, pending] = useActionState(
    updateBusiness,
    null,
  );

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [cropType, setCropType] = useState<CropType | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  function setFileInput(
    input: HTMLInputElement | null,
    file: File | null,
  ) {
    if (!input) {
      return;
    }

    const dataTransfer = new DataTransfer();

    if (file) {
      dataTransfer.items.add(file);
    }

    input.files = dataTransfer.files;
  }

  function openCropper(type: CropType, file: File) {
    setCropType(type);
    setCropFile(file);
  }

  function handleCropConfirm(file: File) {
    if (cropType === "logo") {
      setLogoFile(file);
      setFileInput(logoInputRef.current, file);
    }

    if (cropType === "cover") {
      setCoverFile(file);
      setFileInput(coverInputRef.current, file);
    }

    setCropType(null);
    setCropFile(null);
  }

  function handleCropCancel() {
    setCropType(null);
    setCropFile(null);
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <p className="text-sm font-semibold tracking-[0.2em] text-amber-400">
          NEGOCIO
        </p>

        <h1 className="mt-2 text-2xl font-semibold">
          Datos de tu barbería
        </h1>

        <p className="mt-2 text-sm text-stone-500">
          Actualizá la información que aparece en tu página pública.
        </p>
      </div>

      <form action={formAction}>
        <div className="rounded-xl border border-stone-800 bg-stone-900 p-6">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-stone-400">
                Nombre
              </label>

              <input
                type="text"
                name="name"
                required
                defaultValue={initialBusiness.name}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-stone-400">
                Descripción
              </label>

              <textarea
                name="description"
                rows={4}
                defaultValue={initialBusiness.description ?? ""}
                className="w-full resize-none rounded-lg border border-stone-700 bg-stone-800 px-3 py-3 text-sm text-stone-100 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-stone-400">
                Teléfono
              </label>

              <input
                type="tel"
                name="phone"
                defaultValue={initialBusiness.phone ?? ""}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-stone-400">
                Email
              </label>

              <input
                type="email"
                name="email"
                defaultValue={initialBusiness.email ?? ""}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-stone-400">
                Dirección
              </label>

              <input
                type="text"
                name="address"
                defaultValue={initialBusiness.address ?? ""}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-stone-400">
                Logo
              </label>

              {initialBusiness.logoUrl && !logoFile && (
                <div className="mb-3">
                  <img
                    src={initialBusiness.logoUrl}
                    alt="Logo actual"
                    className="h-24 w-24 rounded-full border border-stone-700 object-cover"
                  />
                </div>
              )}

              {logoFile && (
                <div className="mb-3">
                  <img
                    src={URL.createObjectURL(logoFile)}
                    alt="Logo recortado"
                    className="h-24 w-24 rounded-full border border-amber-400 object-cover"
                  />
                </div>
              )}

              <input
                ref={logoInputRef}
                type="file"
                name="logo"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    openCropper("logo", file);
                  }
                }}
                className="block w-full cursor-pointer rounded-lg border border-stone-700 bg-stone-800 text-sm text-stone-300 file:mr-4 file:border-0 file:bg-amber-400 file:px-4 file:py-2.5 file:font-semibold file:text-stone-950 hover:file:bg-amber-300"
              />

              <p className="mt-2 text-xs text-stone-500">
                El logo se recorta en formato cuadrado.
              </p>

              {cropType === "logo" && cropFile && (
                <ImageCropper
                  type="logo"
                  file={cropFile}
                  onCancel={handleCropCancel}
                  onConfirm={handleCropConfirm}
                />
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm text-stone-400">
                Imagen de presentación
              </label>

              {initialBusiness.coverImageUrl && !coverFile && (
                <div className="mb-3">
                  <img
                    src={initialBusiness.coverImageUrl}
                    alt="Imagen de presentación actual"
                    className="h-40 w-full rounded-xl border border-stone-700 object-cover"
                  />
                </div>
              )}

              {coverFile && (
                <div className="mb-3">
                  <img
                    src={URL.createObjectURL(coverFile)}
                    alt="Portada recortada"
                    className="h-40 w-full rounded-xl border border-amber-400 object-cover"
                  />
                </div>
              )}

              <input
                ref={coverInputRef}
                type="file"
                name="cover"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    openCropper("cover", file);
                  }
                }}
                className="block w-full cursor-pointer rounded-lg border border-stone-700 bg-stone-800 text-sm text-stone-300 file:mr-4 file:border-0 file:bg-amber-400 file:px-4 file:py-2.5 file:font-semibold file:text-stone-950 hover:file:bg-amber-300"
              />

              <p className="mt-2 text-xs text-stone-500">
                La portada se recorta en formato 16:9. Máximo 5 MB.
              </p>

              {cropType === "cover" && cropFile && (
                <ImageCropper
                  type="cover"
                  file={cropFile}
                  onCancel={handleCropCancel}
                  onConfirm={handleCropConfirm}
                />
              )}
            </div>
          </div>
        </div>

        {state && !state.success && (
          <p className="mt-4 text-sm text-red-400">{state.error}</p>
        )}

        {state?.success && (
          <p className="mt-4 text-sm text-green-400">
            Cambios guardados correctamente.
          </p>
        )}

        <button
          type="submit"
          disabled={pending || cropType !== null}
          className="mt-6 rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}