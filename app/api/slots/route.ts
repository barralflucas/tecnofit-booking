import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getSlotsForDate } from "@/lib/slots";

/**
 * GET /api/slots?date=YYYY-MM-DD
 *
 * Returns availability for all slots on a given date.
 * Response: { counts: Record<time, number>, blocked: string[] }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Parámetro 'date' requerido con formato YYYY-MM-DD." },
      { status: 400 }
    );
  }

  const [year, month, day] = date.split("-").map(Number);
  const slots = getSlotsForDate(new Date(year, month - 1, day));

  if (slots.length === 0) {
    return NextResponse.json(
      { counts: {}, blocked: [] },
      { headers: cacheHeaders() }
    );
  }

  try {
    const supabase = getSupabase();

    const [{ data: bookingData, error: bErr }, { data: blockedData, error: blErr }] =
      await Promise.all([
        supabase
          .from("bookings")
          .select("booking_time")
          .eq("booking_date", date)
          .neq("status", "cancelled"),
        supabase
          .from("blocked_slots")
          .select("slot_time")
          .eq("slot_date", date),
      ]);

    if (bErr || blErr) {
      return NextResponse.json(
        { error: "Error al consultar disponibilidad." },
        { status: 500 }
      );
    }

    const counts: Record<string, number> = {};
    for (const row of bookingData ?? []) {
      counts[row.booking_time] = (counts[row.booking_time] ?? 0) + 1;
    }

    const blocked = (blockedData ?? []).map((b) => b.slot_time);

    return NextResponse.json({ counts, blocked }, { headers: cacheHeaders() });
  } catch (err) {
    console.error("[/api/slots] Unexpected error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

function cacheHeaders() {
  return {
    "Cache-Control": "public, max-age=10, stale-while-revalidate=30",
  };
}
