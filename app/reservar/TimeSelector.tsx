"use client";

import { useState, useEffect } from "react";
import { WEEKDAY_SLOTS, SATURDAY_SLOTS, MAX_CAPACITY } from "@/lib/slots";

type SlotsResponse = { counts: Record<string, number>; blocked: string[] };

interface Props {
  selectedDate: Date | null;
  selectedTime: string | null;
  onChange: (time: string) => void;
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function TimeSelector({ selectedDate, selectedTime, onChange }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [blocked, setBlocked] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!selectedDate || selectedDate.getDay() === 0) return;
    let cancelled = false;
    setLoading(true);
    setFetchError(false);
    setCounts({});
    setBlocked([]);
    fetch(`/api/slots?date=${toIsoDate(selectedDate)}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<SlotsResponse>;
      })
      .then((d) => {
        if (!cancelled) { setCounts(d.counts); setBlocked(d.blocked); }
      })
      .catch(() => { if (!cancelled) setFetchError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedDate]);

  const label = (
    <p style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9f9f9f", marginBottom: "12px" }}>
      Elegí el horario
    </p>
  );

  if (!selectedDate) {
    return <div>{label}<p style={{ fontSize: "14px", color: "#4a4a4a", padding: "20px 0" }}>Primero seleccioná un día para ver los horarios disponibles.</p></div>;
  }

  const day = selectedDate.getDay();
  if (day === 0) {
    return <div>{label}<p style={{ fontSize: "14px", color: "#4a4a4a", padding: "16px 0" }}>No hay turnos disponibles los domingos.</p></div>;
  }

  const slots = day === 6 ? [...SATURDAY_SLOTS] : [...WEEKDAY_SLOTS];

  if (loading) {
    return (
      <div>
        {label}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "10px" }}>
          {slots.map((s) => (
            <div key={s} style={{ height: "46px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.03)", animation: "pulse 1.4s ease-in-out infinite" }} />
          ))}
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }`}</style>
      </div>
    );
  }

  if (fetchError) {
    return <div>{label}<p style={{ fontSize: "14px", color: "#ff6b6b", padding: "12px 0" }}>No pudimos cargar los horarios. Recargá la página e intentá de nuevo.</p></div>;
  }

  return (
    <div>
      {label}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "10px" }}>
        {slots.map((slot) => {
          const count = counts[slot] ?? 0;
          const isFull = count >= MAX_CAPACITY;
          const isBlocked = blocked.includes(slot);
          const disabled = isFull || isBlocked;
          const active = selectedTime === slot && !disabled;
          const hasOne = count === 1 && !isBlocked;

          return (
            <button
              key={slot}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onChange(slot)}
              style={{
                position: "relative", padding: "12px 8px", borderRadius: "14px",
                border: active ? "1px solid #ffffff" : disabled ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(255,255,255,0.1)",
                backgroundColor: active ? "#ffffff" : disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
                color: active ? "#111111" : disabled ? "#2e2e2e" : "#f5f5f5",
                fontWeight: active ? 700 : 500, fontSize: "15px",
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.15s ease", outline: "none",
                fontFamily: "var(--font-geist-sans), monospace", letterSpacing: "0.02em",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
              }}
            >
              <span>{slot}</span>
              {isBlocked && <span style={{ fontSize: "9px", letterSpacing: "0.06em", color: "#4a4a6a", textTransform: "uppercase", fontWeight: 600 }}>No disp.</span>}
              {isFull && !isBlocked && <span style={{ fontSize: "9px", letterSpacing: "0.06em", color: "#3a3a3a", textTransform: "uppercase", fontWeight: 600 }}>Completo</span>}
              {hasOne && <span style={{ fontSize: "9px", letterSpacing: "0.06em", color: "#f0a500", textTransform: "uppercase", fontWeight: 600 }}>1 lugar</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
