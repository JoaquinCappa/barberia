import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HorariosClient from "./HorariosClient";

function dateToTimeString(d: Date): string {
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export default async function HorariosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) redirect("/login");

  const businessHours = await prisma.businessHours.findMany({
    where: { businessId: session.user.businessId },
  });

  return (
    <HorariosClient
      hours={businessHours.map((bh) => ({
        dayOfWeek: bh.dayOfWeek,
        isClosed: bh.isClosed,
        opensAt: dateToTimeString(bh.opensAt),
        closesAt: dateToTimeString(bh.closesAt),
      }))}
    />
  );
}
