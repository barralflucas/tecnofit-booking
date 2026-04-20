"use client";

import { useState, useEffect, useCallback } from "react";
import type { SlotEntry } from "@/app/api/admin/schedule/route";

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function toIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function formatDate(d: Date) {
  return `${DAYS[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  confirmed:  { label: "Confirmada",   color: "#6ee7b7", bg: "rgba(110,231,183,0.1)" },
  cancelled:  { label: "Cancelada",    color: "#9f9f9f", bg: "rgba(255,255,255,0.06)" },
  attended:   { label: "Asistió",      color: "#818cf8", bg: "rgba(129,140,248,0.1)" },
  no_show:    { label: "No se presentó", color: "#fb923c", bg: "rgba(251,146,60,0.1)" },
};

const SLOT_STATUS = (s: SlotEntry) => {
  if (s.blocked) return { label: "Bloqueado", color: "#a78bfa", bg: "rgba(167,139,250,0.1)" };
  if (s.count === 0) return { label: "Disponible", color: "#6a6a7a", bg: "rgba(255,255,255,0.04)" };
  if (s.count === 1) return { label: "1 lugar",    color: "#f0a500", bg: "rgba(240,165,0,0.1)"   };
  return               { label: "Completo",  color: "#ff6b6b", bg: "rgba(255,107,107,0.1)"  };
};

export default function AdminSchedulePage() {
  const [date, setDate] = useState<Date>(() => { const d = new Date(); d.setHours(0,0,0,0); return d; });
  const [schedule, setSchedule] = useState<SlotEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async (d: Date) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/schedule?date=${toIso(d)}`);
      if (res.ok) setSchedule(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(date); }, [date, load]);

  function changeDay(delta: number) {
    setDate((prev) => { const d = new Date(prev); d.setDate(d.getDate() + delta); return d; });
  }

  async function handleAction(action: () => Promise<Response>, onSuccess: () => void) {
    const res = await action();
    if (res.ok) { onSuccess(); load(date); }
    else { const d = await res.json(); alert(d.error ?? "Error"); }
  }

  async function toggleBlock(slot: SlotEntry) {
    const key = `block-${slot.time}`;
    setActionLoading(key);
    try {
      if (slot.blocked && slot.blocked_id) {
        await handleAction(
          () => fetch(`/api/admin/blocked-slots/${slot.blocked_id}`, { method: "DELETE" }),
          () => {}
        );
      } else {
        await handleAction(
          () => fetch("/api/admin/blocked-slots", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slot_date: toIso(date), slot_time: slot.time }) }),
          () => {}
        );
      }
    } finally { setActionLoading(null); }
  }

  async function cancelBooking(bookingId: string) {
    if (!confirm("¿Cancelar esta reserva?")) return;
    setActionLoading(`cancel-${bookingId}`);
    try {
      await handleAction(
        () => fetch(`/api/admin/bookings/${bookingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "cancel" }) }),
        () => {}
      );
    } finally { setActionLoading(null); }
  }

  const totalActive = schedule.reduce((acc, s) => acc + (s.blocked ? 0 : s.count), 0);
  const totalCapacity = schedule.filter((s) => !s.blocked).length * 2;

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1000px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={() => changeDay(-1)} style={navBtn}>‹</button>
          <div style={{ textAlign: "center", minWidth: "180px" }}>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", color: "#e0e0e0" }}>{formatDate(date)}</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#4a4a5a" }}>{toIso(date)}</p>
          </div>
          <button onClick={() => changeDay(1)} style={navBtn}>›</button>
        </div>
        <button onClick={() => { const d = new Date(); d.setHours(0,0,0,0); setDate(d); }} style={{ ...navBtn, fontSize: "12px", padding: "6px 12px", color: "#6a6a7a" }}>
          Hoy
        </button>
        {!loading && (
          <div style={{ marginLeft: "auto", padding: "8px 16px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: "13px", color: "#9f9f9f" }}>
            {totalActive}/{totalCapacity} reservas
          </div>
        )}
      </div>

      {/* Schedule grid */}
      {loading ? (
        <div style={{ color: "#4a4a5a", fontSize: "14px", padding: "40px 0" }}>Cargando agenda…</div>
      ) : schedule.length === 0 ? (
        <div style={{ color: "#4a4a5a", fontSize: "14px", padding: "40px 0" }}>No hay turnos para este día.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
          {schedule.map((slot) => {
            const st = SLOT_STATUS(slot);
            const blockLoading = actionLoading === `block-${slot.time}`;
            return (
              <div key={slot.time} style={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111113", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Slot header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.03em", color: "#e0e0e0" }}>{slot.time}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "999px", color: st.color, backgroundColor: st.bg, letterSpacing: "0.04em" }}>
                      {st.label}
                    </span>
                    <button
                      onClick={() => toggleBlock(slot)}
                      disabled={blockLoading}
                      style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "transparent", color: slot.blocked ? "#a78bfa" : "#4a4a5a", cursor: "pointer" }}
                    >
                      {blockLoading ? "…" : slot.blocked ? "Desbloquear" : "Bloquear"}
                    </button>
                  </div>
                </div>

                {/* Bookings list */}
                {slot.bookings.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {slot.bookings.map((b) => {
                      const bs = STATUS_BADGE[b.status] ?? STATUS_BADGE.confirmed;
                      const isCancelling = actionLoading === `cancel-${b.id}`;
                      return (
                        <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div>
                            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#d0d0d0" }}>{b.name}</p>
                            <p style={{ margin: 0, fontSize: "11px", color: "#5a5a6a" }}>{b.phone}</p>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "999px", color: bs.color, backgroundColor: bs.bg }}>{bs.label}</span>
                            {b.status === "confirmed" && (
                              <button onClick={() => cancelBooking(b.id)} disabled={isCancelling} style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", border: "1px solid rgba(255,107,107,0.25)", backgroundColor: "transparent", color: "#ff6b6b", cursor: "pointer" }}>
                                {isCancelling ? "…" : "Cancelar"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: "12px", color: "#3a3a4a" }}>Sin reservas</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const navBtn: React.CSSProperties = {
  padding: "8px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)",
  backgroundColor: "rgba(255,255,255,0.04)", color: "#9f9f9f", fontSize: "18px",
  cursor: "pointer", lineHeight: 1,
};
