import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReservasClient from "./ReservasClient";

export default async function ReservasPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { businessId: session.user.businessId },
    include: {
      service: { select: { name: true } },
      barber: { select: { name: true } },
      customer: { select: { name: true, phone: true, email: true } },
    },
    orderBy: { startsAt: "desc" },
  });

  return (
    <ReservasClient
      bookings={bookings.map((b) => ({
        id: b.id,
        startsAt: b.startsAt.toISOString(),
        endsAt: b.endsAt.toISOString(),
        status: b.status,
        service: { name: b.service.name },
        barber: { name: b.barber.name },
        customer: {
          name: b.customer.name,
          phone: b.customer.phone,
          email: b.customer.email,
        },
      }))}
    />
  );
}

