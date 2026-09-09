"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type BusinessRegisterResult =
  | { success: true }
  | { success: false; error: string };

export async function registerBusiness(
  _prev: BusinessRegisterResult | null,
  formData: FormData,
): Promise<BusinessRegisterResult> {
  const code = (formData.get("code") as string | null)?.trim();

  const ownerName = (formData.get("ownerName") as string | null)?.trim();

  const email = (formData.get("email") as string | null)
    ?.trim()
    .toLowerCase();

  const phone = (formData.get("phone") as string | null)?.trim();

  const password = formData.get("password") as string | null;

  const businessName = (
    formData.get("businessName") as string | null
  )?.trim();

  const slug = (formData.get("slug") as string | null)
    ?.trim()
    .toLowerCase();

  const address = (formData.get("address") as string | null)?.trim();

  if (
    !code ||
    !ownerName ||
    !email ||
    !phone ||
    !password ||
    !businessName ||
    !slug
  ) {
    return {
      success: false,
      error: "Completá todos los campos obligatorios.",
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      error: "La contraseña debe tener al menos 8 caracteres.",
    };
  }

  // Validar invitación
  const invitation = await prisma.businessInvitation.findUnique({
    where: {
      code,
    },
  });

  if (!invitation) {
    return {
      success: false,
      error: "La invitación no es válida.",
    };
  }

  if (invitation.usedAt) {
    return {
      success: false,
      error: "Esta invitación ya fue utilizada.",
    };
  }

  if (invitation.expiresAt < new Date()) {
    return {
      success: false,
      error: "Esta invitación expiró.",
    };
  }

  // Si la invitación tiene email, debe coincidir
  if (invitation.email && invitation.email.toLowerCase() !== email) {
    return {
      success: false,
      error: "El email no coincide con el de la invitación.",
    };
  }

  // Verificar email existente
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return {
      success: false,
      error: "Ya existe una cuenta con ese email.",
    };
  }

  // Verificar slug
  const existingBusiness = await prisma.business.findUnique({
    where: {
      slug,
    },
  });

  if (existingBusiness) {
    return {
      success: false,
      error: "Ese identificador de negocio ya está ocupado.",
    };
  }

  // Verificar teléfono
  const existingPhone = await prisma.user.findUnique({
    where: {
      phone,
    },
  });

  if (existingPhone) {
    return {
      success: false,
      error: "Ya existe una cuenta con ese teléfono.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          name: businessName,
          slug,
          address: address || null,
          phone,
          email,
        },
      });

      await tx.user.create({
        data: {
          name: ownerName,
          email,
          phone,
          passwordHash,
          role: "ADMIN",
          businessId: business.id,
        },
      });

      await tx.businessInvitation.update({
        where: {
          id: invitation.id,
        },
        data: {
          usedAt: new Date(),
        },
      });
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error registrando negocio:", error);

    return {
      success: false,
      error: "No se pudo crear el negocio. Intentá nuevamente.",
    };
  }
}