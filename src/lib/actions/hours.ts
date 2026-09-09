"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionResult = { success: true } | { success: false; error: string };

async function getBusinessId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) throw new Error("No autenticado o sin negocio.");
  return session.user.businessId;
}

/** Convert "HH:MM" string to a Date object usable with Prisma @db.Time fields. */
function timeStringToDate(t: string): Date {
  return new Date(`1970-01-01T${t}:00.000Z`);
}

export type DayConfig = {
  dayOfWeek: number; // 0–6
  isClosed: boolean;
  opensAt: string; // "HH:MM"
  closesAt: string; // "HH:MM"
};

export async function saveBusinessHours(days: DayConfig[]): Promise<ActionResult> {
  try {
    const businessId = await getBusinessId();

    await prisma.$transaction(
      days.map((d) =>
        prisma.businessHours.upsert({
          where: { businessId_dayOfWeek: { businessId, dayOfWeek: d.dayOfWeek } },
          update: {
            isClosed: d.isClosed,
            opensAt: timeStringToDate(d.isClosed ? "09:00" : d.opensAt),
            closesAt: timeStringToDate(d.isClosed ? "18:00" : d.closesAt),
          },
          create: {
            businessId,
            dayOfWeek: d.dayOfWeek,
            isClosed: d.isClosed,
            opensAt: timeStringToDate(d.isClosed ? "09:00" : d.opensAt),
            closesAt: timeStringToDate(d.isClosed ? "18:00" : d.closesAt),
          },
        }),
      ),
    );

    revalidatePath("/dashboard/horarios");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error." };
  }
}
