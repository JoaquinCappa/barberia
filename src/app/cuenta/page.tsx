import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CancelBookingButton from "./CancelBookingButton";

function formatDate(date: Date) {
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Completado",
};

export default async function CuentaPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "CUSTOMER") {
    redirect("/dashboard");
  }

  const bookings = await prisma.booking.findMany({
    where: {
      customer: {
        userId: session.user.id,
      },
    },
    include: {
      business: {
        select: {
          name: true,
          slug: true,
        },
      },
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
      startsAt: "asc",
    },
  });

  const upcoming = bookings.filter(
    (booking) =>
      booking.startsAt > new Date() &&
      booking.status !== "CANCELLED",
  );

  const history = bookings.filter(
    (booking) =>
      booking.startsAt <= new Date() ||
      booking.status === "CANCELLED",
  );

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-bold tracking-[0.25em] text-amber-400"
          >
            AGENDA
          </Link>

          <Link
            href="/api/auth/signout"
            className="text-sm text-stone-500 transition hover:text-stone-300"
          >
            Cerrar sesión
          </Link>
        </header>

        {/* Greeting */}
        <section className="mb-10">
          <p className="text-sm text-stone-500">
            Mi cuenta
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Hola, {session.user.name?.split(" ")[0] ?? "ahí"}.
          </h1>

          <p className="mt-2 text-stone-400">
            Acá tenés tus próximos turnos y tu historial.
          </p>
        </section>

        {/* Upcoming */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Próximos turnos
            </h2>

            <span className="text-sm text-stone-500">
              {upcoming.length}
            </span>
          </div>

          {upcoming.length === 0 ? (
            <div className="rounded-2xl border border-stone-800 bg-stone-900 p-8 text-center">
              <p className="text-stone-300">
                No tenés turnos próximos.
              </p>

              <p className="mt-2 text-sm text-stone-500">
                Elegí una barbería para reservar tu próximo turno.
              </p>
              <Link
                href="/reservar"
                className="mt-6 inline-flex rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-300"
                >
                Reservar un turno
                </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-stone-800 bg-stone-900 p-5 transition hover:border-stone-700"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="text-sm font-medium uppercase tracking-wide text-amber-400">
                        {booking.business.name}
                      </p>

                      <h3 className="mt-2 text-lg font-semibold">
                        {booking.service.name}
                      </h3>

                      <p className="mt-1 text-sm text-stone-400">
                        Con {booking.barber.name}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="font-medium capitalize">
                        {formatDate(booking.startsAt)}
                      </p>

                      <p className="mt-1 text-sm text-stone-400">
                        {formatTime(booking.startsAt)}
                        {" – "}
                        {formatTime(booking.endsAt)}
                      </p>

                      <span className="mt-3 inline-block rounded-full border border-green-900 bg-green-400/10 px-3 py-1 text-xs font-medium text-green-400">
                        {STATUS_LABEL[booking.status]}
                      </span>

                      <CancelBookingButton bookingId={booking.id} />
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* History */}
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold">
            Historial
          </h2>

          {history.length === 0 ? (
            <p className="text-sm text-stone-600">
              Todavía no tenés historial de turnos.
            </p>
          ) : (
            <div className="divide-y divide-stone-800 rounded-2xl border border-stone-800 bg-stone-900">
              {history.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {booking.business.name}
                    </p>

                    <p className="text-sm text-stone-400">
                      {booking.service.name} · {booking.barber.name}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-sm capitalize">
                      {formatDate(booking.startsAt)}
                    </p>

                    <p className="text-xs text-stone-500">
                      {STATUS_LABEL[booking.status]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}