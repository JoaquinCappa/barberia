"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

function hexToRgb(hex: string) {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);

  const channels = [r, g, b].map((channel) => {
    const value = channel / 255;

    return value <= 0.04045
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });

  return (
    0.2126 * channels[0] +
    0.7152 * channels[1] +
    0.0722 * channels[2]
  );
}

function getContrastRatio(firstColor: string, secondColor: string): number {
  const firstLuminance = getRelativeLuminance(firstColor);
  const secondLuminance = getRelativeLuminance(secondColor);

  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function formatContrastRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}

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

    const primaryColor = String(
      formData.get("primaryColor") || "#fbbf24",
    );

    const backgroundColor = String(
      formData.get("backgroundColor") || "#0c0a09",
    );

    const surfaceColor = String(
      formData.get("surfaceColor") || "#1c1917",
    );

    const textColor = String(
      formData.get("textColor") || "#f5f5f4",
    );

    const borderRadius = String(
      formData.get("borderRadius") || "large",
    );

    const buttonStyle = String(
      formData.get("buttonStyle") || "filled",
    );

    const fontFamily = String(
      formData.get("fontFamily") || "default",
    );

    const showAddress = formData.get("showAddress") === "on";
    const showPhone = formData.get("showPhone") === "on";
    const showPrices = formData.get("showPrices") === "on";

    const colors = [
      primaryColor,
      backgroundColor,
      surfaceColor,
      textColor,
    ];

    for (const color of colors) {
      if (!HEX_COLOR_REGEX.test(color)) {
        return {
          success: false,
          error: "Uno de los colores no es válido.",
        };
      }
    }

    const backgroundContrast = getContrastRatio(
      backgroundColor,
      textColor,
    );

    if (backgroundContrast < 4.5) {
      return {
        success: false,
        error: `El contraste entre el fondo y el texto es insuficiente (${formatContrastRatio(
          backgroundContrast,
        )}). Debe ser de al menos 4.5:1.`,
      };
    }

    const surfaceContrast = getContrastRatio(
      surfaceColor,
      textColor,
    );

    if (surfaceContrast < 4.5) {
      return {
        success: false,
        error: `El contraste entre las tarjetas y el texto es insuficiente (${formatContrastRatio(
          surfaceContrast,
        )}). Debe ser de al menos 4.5:1.`,
      };
    }

    const primaryContrastWithBackground = getContrastRatio(
      primaryColor,
      backgroundColor,
    );

    const primaryContrastWithSurface = getContrastRatio(
      primaryColor,
      surfaceColor,
    );

    const bestPrimaryContrast = Math.max(
      primaryContrastWithBackground,
      primaryContrastWithSurface,
    );

    if (bestPrimaryContrast < 4.5) {
      return {
        success: false,
        error: `El color principal tiene poco contraste con el fondo o las tarjetas (${formatContrastRatio(
          bestPrimaryContrast,
        )}). Debe alcanzar al menos 4.5:1.`,
      };
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
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudieron guardar los cambios.",
    };
  }
}