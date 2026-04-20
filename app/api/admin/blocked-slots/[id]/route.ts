import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const { id } = await context.params;
  const { error } = await getSupabase()
    .from("blocked_slots")
    .delete()
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Error desbloqueando turno." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
