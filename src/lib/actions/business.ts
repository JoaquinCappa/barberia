"use server";

import { put } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getBusinessId(): Promise<string> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.businessId) {
    throw new Error("No autenticado o sin negocio.");
  }

  return session.user.businessId;
}

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function updateBusiness(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const businessId = await getBusinessId();

    const name = (formData.get("name") as string).trim();

    if (!name) {
      return {
        success: false,
        error: "El nombre del negocio es obligatorio.",
      };
    }

    const maxSize = 5 * 1024 * 1024;

    // LOGO
    const logoFile = formData.get("logo");

    let logoUrl: string | undefined;

    if (logoFile instanceof File && logoFile.size > 0) {
      if (!logoFile.type.startsWith("image/")) {
        return {
          success: false,
          error: "El logo seleccionado no es una imagen.",
        };
      }

      if (logoFile.size > maxSize) {
        return {
          success: false,
          error: "El logo no puede superar los 5 MB.",
        };
      }

      const extension =
        logoFile.name.split(".").pop()?.toLowerCase() || "jpg";

      const blob = await put(
        `businesses/${businessId}/logo-${crypto.randomUUID()}.${extension}`,
        logoFile,
        {
          access: "public",
          addRandomSuffix: true,
        },
      );

      logoUrl = blob.url;
    }

    // BANNER
    const coverFile = formData.get("cover");

    let coverImageUrl: string | undefined;

    if (coverFile instanceof File && coverFile.size > 0) {
      if (!coverFile.type.startsWith("image/")) {
        return {
          success: false,
          error: "El banner seleccionado no es una imagen.",
        };
      }

      if (coverFile.size > maxSize) {
        return {
          success: false,
          error: "El banner no puede superar los 5 MB.",
        };
      }

      const extension =
        coverFile.name.split(".").pop()?.toLowerCase() || "jpg";

      const blob = await put(
        `businesses/${businessId}/cover-${crypto.randomUUID()}.${extension}`,
        coverFile,
        {
          access: "public",
          addRandomSuffix: true,
        },
      );

      coverImageUrl = blob.url;
    }

    await prisma.business.update({
      where: { id: businessId },
      data: {
        name,
        description:
          (formData.get("description") as string | null)?.trim() || null,
        phone:
          (formData.get("phone") as string | null)?.trim() || null,
        email:
          (formData.get("email") as string | null)
            ?.trim()
            .toLowerCase() || null,
        address:
          (formData.get("address") as string | null)?.trim() || null,

        ...(logoUrl ? { logoUrl } : {}),
        ...(coverImageUrl ? { coverImageUrl } : {}),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/reservar");

    return { success: true };
  } catch (e) {
    console.error("Error actualizando negocio:", e);

    return {
      success: false,
      error:
        e instanceof Error
          ? e.message
          : "Error desconocido.",
    };
  }
}