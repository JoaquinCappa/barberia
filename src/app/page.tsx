import Link from "next/link";

export default function Home() {
  return <main className="min-h-screen bg-stone-950 text-stone-100"><section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20"><p className="text-sm font-semibold tracking-[0.24em] text-amber-400">AGENDA</p><h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight sm:text-7xl">Reservas claras para barberías que cuidan cada detalle.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-stone-400">Una plataforma multi-tenant para administrar agenda, equipo y clientes en un solo lugar.</p><Link className="mt-10 w-fit rounded-full bg-amber-400 px-5 py-3 font-semibold text-stone-950" href="/login">Acceder al panel</Link></section></main>;
}
