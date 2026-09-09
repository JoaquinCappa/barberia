import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PersonalizacionClient from "./PersonalizacionClient";

export default async function PersonalizacionPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.businessId) {
    redirect("/login");
  }

  const theme = await prisma.businessTheme.findUnique({
    where: {
      businessId: session.user.businessId,
    },
  });

  const initialTheme = {
    primaryColor: theme?.primaryColor ?? "#fbbf24",
    backgroundColor: theme?.backgroundColor ?? "#0c0a09",
    surfaceColor: theme?.surfaceColor ?? "#1c1917",
    textColor: theme?.textColor ?? "#f5f5f4",
    borderRadius: theme?.borderRadius ?? "large",
    buttonStyle: theme?.buttonStyle ?? "filled",
    fontFamily: theme?.fontFamily ?? "default",
    showAddress: theme?.showAddress ?? true,
    showPhone: theme?.showPhone ?? true,
    showPrices: theme?.showPrices ?? true,
  };

  return <PersonalizacionClient initialTheme={initialTheme} />;
}