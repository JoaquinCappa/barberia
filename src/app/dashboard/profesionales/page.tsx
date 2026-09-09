import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfesionalesClient from "./ProfesionalesClient";

export default async function ProfesionalesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) redirect("/login");

  const barbers = await prisma.barber.findMany({
    where: { businessId: session.user.businessId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <ProfesionalesClient
      barbers={barbers.map((b) => ({
        id: b.id,
        name: b.name,
        bio: b.bio,
        imageUrl: b.imageUrl,
        isActive: b.isActive,
      }))}
    />
  );
}
