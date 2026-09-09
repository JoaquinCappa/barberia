"use client";

import { useState, useEffect } from "react";
import { createBooking } from "@/lib/actions/bookings";

type Service = { id: string; name: string; priceInCents: number; durationMinutes: number };
type Barber = { id: string; name: string; imageUrl: string | null };
type Business = { id: string; slug: string; name: string };

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export default function BookingWidget({
  business,
  services,
  barbers,
}: {
  business: Business;
  services: Service[];
  barbers: Barber[];
}) {
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");
  
  function toLocalDateString(d: Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const [dateStr, setDateStr] = useState(() => toLocalDateString(new Date()));
  
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  
  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const DAYS_ES = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

  function getNext7Days() {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  }

  const [next7Days] = useState(getNext7Days);
  const [weekSlots, setWeekSlots] = useState<Record<string, string[]> | null>(null);

  // Fetch slots for the next 7 days when step 3 is reached
  useEffect(() => {
    if (step === 3 && serviceId && barberId) {
      setLoadingSlots(true);
      setSelectedSlot("");
      
      const dates = next7Days.map(d => toLocalDateString(d));
      
      Promise.all(
        dates.map(date => 
          fetch(`/api/disponibilidad?businessId=${business.id}&barberId=${barberId}&serviceId=${serviceId}&date=${date}`)
            .then(res => res.json())
            .then(data => ({ date, slots: data.slots || [] }))
            .catch(() => ({ date, slots: [] }))
        )
      ).then(results => {
        const slotsMap: Record<string, string[]> = {};
        results.forEach(r => { slotsMap[r.date] = r.slots; });
        setWeekSlots(slotsMap);
        
        // Auto-select the first available day if the currently selected date has no slots
        if (!slotsMap[dateStr] || slotsMap[dateStr].length === 0) {
          const firstAvailable = results.find(r => r.slots.length > 0)?.date;
          if (firstAvailable) {
            setDateStr(firstAvailable);
          }
        }
      }).finally(() => {
        setLoadingSlots(false);
      });
    }
  }, [step, business.id, serviceId, barberId]); // Removed dateStr from dependencies so it only fetches once

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError("");

    const res = await createBooking({
      businessSlug: business.slug,
      serviceId,
      barberId,
      startsAt: selectedSlot,
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
    });

    setBookingLoading(false);
    if (res.success) {
      setBookingSuccess(true);
      setStep(5);
    } else {
      setBookingError(res.error);
    }
  };

  const selectedService = services.find((s) => s.id === serviceId);
  const selectedBarber = barbers.find((b) => b.id === barberId);

  const btnPrimary = "w-full rounded-xl bg-stone-900 px-4 py-3 font-semibold text-white hover:bg-stone-800 disabled:opacity-50 transition-colors";
  const btnSecondary = "w-full rounded-xl border border-stone-200 px-4 py-3 font-medium text-stone-700 hover:bg-stone-50 transition-colors";

  if (bookingSuccess) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          🎉
        </div>
        <h2 className="text-2xl font-bold text-stone-900">¡Reserva confirmada!</h2>
        <p className="mt-2 text-stone-500">
          Te esperamos el {new Date(selectedSlot).toLocaleDateString("es-AR", {  weekday: "long",  day: "numeric",  month: "long",})} a las {formatTime(selectedSlot)}hs para tu {selectedService?.name?.toLowerCase()} con {selectedBarber?.name}.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 rounded-lg text-sm font-medium text-stone-600 hover:text-stone-900"
        >
          Hacer otra reserva
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Progress Header */}
      <div className="mb-8 flex items-center justify-between text-sm font-medium text-stone-400">
        <span className={step >= 1 ? "text-amber-500" : ""}>Servicio</span>
        <span>›</span>
        <span className={step >= 2 ? "text-amber-500" : ""}>Profesional</span>
        <span>›</span>
        <span className={step >= 3 ? "text-amber-500" : ""}>Horario</span>
        <span>›</span>
        <span className={step >= 4 ? "text-amber-500" : ""}>Tus datos</span>
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
          <h2 className="text-lg font-semibold text-stone-900">Elegí el servicio</h2>
          {services.length === 0 ? (
            <p className="text-sm text-stone-500">No hay servicios disponibles.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setServiceId(s.id);
                    setStep(2);
                  }}
                  className={`flex flex-col items-start rounded-xl border p-4 text-left transition-colors ${
                    serviceId === s.id
                      ? "border-amber-400 bg-amber-50"
                      : "border-stone-200 hover:border-amber-300 hover:bg-stone-50"
                  }`}
                >
                  <span className="font-medium text-stone-900">{s.name}</span>
                  <span className="mt-1 text-sm text-stone-500">
                    {formatPrice(s.priceInCents)} · {s.durationMinutes} min
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
          <h2 className="text-lg font-semibold text-stone-900">Elegí con quién</h2>
          {barbers.length === 0 ? (
            <p className="text-sm text-stone-500">No hay profesionales disponibles.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {barbers.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setBarberId(b.id);
                    setStep(3);
                  }}
                  className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
                    barberId === b.id
                      ? "border-amber-400 bg-amber-50"
                      : "border-stone-200 hover:border-amber-300 hover:bg-stone-50"
                  }`}
                >
                  {b.imageUrl ? (
                    <img src={b.imageUrl} alt={b.name} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-lg font-semibold text-stone-500">
                      {b.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-stone-900">{b.name}</span>
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setStep(1)} className="mt-6 text-sm text-stone-500 hover:text-stone-800">
            ← Volver
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-stone-900">Elegí fecha</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {next7Days.map((dateObj, i) => {
                const dStr = toLocalDateString(dateObj);
                const isToday = i === 0;
                const dayName = DAYS_ES[dateObj.getDay()];
                const dayNumber = dateObj.getDate();
                
                const daySlots = weekSlots ? weekSlots[dStr] : [];
                // If weekSlots is loaded and it has 0 slots, the day is full/closed
                const isAvailable = weekSlots ? daySlots.length > 0 : true; 
                const isSelected = dateStr === dStr;
                
                return (
                  <button
                    key={dStr}
                    disabled={weekSlots !== null && !isAvailable}
                    onClick={() => {
                       setDateStr(dStr);
                       setSelectedSlot("");
                    }}
                    className={`flex min-w-[72px] flex-col items-center rounded-2xl border p-3 transition-colors ${
                      isSelected
                        ? "border-amber-400 bg-amber-400 text-stone-950"
                        : weekSlots !== null && !isAvailable
                        ? "border-stone-100 bg-stone-50 text-stone-300 cursor-not-allowed opacity-60"
                        : "border-stone-200 bg-white text-stone-700 hover:border-amber-300 hover:bg-amber-50"
                    }`}
                  >
                    <span className="text-xs font-semibold">{dayName}</span>
                    <span className="mt-1 text-2xl font-bold">{dayNumber}</span>
                    <span className="mt-1 text-[10px] font-bold uppercase tracking-wider">
                      {isToday ? "Hoy" : "\u00A0"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-stone-900">Elegí un horario</h2>
            {loadingSlots ? (
              <p className="text-center py-8 text-sm text-stone-500">Buscando horarios disponibles...</p>
            ) : (!weekSlots || !weekSlots[dateStr] || weekSlots[dateStr].length === 0) ? (
              <p className="text-center py-8 text-sm text-stone-500">No hay horarios disponibles para esta fecha.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {weekSlots[dateStr].map((slot) => (
                  <button
                    key={slot}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setStep(4);
                    }}
                    className={`rounded-lg border py-3 text-center text-sm font-medium transition-colors ${
                      selectedSlot === slot
                        ? "border-amber-400 bg-amber-400 text-stone-950"
                        : "border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-amber-50"
                    }`}
                  >
                    {formatTime(slot)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => setStep(2)} className="text-sm text-stone-500 hover:text-stone-800">
            ← Volver
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
          <h2 className="text-lg font-semibold text-stone-900">Confirmá tus datos</h2>
          
          <div className="mb-6 rounded-lg bg-stone-50 p-4 text-sm text-stone-600">
            <p><span className="font-medium text-stone-900">Servicio:</span> {selectedService?.name}</p>
            <p><span className="font-medium text-stone-900">Profesional:</span> {selectedBarber?.name}</p>
            <p><span className="font-medium text-stone-900">Cuándo:</span> {new Date(selectedSlot).toLocaleDateString("es-AR")} a las {formatTime(selectedSlot)}</p>
          </div>

          <form onSubmit={handleBooking} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Nombre completo *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                placeholder="Juan Pérez"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Teléfono (WhatsApp) *</label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                placeholder="11 1234 5678"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Email (opcional)</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                placeholder="juan@email.com"
              />
            </div>

            {bookingError && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{bookingError}</p>
            )}

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={bookingLoading}
                className="rounded-xl border border-stone-200 px-4 py-3 font-medium text-stone-700 hover:bg-stone-50"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={bookingLoading}
                className="flex-1 rounded-xl bg-stone-900 px-4 py-3 font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
              >
                {bookingLoading ? "Confirmando..." : "Confirmar reserva"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

