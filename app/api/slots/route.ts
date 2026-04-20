import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getSlotsForDate } from "@/lib/slots";

/**
 * GET /api/slots?date=YYYY-MM-DD
 *
 * Returns availability for all slots on a given date.
 * Response: { counts: Record<time, number>, blocked: string[] }
 *
 * The blocked_slots query is intentionally resilient: if the table
 * doesn't exist yet (admin migration not run), we log a warning and
 * return an empty blocked list rather than a 500 error.
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

    // ── Bookings count (required) ──────────────────────────────
    const { data: bookingData, error: bErr } = await supabase
      .from("bookings")
      .select("booking_time")
      .eq("booking_date", date)
      .eq("status", "confirmed");

    if (bErr) {
      console.error("[/api/slots] Bookings query error:", bErr.message);
      return NextResponse.json(
        { error: "Error al consultar disponibilidad." },
        { status: 500 }
      );
    }

    // ── Blocked slots (optional — table may not exist yet) ─────
    let blocked: string[] = [];
    const { data: blockedData, error: blErr } = await supabase
      .from("blocked_slots")
      .select("slot_time")
      .eq("slot_date", date);

    if (blErr) {
      // Most likely the table hasn't been created yet (admin migration pending).
      // Degrade gracefully: return no blocked slots rather than a 500.
      console.warn(
        "[/api/slots] blocked_slots query failed (table may not exist):",
        blErr.message
      );
    } else {
      blocked = (blockedData ?? []).map((b) => b.slot_time);
    }

    // ── Build counts map ───────────────────────────────────────
    const counts: Record<string, number> = {};
    for (const row of bookingData ?? []) {
      counts[row.booking_time] = (counts[row.booking_time] ?? 0) + 1;
    }

    console.log(`[/api/slots] ${date} → counts:`, counts, "blocked:", blocked);

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
    // Short cache so freshness is maintained, but we don't hammer Supabase.
    "Cache-Control": "public, max-age=5, stale-while-revalidate=10",
  };
}
