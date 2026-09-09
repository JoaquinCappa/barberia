"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export type SetupResult =
  | { success: true; slug: string }
  | { success: false; error: string };

/**
 * Creates a Business + its first admin User in a single transaction.
 *
 * /setup is intentionally open for MVP/development. To restrict to
 * authenticated admins in production, add a session check before this call
 * in the page's Server Action or route handler.
 */
export async function createBusinessWithOwner(
  _prev: SetupResult | null,
  formData: FormData,
): Promise<SetupResult> {
  const businessName = (formData.get("businessName") as string | null)?.trim();
  const ownerName = (formData.get("ownerName") as string | null)?.trim();
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = formData.get("password") as string | null;

  if (!businessName || !ownerName || !email || !password) {
    return { success: false, error: "Todos los campos son obligatorios." };
  }
  if (password.length < 8) {
    return { success: false, error: "La contraseña debe tener al menos 8 caracteres." };
  }

  // Check if the email is already in use
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "Ya existe una cuenta con ese email." };
  }

  // Generate a unique slug
  let slug = slugify(businessName);
  const slugExists = await prisma.business.findUnique({ where: { slug } });
  if (slugExists) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const business = await prisma.$transaction(async (tx) => {
      const biz = await tx.business.create({
        data: { name: businessName, slug },
      });
      await tx.user.create({
        data: {
          email,
          name: ownerName,
          passwordHash,
          businessId: biz.id,
        },
      });
      return biz;
    });

    return { success: true, slug: business.slug };
  } catch {
    return { success: false, error: "Error al crear el negocio. Intentá de nuevo." };
  }
}
