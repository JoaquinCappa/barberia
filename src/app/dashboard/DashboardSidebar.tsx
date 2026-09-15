"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard/reservas", label: "Todas las reservas" },
  { href: "/dashboard/clientes", label: "Clientes" },
  { href: "/dashboard/servicios", label: "Servicios" },
  { href: "/dashboard/profesionales", label: "Profesionales" },
  { href: "/dashboard/horarios", label: "Horarios de atención" },
  { href: "/dashboard/personalizacion", label: "Personalización" },
  { href: "/dashboard/negocio", label: "Datos del negocio" },
];

export default function DashboardSidebar({
  email,
}: {
  email: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-stone-800 bg-stone-950 px-3 py-6">
      <div className="mb-8 px-3">
        <p className="text-sm font-bold tracking-[0.2em] text-amber-400">
          AGENDA
        </p>

        <p className="mt-2 text-xs text-stone-600">
          Panel de administración
        </p>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Navegación principal">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "relative rounded-lg px-3 py-2.5 text-sm transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-950",
                isActive
                  ? "bg-stone-800 font-medium text-stone-100 before:absolute before:left-0 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-amber-400"
                  : "text-stone-400 hover:bg-stone-900 hover:text-stone-100",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-stone-800 px-3 pt-5">
        <p className="truncate text-xs text-stone-500" title={email}>
          {email}
        </p>

        <Link
          href="/api/auth/signout"
          className="mt-3 block text-xs text-stone-500 transition-colors hover:text-stone-200"
        >
          Cerrar sesión
        </Link>
      </div>
    </aside>
  );
}