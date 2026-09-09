import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicBusinessLayout({
  children,
  params,
}: Props) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      theme: true,
    },
  });

  if (!business) {
    notFound();
  }

  const theme = business.theme;

  const primaryColor = theme?.primaryColor ?? "#fbbf24";
  const backgroundColor = theme?.backgroundColor ?? "#0c0a09";
  const surfaceColor = theme?.surfaceColor ?? "#1c1917";
  const textColor = theme?.textColor ?? "#f5f5f4";

  return (
    <div
      style={
        {
          "--theme-primary": primaryColor,
          "--theme-background": backgroundColor,
          "--theme-surface": surfaceColor,
          "--theme-text": textColor,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}