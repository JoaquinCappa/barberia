import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatTime(d: Date) {
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Completado",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-yellow-400",
  CONFIRMED: "text-green-400",
  CANCELLED: "text-red-400",
  COMPLETED: "text-stone-400",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) redirect("/login");

  const businessId = session.user.businessId;

  const now = new Date();
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const [business, todayBookings, totalPending] = await Promise.all([
    prisma.business.findUnique({ where: { id: businessId }, select: { name: true, slug: true } }),
    prisma.booking.findMany({
      where: {
        businessId,
        startsAt: { gte: todayStart, lt: todayEnd },
        status: { not: "CANCELLED" },
      },
      include: {
        service: { select: { name: true } },
        barber: { select: { name: true } },
        customer: { select: { name: true, phone: true } },
      },
      orderBy: { startsAt: "asc" },
    }),
    prisma.booking.count({ where: { businessId, status: "PENDING" } }),
  ]);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-amber-400">PANEL</p>
          <h1 className="mt-1 text-3xl font-semibold">{business?.name ?? "Mi negocio"}</h1>
        </div>
        <a
          href={`/b/${business?.slug ?? ""}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-stone-700 px-4 py-2 text-sm text-stone-300 hover:bg-stone-800"
        >
          Ver página pública ↗
        </a>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-800 bg-stone-900 p-5">
          <p className="text-sm text-stone-400">Reservas hoy</p>
          <p className="mt-1 text-3xl font-semibold">{todayBookings.length}</p>
        </div>
        <div className="rounded-xl border border-stone-800 bg-stone-900 p-5">
          <p className="text-sm text-stone-400">Pendientes de confirmar</p>
          <p className="mt-1 text-3xl font-semibold text-yellow-400">{totalPending}</p>
        </div>
        <div className="rounded-xl border border-stone-800 bg-stone-900 p-5">
          <p className="text-sm text-stone-400">Página pública</p>
          <p className="mt-1 truncate text-sm font-mono text-amber-400">
            /b/{business?.slug}
          </p>
        </div>
      </div>

      {/* Today's bookings */}
      <div className="rounded-xl border border-stone-800 bg-stone-900 p-6">
        <h2 className="mb-4 font-semibold">Reservas de hoy</h2>
        {todayBookings.length === 0 ? (
          <p className="text-sm text-stone-500">No hay reservas para hoy.</p>
        ) : (
          <div className="divide-y divide-stone-800">
            {todayBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{b.customer.name}</p>
                  <p className="text-sm text-stone-400">
                    {b.service.name} · {b.barber.name} · {formatTime(b.startsAt)}–
                    {formatTime(b.endsAt)}
                  </p>
                  <p className="text-xs text-stone-500">{b.customer.phone}</p>
                </div>
                <span className={`text-sm font-medium ${STATUS_COLOR[b.status]}`}>
                  {STATUS_LABEL[b.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="mt-6 grid gap-3 sm:grid-cols-5">
        {[
          { href: "/dashboard/reservas", label: "Todas las reservas" },
          { href: "/dashboard/clientes", label: "Clientes" },
          { href: "/dashboard/servicios", label: "Servicios" },
          { href: "/dashboard/profesionales", label: "Profesionales" },
          { href: "/dashboard/horarios", label: "Horarios de atención" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-xl border border-stone-800 bg-stone-900 p-4 text-sm text-stone-300 transition-colors hover:border-stone-600 hover:text-stone-100"
          >
            {l.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
