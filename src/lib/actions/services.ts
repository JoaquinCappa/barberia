"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

async function getBusinessId(): Promise<string> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.businessId) {
    throw new Error("No autenticado o sin negocio.");
  }

  return session.user.businessId;
}

function getServiceData(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();

  const price = Number(formData.get("price"));
  const durationMinutes = Number(formData.get("duration"));

  const priceInCents = Math.round(price * 100);

  return {
    name,
    priceInCents,
    durationMinutes,
    description:
      String(formData.get("description") ?? "").trim() || null,
  };
}

export async function createService(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const businessId = await getBusinessId();

    const {
      name,
      description,
      priceInCents,
      durationMinutes,
    } = getServiceData(formData);

    if (!name) {
      return {
        success: false,
        error: "El nombre del servicio es obligatorio.",
      };
    }

    if (!Number.isFinite(priceInCents) || priceInCents < 0) {
      return {
        success: false,
        error: "El precio no es válido.",
      };
    }

    if (
      !Number.isFinite(durationMinutes) ||
      durationMinutes < 5 ||
      durationMinutes % 5 !== 0
    ) {
      return {
        success: false,
        error: "La duración debe ser de al menos 5 minutos y múltiplo de 5.",
      };
    }

    await prisma.service.create({
      data: {
        businessId,
        name,
        description,
        priceInCents,
        durationMinutes,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/servicios");

    return { success: true };
  } catch (error) {
    console.error("createService:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo crear el servicio.",
    };
  }
}

export async function updateService(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const businessId = await getBusinessId();

    const id = String(formData.get("id") ?? "");

    if (!id) {
      return {
        success: false,
        error: "Servicio inválido.",
      };
    }

    const {
      name,
      description,
      priceInCents,
      durationMinutes,
    } = getServiceData(formData);

    if (!name) {
      return {
        success: false,
        error: "El nombre del servicio es obligatorio.",
      };
    }

    if (!Number.isFinite(priceInCents) || priceInCents < 0) {
      return {
        success: false,
        error: "El precio no es válido.",
      };
    }

    if (
      !Number.isFinite(durationMinutes) ||
      durationMinutes < 5 ||
      durationMinutes % 5 !== 0
    ) {
      return {
        success: false,
        error: "La duración debe ser de al menos 5 minutos y múltiplo de 5.",
      };
    }

    const isActive = formData.get("isActive") !== "false";

    const result = await prisma.service.updateMany({
      where: {
        id,
        businessId,
      },
      data: {
        name,
        description,
        priceInCents,
        durationMinutes,
        isActive,
      },
    });

    if (result.count === 0) {
      return {
        success: false,
        error: "No se encontró el servicio.",
      };
    }

    revalidatePath("/dashboard/servicios");

    return { success: true };
  } catch (error) {
    console.error("updateService:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el servicio.",
    };
  }
}

export async function setServiceActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  try {
    const businessId = await getBusinessId();

    if (!id) {
      return {
        success: false,
        error: "Servicio inválido.",
      };
    }

    const result = await prisma.service.updateMany({
      where: {
        id,
        businessId,
      },
      data: {
        isActive,
      },
    });

    if (result.count === 0) {
      return {
        success: false,
        error: "No se encontró el servicio.",
      };
    }

    revalidatePath("/dashboard/servicios");

    return { success: true };
  } catch (error) {
    console.error("setServiceActive:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado.",
    };
  }
}

export async function deleteService(
  id: string,
): Promise<ActionResult> {
  return setServiceActive(id, false);
}