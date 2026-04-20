import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const date = new URL(req.url).searchParams.get("date");
  const supabase = getSupabase();
  let query = supabase
    .from("blocked_slots")
    .select("*")
    .order("slot_date")
    .order("slot_time");
  if (date) query = query.eq("slot_date", date);
  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Error consultando bloqueados." }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  let body: { slot_date: string; slot_time: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }
  const { slot_date, slot_time, reason } = body;
  if (!slot_date || !slot_time) {
    return NextResponse.json(
      { error: "slot_date y slot_time son requeridos." },
      { status: 400 }
    );
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("blocked_slots")
    .insert({ slot_date, slot_time, reason: reason ?? null })
    .select()
    .single();
  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Ese turno ya está bloqueado." }, { status: 409 });
    }
    return NextResponse.json({ error: "Error bloqueando turno." }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
