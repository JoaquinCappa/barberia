import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NegocioClient from "./NegocioClient";
import GaleriaSection from "./GaleriaSection";

export default async function NegocioPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.businessId) {
    redirect("/login");
  }

  const business = await prisma.business.findUnique({
    where: {
      id: session.user.businessId,
    },
    select: {
      name: true,
      description: true,
      phone: true,
      email: true,
      address: true,
      logoUrl: true,
      coverImageUrl: true,
      photos: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, url: true, caption: true },
      },
    },
  });

  if (!business) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <NegocioClient initialBusiness={business} />
      <GaleriaSection initialPhotos={business.photos} />
    </div>
  );
}