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

export async function updateBusinessTheme(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const businessId = await getBusinessId();

    const primaryColor =
      String(formData.get("primaryColor") || "#fbbf24");

    const backgroundColor =
      String(formData.get("backgroundColor") || "#0c0a09");

    const surfaceColor =
      String(formData.get("surfaceColor") || "#1c1917");

    const textColor =
      String(formData.get("textColor") || "#f5f5f4");

    const borderRadius =
      String(formData.get("borderRadius") || "large");

    const buttonStyle =
      String(formData.get("buttonStyle") || "filled");

    const fontFamily =
      String(formData.get("fontFamily") || "default");

    const showAddress =
      formData.get("showAddress") === "on";

    const showPhone =
      formData.get("showPhone") === "on";

    const showPrices =
      formData.get("showPrices") === "on";

    const colors = [
      primaryColor,
      backgroundColor,
      surfaceColor,
      textColor,
    ];

    for (const color of colors) {
      if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        return {
          success: false,
          error: "Uno de los colores no es válido.",
        };
      }
    }

    const validBorderRadius = [
      "none",
      "medium",
      "large",
      "xl",
    ];

    const validButtonStyles = [
      "filled",
      "outline",
    ];

    const validFonts = [
      "default",
      "serif",
      "mono",
    ];

    if (!validBorderRadius.includes(borderRadius)) {
      return {
        success: false,
        error: "Estilo de bordes inválido.",
      };
    }

    if (!validButtonStyles.includes(buttonStyle)) {
      return {
        success: false,
        error: "Estilo de botones inválido.",
      };
    }

    if (!validFonts.includes(fontFamily)) {
      return {
        success: false,
        error: "Tipografía inválida.",
      };
    }

    await prisma.businessTheme.upsert({
      where: {
        businessId,
      },

      create: {
        businessId,
        primaryColor,
        backgroundColor,
        surfaceColor,
        textColor,
        borderRadius,
        buttonStyle,
        fontFamily,
        showAddress,
        showPhone,
        showPrices,
      },

      update: {
        primaryColor,
        backgroundColor,
        surfaceColor,
        textColor,
        borderRadius,
        buttonStyle,
        fontFamily,
        showAddress,
        showPhone,
        showPrices,
      },
    });

    revalidatePath("/dashboard/personalizacion");
    revalidatePath("/reservar", "layout");

    return {
      success: true,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error.",
    };
  }
}