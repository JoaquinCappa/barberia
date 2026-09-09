"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type CustomerRegisterResult =
  | {
      success: true;
      email: string;
      password: string;
    }
  | {
      success: false;
      error: string;
    };

export async function registerCustomer(
  _prev: CustomerRegisterResult | null,
  formData: FormData,
): Promise<CustomerRegisterResult> {
  const name = (formData.get("name") as string | null)?.trim();
  const email = (formData.get("email") as string | null)
    ?.trim()
    .toLowerCase();
  const phone = (formData.get("phone") as string | null)?.trim();
  const password = formData.get("password") as string | null;

  if (!name || !email || !phone || !password) {
    return {
      success: false,
      error: "Todos los campos son obligatorios.",
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      error: "La contraseña debe tener al menos 8 caracteres.",
    };
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return {
      success: false,
      error: "Ya existe una cuenta con ese email.",
    };
  }

  const existingPhone = await prisma.user.findUnique({
    where: { phone },
  });

  if (existingPhone) {
    return {
      success: false,
      error: "Ya existe una cuenta con ese número de teléfono.",
    };
  } 

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        role: "CUSTOMER",
      },
    });

    return {
      success: true,
      email,
      password,
    };
  } catch {
    return {
      success: false,
      error: "No se pudo crear la cuenta. Intentá nuevamente.",
    };
  }
}