import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ServiciosClient from "./ServiciosClient";

export default async function ServiciosPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.businessId) {
    redirect("/login");
  }

  const services = await prisma.service.findMany({
    where: {
      businessId: session.user.businessId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return (
    <ServiciosClient
      services={services.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        priceInCents: service.priceInCents,
        durationMinutes: service.durationMinutes,
        isActive: service.isActive,
      }))}
    />
  );
}