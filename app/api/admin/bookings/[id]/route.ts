import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getSlotsForDate, MAX_CAPACITY } from "@/lib/slots";

type Action = "cancel" | "attended" | "no_show" | "reschedule";

const STATUS_MAP: Record<string, string> = {
  cancel: "cancelled",
  attended: "attended",
  no_show: "no_show",
};

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await context.params;

  let body: { action: Action; new_date?: string; new_time?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const { action, new_date, new_time } = body;
  const supabase = getSupabase();

  // ── Simple status updates ──────────────────────────────────
  if (action in STATUS_MAP) {
    const { error } = await supabase
      .from("bookings")
      .update({ status: STATUS_MAP[action] })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Error actualizando reserva." }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  // ── Reschedule ─────────────────────────────────────────────
  if (action === "reschedule") {
    if (!new_date || !new_time) {
      return NextResponse.json(
        { error: "Se requieren new_date y new_time." },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(new_date)) {
      return NextResponse.json({ error: "Formato de fecha inválido." }, { status: 400 });
    }

    const [y, m, d] = new_date.split("-").map(Number);
    const validSlots = getSlotsForDate(new Date(y, m - 1, d));
    if (!validSlots.includes(new_time)) {
      return NextResponse.json(
        { error: "Horario inválido para ese día." },
        { status: 400 }
      );
    }

    // Check if target slot is blocked
    const { data: blocked } = await supabase
      .from("blocked_slots")
      .select("id")
      .eq("slot_date", new_date)
      .eq("slot_time", new_time)
      .maybeSingle();

    if (blocked) {
      return NextResponse.json({ error: "Ese turno está bloqueado." }, { status: 409 });
    }

    // Check capacity (exclude current booking from the count)
    const { count, error: countErr } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("booking_date", new_date)
      .eq("booking_time", new_time)
      .eq("status", "confirmed")
      .neq("id", id);

    if (countErr) {
      return NextResponse.json({ error: "Error verificando disponibilidad." }, { status: 500 });
    }
    if ((count ?? 0) >= MAX_CAPACITY) {
      return NextResponse.json(
        { error: "El turno de destino ya está completo.", code: "slot_full" },
        { status: 409 }
      );
    }

    const { error: updateErr } = await supabase
      .from("bookings")
      .update({ booking_date: new_date, booking_time: new_time, status: "confirmed" })
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: "Error reprogramando reserva." }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
}
