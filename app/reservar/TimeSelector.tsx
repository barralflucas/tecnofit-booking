"use client";

import { useState, useEffect } from "react";
import { WEEKDAY_SLOTS, SATURDAY_SLOTS, MAX_CAPACITY } from "@/lib/slots";

/* ─── types ──────────────────────────────────────────────── */

type SlotCounts = Record<string, number>;

interface Props {
  selectedDate: Date | null;
  selectedTime: string | null;
  onChange: (time: string) => void;
}

/* ─── helpers ────────────────────────────────────────────── */

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/* ─── component ──────────────────────────────────────────── */

export default function TimeSelector({
  selectedDate,
  selectedTime,
  onChange,
}: Props) {
  const [slotCounts, setSlotCounts] = useState<SlotCounts>({});
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Fetch live availability whenever the selected date changes
  useEffect(() => {
    if (!selectedDate) return;

    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0) return; // Sunday — no fetch needed

    const dateStr = toIsoDate(selectedDate);
    let cancelled = false;

    setLoading(true);
    setFetchError(false);
    setSlotCounts({});

    fetch(`/api/slots?date=${dateStr}`)
      .then((res) => {
        if (!res.ok) throw new Error("slots fetch failed");
        return res.json() as Promise<SlotCounts>;
      })
      .then((counts) => {
        if (!cancelled) setSlotCounts(counts);
      })
      .catch(() => {
        if (!cancelled) setFetchError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  /* ── no date selected ──────────────────────────────────── */
  if (!selectedDate) {
    return (
      <div>
        <SectionLabel />
        <p style={{ fontSize: "14px", color: "#4a4a4a", padding: "20px 0" }}>
          Primero seleccioná un día para ver los horarios disponibles.
        </p>
      </div>
    );
  }

  const dayOfWeek = selectedDate.getDay();
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;
  const slots = isSunday ? [] : isSaturday ? [...SATURDAY_SLOTS] : [...WEEKDAY_SLOTS];

  /* ── Sunday ─────────────────────────────────────────────── */
  if (isSunday) {
    return (
      <div>
        <SectionLabel />
        <p style={{ fontSize: "14px", color: "#4a4a4a", padding: "16px 0" }}>
          No hay turnos disponibles los domingos.
        </p>
      </div>
    );
  }

  /* ── loading skeleton ───────────────────────────────────── */
  if (loading) {
    return (
      <div>
        <SectionLabel />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
            gap: "10px",
          }}
        >
          {slots.map((slot) => (
            <div
              key={slot}
              style={{
                padding: "12px 8px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.06)",
                backgroundColor: "rgba(255,255,255,0.03)",
                height: "46px",
                animation: "pulse 1.4s ease-in-out infinite",
              }}
            />
          ))}
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  /* ── fetch error ────────────────────────────────────────── */
  if (fetchError) {
    return (
      <div>
        <SectionLabel />
        <p style={{ fontSize: "14px", color: "#ff6b6b", padding: "12px 0" }}>
          No pudimos cargar los horarios. Por favor recargá la página e intentá de nuevo.
        </p>
      </div>
    );
  }

  /* ── slot grid ──────────────────────────────────────────── */
  return (
    <div>
      <SectionLabel />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
          gap: "10px",
        }}
      >
        {slots.map((slot) => {
          const count = slotCounts[slot] ?? 0;
          const isFull = count >= MAX_CAPACITY;
          const active = selectedTime === slot && !isFull;
          const hasOne = count === 1;

          return (
            <button
              key={slot}
              type="button"
              disabled={isFull}
              onClick={() => !isFull && onChange(slot)}
              title={
                isFull
                  ? "Turno completo"
                  : hasOne
                  ? "Último lugar disponible"
                  : undefined
              }
              style={{
                position: "relative",
                padding: "12px 8px",
                borderRadius: "14px",
                border: active
                  ? "1px solid #ffffff"
                  : isFull
                  ? "1px solid rgba(255,255,255,0.05)"
                  : "1px solid rgba(255,255,255,0.1)",
                backgroundColor: active
                  ? "#ffffff"
                  : isFull
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(255,255,255,0.04)",
                color: active ? "#111111" : isFull ? "#2e2e2e" : "#f5f5f5",
                fontWeight: active ? 700 : 500,
                fontSize: "15px",
                cursor: isFull ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
                outline: "none",
                fontFamily: "var(--font-geist-sans), monospace",
                letterSpacing: "0.02em",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>{slot}</span>

              {isFull && (
                <span
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.06em",
                    color: "#3a3a3a",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  Completo
                </span>
              )}

              {hasOne && !isFull && (
                <span
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.06em",
                    color: "#f0a500",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  1 lugar
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── shared sub-component ───────────────────────────────── */

function SectionLabel() {
  return (
    <p
      style={{
        fontSize: "12px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "#9f9f9f",
        marginBottom: "12px",
      }}
    >
      Elegí el horario
    </p>
  );
}
