import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendUserConfirmation, sendStaffNotification } from "@/lib/email";
import { getSlotsForDate, MAX_CAPACITY } from "@/lib/slots";

/* ─── types ──────────────────────────────────────────────── */

export interface BookingPayload {
  name: string;
  phone: string;
  email: string;
  day: string;  // ISO date string e.g. "2025-05-12"
  time: string; // e.g. "09:00"
}

interface RpcResult {
  success: boolean;
  error_code: string | null;
  booking_id: string | null;
}

/* ─── POST /api/bookings ─────────────────────────────────── */

export async function POST(req: NextRequest) {
  // ── 1. Parse body ──────────────────────────────────────────
  let body: BookingPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Cuerpo de la solicitud inválido." },
      { status: 400 }
    );
  }

  const { name, phone, email, day, time } = body;

  // ── 2. Field-level validation ──────────────────────────────
  const missing: string[] = [];
  if (!name?.trim()) missing.push("name");
  if (!phone?.trim()) missing.push("phone");
  if (!email?.trim()) missing.push("email");
  if (!day) missing.push("day");
  if (!time) missing.push("time");

  if (missing.length > 0) {
    return NextResponse.json(
      { success: false, error: `Faltan campos requeridos: ${missing.join(", ")}.` },
      { status: 400 }
    );
  }

  // ── 3. Validate date format ────────────────────────────────
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return NextResponse.json(
      { success: false, error: "Formato de fecha inválido. Se esperaba YYYY-MM-DD." },
      { status: 400 }
    );
  }

  // ── 4. Validate that the slot exists for that weekday ──────
  const [year, month, dayNum] = day.split("-").map(Number);
  const dateObj = new Date(year, month - 1, dayNum);
  const validSlots = getSlotsForDate(dateObj);

  if (validSlots.length === 0) {
    return NextResponse.json(
      { success: false, error: "No hay turnos disponibles para el día seleccionado." },
      { status: 400 }
    );
  }

  if (!validSlots.includes(time)) {
    return NextResponse.json(
      { success: false, error: "El horario seleccionado no es válido para ese día." },
      { status: 400 }
    );
  }

  // ── 5. Atomic capacity check + insert via Postgres RPC ─────
  //
  // The `create_booking` function runs inside a single transaction
  // with a FOR UPDATE lock on the slot rows, preventing race conditions
  // where two concurrent requests would both read count < 2 and both insert.
  //
  let bookingId: string;
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase.rpc("create_booking", {
      p_name: name.trim(),
      p_phone: phone.trim(),
      p_email: email.trim(),
      p_date: day,
      p_time: time,
    });

    if (error) {
      console.error("[/api/bookings] RPC error:", error);
      return NextResponse.json(
        { success: false, error: "Error al procesar la reserva. Intentá de nuevo." },
        { status: 500 }
      );
    }

    // data is an array of rows because the function returns a TABLE
    const result: RpcResult = Array.isArray(data) ? data[0] : data;

    if (!result?.success) {
      if (result?.error_code === "slot_full") {
        return NextResponse.json(
          {
            success: false,
            error: `El turno de las ${time} del ${day} ya está completo (máximo ${MAX_CAPACITY} personas por turno). Por favor elegí otro horario.`,
            code: "slot_full",
          },
          { status: 409 }
        );
      }

      // Unexpected RPC failure
      return NextResponse.json(
        { success: false, error: "No se pudo completar la reserva. Intentá de nuevo." },
        { status: 500 }
      );
    }

    bookingId = result.booking_id!;
    console.log(`[/api/bookings] ✅ Created: ${bookingId} — ${name} @ ${day} ${time}`);
  } catch (err) {
    console.error("[/api/bookings] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor." },
      { status: 500 }
    );
  }

  // ── 6. Send emails ─────────────────────────────────────────
  //
  // IMPORTANT: we AWAIT both emails before returning.
  // In Vercel serverless, the Lambda exits as soon as the response is
  // sent. Fire-and-forget (void Promise.all) means the runtime is killed
  // before the promises resolve — emails never arrive.
  const bookingData = {
    id: bookingId,
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    booking_date: day,
    booking_time: time,
  };

  console.log(`[/api/bookings] Sending emails for booking ${bookingId}…`);
  await Promise.all([
    sendUserConfirmation(bookingData),
    sendStaffNotification(bookingData),
  ]);
  console.log(`[/api/bookings] Emails dispatched for booking ${bookingId}.`);

  // ── 7. Return success ──────────────────────────────────────
  return NextResponse.json(
    {
      success: true,
      message: "¡Reserva confirmada! Te esperamos en TecnoFit.",
      booking: bookingData,
    },
    { status: 201 }
  );
}
