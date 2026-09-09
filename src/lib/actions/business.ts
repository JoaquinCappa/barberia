"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getBusinessId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) throw new Error("No autenticado o sin negocio.");
  return session.user.businessId;
}

export type ActionResult = { success: true } | { success: false; error: string };

export async function updateBusiness(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const businessId = await getBusinessId();
    await prisma.business.update({
      where: { id: businessId },
      data: {
        name: (formData.get("name") as string).trim(),
        description: (formData.get("description") as string | null)?.trim() || null,
        phone: (formData.get("phone") as string | null)?.trim() || null,
        email: (formData.get("email") as string | null)?.trim().toLowerCase() || null,
        address: (formData.get("address") as string | null)?.trim() || null,
        logoUrl: (formData.get("logoUrl") as string | null)?.trim() || null,
      },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido." };
  }
}
