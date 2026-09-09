import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BookingWidget from "./BookingWidget";

export default async function BusinessPublicPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const business = await prisma.business.findUnique({
    where: { slug: params.slug },
    include: {
      services: { where: { isActive: true }, orderBy: { name: "asc" } },
      barbers: { where: { isActive: true }, orderBy: { name: "asc" } },
    },
  });

  if (!business) notFound();

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          {business.logoUrl && (
            <img
              src={business.logoUrl}
              alt={business.name}
              className="mx-auto mb-4 h-24 w-24 rounded-full object-cover shadow-sm"
            />
          )}
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            {business.name}
          </h1>
          {business.description && (
            <p className="mt-2 text-stone-500">{business.description}</p>
          )}
          {(business.address || business.phone) && (
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-stone-500">
              {business.address && <span>📍 {business.address}</span>}
              {business.phone && <span>📞 {business.phone}</span>}
            </div>
          )}
        </header>

        <div className="rounded-2xl bg-white p-6 shadow-xl shadow-stone-200/50 sm:p-8">
          <BookingWidget
            business={{
              id: business.id,
              slug: business.slug,
              name: business.name,
            }}
            services={business.services.map((s) => ({
              id: s.id,
              name: s.name,
              priceInCents: s.priceInCents,
              durationMinutes: s.durationMinutes,
            }))}
            barbers={business.barbers.map((b) => ({
              id: b.id,
              name: b.name,
              imageUrl: b.imageUrl,
            }))}
          />
        </div>
      </div>
    </main>
  );
}

