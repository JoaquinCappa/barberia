export type BusinessThemeData = {
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

export const defaultBusinessTheme: BusinessThemeData = {
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

export function getThemeRadius(borderRadius: string) {
  switch (borderRadius) {
    case "none":
      return "0px";
    case "medium":
      return "0.5rem";
    case "xl":
      return "1.5rem";
    case "large":
    default:
      return "1rem";
  }
}

export function getThemeFont(fontFamily: string) {
  switch (fontFamily) {
    case "serif":
      return "Georgia, serif";
    case "mono":
      return "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    case "default":
    default:
      return "ui-sans-serif, system-ui, sans-serif";
  }
}