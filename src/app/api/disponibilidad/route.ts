import { NextRequest } from "next/server";
import { getAvailableSlots } from "@/lib/availability";

/**
 * GET /api/disponibilidad
 *
 * Query params: businessId, barberId, serviceId, date (YYYY-MM-DD)
 *
 * Returns: { slots: string[] }  — ISO strings of available slot start times.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const businessId = searchParams.get("businessId") ?? "";
  const barberId = searchParams.get("barberId") ?? "";
  const serviceId = searchParams.get("serviceId") ?? "";
  const date = searchParams.get("date") ?? "";

  if (!businessId || !barberId || !serviceId || !date) {
    return Response.json(
      { error: "Parámetros requeridos: businessId, barberId, serviceId, date" },
      { status: 400 },
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json(
      { error: "Formato de fecha inválido, usá YYYY-MM-DD" },
      { status: 400 },
    );
  }

  const slots = await getAvailableSlots(businessId, barberId, serviceId, date);
  return Response.json({ slots });
}
