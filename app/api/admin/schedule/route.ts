import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getSlotsForDate } from "@/lib/slots";

export interface SlotEntry {
  time: string;
  bookings: {
    id: string;
    name: string;
    phone: string;
    email: string;
    status: string;
  }[];
  count: number;
  blocked: boolean;
  blocked_id: string | null;
}

export async function GET(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const date = new URL(req.url).searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Fecha inválida." }, { status: 400 });
  }

  const [y, m, d] = date.split("-").map(Number);
  const slots = getSlotsForDate(new Date(y, m - 1, d));

  const supabase = getSupabase();

  const [{ data: bookings, error: bErr }, { data: blocked, error: blErr }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("id, name, phone, email, booking_time, status")
        .eq("booking_date", date)
        .order("booking_time"),
      supabase
        .from("blocked_slots")
        .select("id, slot_time")
        .eq("slot_date", date),
    ]);

  if (bErr || blErr) {
    return NextResponse.json({ error: "Error consultando datos." }, { status: 500 });
  }

  const blockedMap = new Map<string, string>(
    (blocked ?? []).map((b) => [b.slot_time, b.id])
  );

  const schedule: SlotEntry[] = slots.map((time) => {
    const slotBookings = (bookings ?? []).filter((b) => b.booking_time === time);
    const active = slotBookings.filter((b) => b.status === "confirmed");
    return {
      time,
      bookings: slotBookings,
      count: active.length,
      blocked: blockedMap.has(time),
      blocked_id: blockedMap.get(time) ?? null,
    };
  });

  return NextResponse.json(schedule);
}
