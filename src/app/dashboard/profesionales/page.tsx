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
    include: {
      photos: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, url: true, caption: true },
      },
    },
  });

  return (
    <ProfesionalesClient
      barbers={barbers.map((b) => ({
        id: b.id,
        name: b.name,
        bio: b.bio,
        specialties: b.specialties,
        imageUrl: b.imageUrl,
        isActive: b.isActive,
        photos: b.photos,
      }))}
    />
  );
}
