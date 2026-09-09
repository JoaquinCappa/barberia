import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import BloqueosClient from "./bloqueosClient";

export default async function BloqueosPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.businessId) {
    redirect("/login");
  }

  const businessId = session.user.businessId;

  const [blockedTimes, barbers] = await Promise.all([
    prisma.blockedTime.findMany({
      where: { businessId },
      include: {
        // BlockedTime no tiene relación Prisma con Barber,
        // por eso la información del profesional se obtiene abajo.
      },
      orderBy: {
        startsAt: "asc",
      },
    }),

    prisma.barber.findMany({
      where: {
        businessId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const barberIds = [
    ...new Set(
      blockedTimes
        .map((block) => block.barberId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const blockedBarbers =
    barberIds.length > 0
      ? await prisma.barber.findMany({
          where: {
            id: { in: barberIds },
            businessId,
          },
          select: {
            id: true,
            name: true,
          },
        })
      : [];

  const barberMap = new Map(
    blockedBarbers.map((barber) => [barber.id, barber.name]),
  );

  return (
    <BloqueosClient
      barbers={barbers}
      blockedTimes={blockedTimes.map((block) => ({
        id: block.id,
        startsAt: block.startsAt.toISOString(),
        endsAt: block.endsAt.toISOString(),
        reason: block.reason,
        barberName: block.barberId
          ? barberMap.get(block.barberId) ?? "Profesional"
          : "Todo el negocio",
      }))}
    />
  );
}