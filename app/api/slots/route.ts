import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getSlotsForDate } from "@/lib/slots";

/**
 * GET /api/slots?date=YYYY-MM-DD
 *
 * Returns a map of booked counts for each time slot on the given date.
 * Slots absent from the response have 0 bookings.
 * Clients should treat count >= 2 as "full".
 *
 * Example response:
 * { "07:00": 1, "09:00": 2 }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  // ── Validate date param ──────────────────────────────────────
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Parámetro 'date' requerido con formato YYYY-MM-DD." },
      { status: 400 }
    );
  }

  // ── Validate that slots exist for this date ──────────────────
  const [year, month, day] = date.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  const slots = getSlotsForDate(dateObj);

  if (slots.length === 0) {
    // Sunday — no slots, return empty map immediately
    return NextResponse.json({}, { headers: cacheHeaders() });
  }

  // ── Query Supabase ───────────────────────────────────────────
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("bookings")
      .select("booking_time")
      .eq("booking_date", date)
      .neq("status", "cancelled");

    if (error) {
      console.error("[/api/slots] Supabase error:", error);
      return NextResponse.json(
        { error: "Error al consultar disponibilidad." },
        { status: 500 }
      );
    }

    // Count bookings per slot
    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      counts[row.booking_time] = (counts[row.booking_time] ?? 0) + 1;
    }

    return NextResponse.json(counts, { headers: cacheHeaders() });
  } catch (err) {
    console.error("[/api/slots] Unexpected error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

/** Short cache so re-renders don't hammer Supabase, but stays fresh. */
function cacheHeaders() {
  return {
    "Cache-Control": "public, max-age=10, stale-while-revalidate=30",
  };
}
