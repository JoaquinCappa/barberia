import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ClientesClient from "./ClientesClient";

function serializeDate(date: Date) {
  return date.toISOString();
}

export default async function ClientesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.businessId) {
    redirect("/login");
  }

  const customers = await prisma.customer.findMany({
    where: {
      businessId: session.user.businessId,
    },
    include: {
      bookings: {
        include: {
          service: {
            select: {
              name: true,
            },
          },
          barber: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          startsAt: "desc",
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <ClientesClient
      customers={customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        bookings: customer.bookings.map((booking) => ({
          id: booking.id,
          startsAt: serializeDate(booking.startsAt),
          endsAt: serializeDate(booking.endsAt),
          status: booking.status,
          service: {
            name: booking.service.name,
          },
          barber: {
            name: booking.barber.name,
          },
        })),
      }))}
    />
  );
}