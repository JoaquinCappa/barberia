import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

const navItems = [
  { href: "/dashboard/reservas", label: "Todas las reservas" },
  { href: "/dashboard/clientes", label: "Clientes" },
  { href: "/dashboard/servicios", label: "Servicios" },
  { href: "/dashboard/profesionales", label: "Profesionales" },
  { href: "/dashboard/horarios", label: "Horarios de atención" },
  { href: "/dashboard/personalizacion", label: "Personalización" },
  { href: "/dashboard/negocio", label: "Datos del negocio" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if (!session.user.businessId) redirect("/setup");

  return (
    <div className="flex min-h-screen bg-stone-950 text-stone-100">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-stone-800 px-3 py-6">
        <p className="mb-8 px-3 text-sm font-bold tracking-[0.2em] text-amber-400">
          AGENDA
        </p>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto px-3">
          <p className="truncate text-xs text-stone-600">
            {session.user.email}
          </p>

          <Link
            href="/api/auth/signout"
            className="mt-2 block text-xs text-stone-500 hover:text-stone-300"
          >
            Cerrar sesión
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}