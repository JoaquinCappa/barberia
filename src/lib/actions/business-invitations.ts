"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/admin";

export type InvitationResult =
  | { success: true; code: string; expiresAt: string }
  | { success: false; error: string };

export async function createBusinessInvitation(
  _prev: InvitationResult | null,
  formData: FormData,
): Promise<InvitationResult> {
  await requirePlatformAdmin();

  const rawEmail = (formData.get("email") as string | null)
    ?.trim()
    .toLowerCase();

  const email = rawEmail || null;
  const days = Number(formData.get("days") ?? "7");

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return {
      success: false,
      error: "Ingresá un email válido.",
    };
  }

  if (![1, 3, 7, 14, 30].includes(days)) {
    return {
      success: false,
      error: "El vencimiento seleccionado no es válido.",
    };
  }

  const code = crypto.randomBytes(18).toString("base64url");

  const expiresAt = new Date(
    Date.now() + days * 24 * 60 * 60 * 1000,
  );

  await prisma.businessInvitation.create({
    data: {
      code,
      email,
      expiresAt,
    },
  });

  revalidatePath("/admin/invitaciones");

  return {
    success: true,
    code,
    expiresAt: expiresAt.toISOString(),
  };
}