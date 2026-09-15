"use server";

import { del, put } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_PHOTOS = 8;
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type ActionResult = { success: true } | { success: false; error: string };

async function getBusinessId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) throw new Error("No autenticado o sin negocio.");
  return session.user.businessId;
}

export async function addBusinessPhoto(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const businessId = await getBusinessId();

    // Check current count
    const count = await prisma.businessPhoto.count({ where: { businessId } });
    if (count >= MAX_PHOTOS) {
      return { success: false, error: `El máximo es ${MAX_PHOTOS} fotos para la galería.` };
    }

    const file = formData.get("photo");
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: "Seleccioná una imagen." };
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: "Solo se aceptan JPG, PNG y WEBP." };
    }
    if (file.size > MAX_SIZE) {
      return { success: false, error: "La imagen no puede superar los 5 MB." };
    }

    const caption = (formData.get("caption") as string | null)?.trim() || null;
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";

    const blob = await put(
      `businesses/${businessId}/gallery/${crypto.randomUUID()}.${ext}`,
      file,
      { access: "public", addRandomSuffix: true },
    );

    await prisma.businessPhoto.create({
      data: {
        businessId,
        url: blob.url,
        caption,
        sortOrder: count,
      },
    });

    revalidatePath("/dashboard/negocio");
    revalidatePath(`/reservar`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error al subir la foto." };
  }
}

export async function deleteBusinessPhoto(photoId: string): Promise<ActionResult> {
  try {
    const businessId = await getBusinessId();

    const photo = await prisma.businessPhoto.findFirst({
      where: { id: photoId, businessId },
    });
    if (!photo) return { success: false, error: "Foto no encontrada." };

    // Delete from Vercel Blob first
    try {
      await del(photo.url);
    } catch {
      // Non-fatal: continue deleting from DB even if Blob deletion fails
    }

    await prisma.businessPhoto.delete({ where: { id: photoId } });

    revalidatePath("/dashboard/negocio");
    revalidatePath(`/reservar`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error al eliminar la foto." };
  }
}

