import { prisma } from "@/lib/prisma";

export type PublicTheme = {
  primaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderRadius: string;
  buttonStyle: string;
  fontFamily: string;
  showAddress: boolean;
  showPhone: boolean;
  showPrices: boolean;
};

const defaultTheme: PublicTheme = {
  primaryColor: "#fbbf24",
  backgroundColor: "#0c0a09",
  surfaceColor: "#1c1917",
  textColor: "#f5f5f4",
  borderRadius: "large",
  buttonStyle: "filled",
  fontFamily: "default",
  showAddress: true,
  showPhone: true,
  showPrices: true,
};

export async function getPublicTheme(
  businessId: string,
): Promise<PublicTheme> {
  const theme = await prisma.businessTheme.findUnique({
    where: {
      businessId,
    },
  });

  if (!theme) {
    return defaultTheme;
  }

  return {
    primaryColor: theme.primaryColor,
    backgroundColor: theme.backgroundColor,
    surfaceColor: theme.surfaceColor,
    textColor: theme.textColor,
    borderRadius: theme.borderRadius,
    buttonStyle: theme.buttonStyle,
    fontFamily: theme.fontFamily,
    showAddress: theme.showAddress,
    showPhone: theme.showPhone,
    showPrices: theme.showPrices,
  };
}

export function getThemeStyle(theme: PublicTheme) {
  return {
    "--public-primary": theme.primaryColor,
    "--public-background": theme.backgroundColor,
    "--public-surface": theme.surfaceColor,
    "--public-text": theme.textColor,
  } as React.CSSProperties;
}

export function getRadiusClass(borderRadius: string) {
  switch (borderRadius) {
    case "none":
      return "rounded-none";

    case "medium":
      return "rounded-lg";

    case "large":
      return "rounded-2xl";

    case "xl":
      return "rounded-3xl";

    default:
      return "rounded-2xl";
  }
}