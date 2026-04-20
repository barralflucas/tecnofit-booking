import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dateFilter = searchParams.get("date");
  const statusFilter = searchParams.get("status");
  const search = searchParams.get("search");

  const supabase = getSupabase();
  let query = supabase
    .from("bookings")
    .select("id, name, phone, email, booking_date, booking_time, status, created_at")
    .order("booking_date", { ascending: false })
    .order("booking_time", { ascending: true })
    .limit(200);

  if (dateFilter) query = query.eq("booking_date", dateFilter);
  if (statusFilter && statusFilter !== "all") query = query.eq("status", statusFilter);
  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Error consultando reservas." }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
