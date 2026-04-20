"use client";

import { useState, useEffect, useCallback } from "react";
import { getSlotsForDate } from "@/lib/slots";

interface Booking {
  id: string; name: string; phone: string; email: string;
  booking_date: string; booking_time: string; status: string; created_at: string;
}

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: "Confirmada",      color: "#6ee7b7", bg: "rgba(110,231,183,0.1)" },
  cancelled: { label: "Cancelada",       color: "#6a6a7a", bg: "rgba(255,255,255,0.06)" },
  attended:  { label: "Asistió",         color: "#818cf8", bg: "rgba(129,140,248,0.1)" },
  no_show:   { label: "No se presentó",  color: "#fb923c", bg: "rgba(251,146,60,0.1)"  },
};

function toIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  // Reschedule state
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dateFilter) params.set("date", dateFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search) params.set("search", search);
    try {
      const res = await fetch(`/api/admin/bookings?${params}`);
      if (res.ok) setBookings(await res.json());
    } finally { setLoading(false); }
  }, [dateFilter, statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  async function patchBooking(id: string, body: object, key: string) {
    setActionLoading(key);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setBookings((prev) => prev.map((b) => {
          if (b.id !== id) return b;
          const patch = body as Record<string, string>;
          if (patch.action === "reschedule") return { ...b, booking_date: patch.new_date, booking_time: patch.new_time, status: "confirmed" };
          const statusMap: Record<string, string> = { cancel: "cancelled", attended: "attended", no_show: "no_show" };
          return { ...b, status: statusMap[patch.action] ?? b.status };
        }));
      } else {
        const d = await res.json();
        if (body && (body as Record<string,string>).action === "reschedule") setRescheduleError(d.error ?? "Error");
        else alert(d.error ?? "Error");
      }
    } finally { setActionLoading(null); }
  }

  function getAvailableSlots(dateStr: string): string[] {
    if (!dateStr) return [];
    const [y, m, d] = dateStr.split("-").map(Number);
    return getSlotsForDate(new Date(y, m - 1, d));
  }

  const today = toIso(new Date());
  const cell: React.CSSProperties = { padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "13px", color: "#c0c0d0", verticalAlign: "middle" };
  const th: React.CSSProperties = { ...cell, color: "#4a4a5a", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", backgroundColor: "#0f0f11" };

  return (
    <div style={{ padding: "28px 32px" }}>
      <h2 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.03em", color: "#e0e0e0", margin: "0 0 24px 0" }}>Reservas</h2>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
        <input placeholder="Buscar por nombre…" value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ ...filterInput, flex: "1 1 180px" }} />
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
          style={{ ...filterInput, flex: "0 1 160px" }} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...filterInput, flex: "0 1 160px" }}>
          <option value="all">Todos los estados</option>
          <option value="confirmed">Confirmadas</option>
          <option value="cancelled">Canceladas</option>
          <option value="attended">Asistieron</option>
          <option value="no_show">No se presentaron</option>
        </select>
        {(search || dateFilter || statusFilter !== "all") && (
          <button onClick={() => { setSearch(""); setDateFilter(""); setStatusFilter("all"); }}
            style={{ ...filterInput, backgroundColor: "transparent", color: "#6a6a7a", cursor: "pointer" }}>
            Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: "#4a4a5a", fontSize: "14px" }}>Cargando…</p>
      ) : bookings.length === 0 ? (
        <p style={{ color: "#4a4a5a", fontSize: "14px" }}>No se encontraron reservas.</p>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#111113" }}>
            <thead>
              <tr>
                {["Nombre","Teléfono","Email","Fecha","Horario","Estado","Acciones"].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const bs = STATUS_BADGE[b.status] ?? STATUS_BADGE.confirmed;
                const isRescheduling = rescheduleId === b.id;
                const isActive = b.status === "confirmed";
                return (
                  <>
                    <tr key={b.id} style={{ transition: "background 0.1s" }}>
                      <td style={{ ...cell, fontWeight: 600, color: "#e0e0e0" }}>{b.name}</td>
                      <td style={cell}>{b.phone}</td>
                      <td style={{ ...cell, maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.email}</td>
                      <td style={cell}>{b.booking_date}</td>
                      <td style={{ ...cell, fontWeight: 600 }}>{b.booking_time}</td>
                      <td style={cell}>
                        <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "999px", fontWeight: 600, color: bs.color, backgroundColor: bs.bg }}>{bs.label}</span>
                      </td>
                      <td style={cell}>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {isActive && (
                            <>
                              <ActionBtn label="Asistió"    loading={actionLoading === `attended-${b.id}`} color="#818cf8" onClick={() => patchBooking(b.id, { action: "attended" }, `attended-${b.id}`)} />
                              <ActionBtn label="No vino"    loading={actionLoading === `no_show-${b.id}`}  color="#fb923c" onClick={() => patchBooking(b.id, { action: "no_show" },  `no_show-${b.id}`)} />
                              <ActionBtn label="Reprogramar" loading={false} color="#a78bfa" onClick={() => { setRescheduleId(isRescheduling ? null : b.id); setNewDate(b.booking_date); setNewTime(b.booking_time); setRescheduleError(null); }} />
                              <ActionBtn label="Cancelar"   loading={actionLoading === `cancel-${b.id}`}   color="#ff6b6b" onClick={async () => { if (!confirm("¿Cancelar reserva?")) return; await patchBooking(b.id, { action: "cancel" }, `cancel-${b.id}`); }} />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Reschedule inline form */}
                    {isRescheduling && (
                      <tr key={`rs-${b.id}`}>
                        <td colSpan={7} style={{ padding: "12px 16px", backgroundColor: "rgba(167,139,250,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap" }}>
                            <div>
                              <label style={{ display: "block", fontSize: "11px", color: "#6a6a7a", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Nueva fecha</label>
                              <input type="date" min={today} value={newDate} onChange={(e) => { setNewDate(e.target.value); setNewTime(""); }}
                                style={{ ...filterInput, width: "160px" }} />
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: "11px", color: "#6a6a7a", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Nuevo horario</label>
                              <select value={newTime} onChange={(e) => setNewTime(e.target.value)} style={{ ...filterInput, width: "120px" }}>
                                <option value="">Elegir…</option>
                                {getAvailableSlots(newDate).map((s) => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                            <button
                              disabled={!newDate || !newTime || actionLoading === `rs-${b.id}`}
                              onClick={async () => {
                                setRescheduleError(null);
                                await patchBooking(b.id, { action: "reschedule", new_date: newDate, new_time: newTime }, `rs-${b.id}`);
                                if (!rescheduleError) setRescheduleId(null);
                              }}
                              style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#a78bfa", color: "#111", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
                            >
                              {actionLoading === `rs-${b.id}` ? "…" : "Confirmar"}
                            </button>
                            <button onClick={() => { setRescheduleId(null); setRescheduleError(null); }} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "transparent", color: "#6a6a7a", fontSize: "13px", cursor: "pointer" }}>
                              Cancelar
                            </button>
                            {rescheduleError && <p style={{ color: "#ff6b6b", fontSize: "12px", margin: 0 }}>{rescheduleError}</p>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ label, loading, color, onClick }: { label: string; loading: boolean; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={loading} style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: `1px solid ${color}33`, backgroundColor: "transparent", color: loading ? "#4a4a5a" : color, cursor: loading ? "wait" : "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
      {loading ? "…" : label}
    </button>
  );
}

const filterInput: React.CSSProperties = {
  padding: "9px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)",
  backgroundColor: "rgba(255,255,255,0.04)", color: "#e0e0e0", fontSize: "13px",
  outline: "none", fontFamily: "var(--font-geist-sans), Arial, sans-serif",
};
