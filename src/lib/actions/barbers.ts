"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionResult = { success: true } | { success: false; error: string };

async function getBusinessId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) throw new Error("No autenticado o sin negocio.");
  return session.user.businessId;
}

export async function createBarber(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const businessId = await getBusinessId();
    const name = (formData.get("name") as string).trim();
    if (!name) return { success: false, error: "El nombre es obligatorio." };

    await prisma.barber.create({
      data: {
        businessId,
        name,
        bio: (formData.get("bio") as string | null)?.trim() || null,
        imageUrl: (formData.get("imageUrl") as string | null)?.trim() || null,
      },
    });
    revalidatePath("/dashboard/profesionales");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error." };
  }
}

export async function updateBarber(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const businessId = await getBusinessId();
    const id = formData.get("id") as string;
    await prisma.barber.updateMany({
      where: { id, businessId },
      data: {
        name: (formData.get("name") as string).trim(),
        bio: (formData.get("bio") as string | null)?.trim() || null,
        imageUrl: (formData.get("imageUrl") as string | null)?.trim() || null,
        isActive: formData.get("isActive") !== "false",
      },
    });
    revalidatePath("/dashboard/profesionales");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error." };
  }
}

export async function deleteBarber(id: string): Promise<ActionResult> {
  try {
    const businessId = await getBusinessId();
    await prisma.barber.updateMany({
      where: { id, businessId },
      data: { isActive: false },
    });
    revalidatePath("/dashboard/profesionales");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error." };
  }
}
