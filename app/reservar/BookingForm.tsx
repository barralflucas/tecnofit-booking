"use client";

import { useState, CSSProperties } from "react";
import DaySelector from "./DaySelector";
import TimeSelector from "./TimeSelector";

/* ─── helpers ──────────────────────────────────────────────── */

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function isValidPhone(v: string) {
  return /^[\d\s\+\-\(\)]{8,}$/.test(v);
}

type FieldErrors = {
  name?: string;
  phone?: string;
  email?: string;
  day?: string;
  time?: string;
};

/* ─── style helpers ─────────────────────────────────────────── */

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
  backgroundColor: "rgba(255,255,255,0.04)",
  color: "#f5f5f5",
  fontSize: "15px",
  outline: "none",
  fontFamily: "var(--font-geist-sans), Arial, sans-serif",
  transition: "border-color 0.15s",
};

const labelStyle: CSSProperties = {
  fontSize: "12px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#9f9f9f",
  display: "block",
  marginBottom: "8px",
};

const errorStyle: CSSProperties = {
  fontSize: "13px",
  color: "#ff6b6b",
  marginTop: "6px",
};

const sectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

/* ─── component ─────────────────────────────────────────────── */

export default function BookingForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  function validate(): FieldErrors {
    const errs: FieldErrors = {};
    if (!name.trim() || name.trim().length < 2)
      errs.name = "Ingresá tu nombre completo (mínimo 2 caracteres).";
    if (!isValidPhone(phone))
      errs.phone = "Ingresá un número de teléfono válido (mínimo 8 dígitos).";
    if (!isValidEmail(email))
      errs.email = "Ingresá una dirección de email válida.";
    if (!selectedDate)
      errs.day = "Seleccioná un día disponible.";
    if (!selectedTime)
      errs.time = "Seleccioná un horario.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("loading");
    setServerError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          day: selectedDate!.toISOString().split("T")[0],
          time: selectedTime,
        }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json();
        setServerError(data.error ?? "Ocurrió un error. Intentá de nuevo.");
        setStatus("error");
      }
    } catch {
      setServerError("No pudimos conectarnos al servidor. Intentá de nuevo.");
      setStatus("error");
    }
  }

  /* ── success state ── */
  if (status === "success") {
    const DAYS_ES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const MONTHS_ES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    const d = selectedDate!;
    const dayLabel = `${DAYS_ES[d.getDay()]} ${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`;

    const tips = [
      { icon: "✉️", text: "Te enviamos un mail con todos los detalles de tu reserva." },
      { icon: "⏰", text: "Te recomendamos llegar 10 minutos antes de tu turno." },
      { icon: "👟", text: "Traé ropa cómoda y una botella de agua." },
    ];

    return (
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "28px",
          padding: "48px 36px",
          boxShadow: "0 20px 80px rgba(0,0,0,0.35)",
          textAlign: "center",
        }}
      >
        {/* Checkmark icon */}
        <div
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 0 0 12px rgba(255,255,255,0.06)",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111111"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2
          style={{
            fontSize: "30px",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            margin: "0 0 10px 0",
            color: "#f5f5f5",
          }}
        >
          Reserva confirmada
        </h2>

        <p style={{ color: "#b8b8b8", fontSize: "16px", lineHeight: 1.6, marginBottom: "28px" }}>
          Te esperamos el{" "}
          <strong style={{ color: "#f5f5f5" }}>{dayLabel}</strong>
          {" "}a las{" "}
          <strong style={{ color: "#f5f5f5" }}>{selectedTime} hs</strong>.
          <br />
          Confirmación enviada a{" "}
          <strong style={{ color: "#f5f5f5" }}>{email}</strong>.
        </p>

        {/* Booking summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
            marginBottom: "28px",
          }}
          className="booking-summary-grid"
        >
          {[
            { label: "Nombre", value: name },
            { label: "Teléfono", value: phone },
            { label: "Email", value: email },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: "14px",
                borderRadius: "14px",
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                textAlign: "left",
              }}
            >
              <p style={{ fontSize: "11px", color: "#6a6a7a", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "4px" }}>
                {item.label}
              </p>
              <p style={{ fontSize: "13px", fontWeight: 600, wordBreak: "break-all", color: "#e0e0e0", margin: 0 }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "32px",
            textAlign: "left",
          }}
        >
          {tips.map((tip) => (
            <div
              key={tip.text}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "14px 16px",
                borderRadius: "14px",
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <span style={{ fontSize: "18px", lineHeight: 1, flexShrink: 0 }}>{tip.icon}</span>
              <p style={{ margin: 0, fontSize: "14px", color: "#b8b8b8", lineHeight: 1.5 }}>{tip.text}</p>
            </div>
          ))}
        </div>

        <a
          href="/"
          style={{
            display: "inline-block",
            padding: "16px 32px",
            borderRadius: "14px",
            backgroundColor: "#ffffff",
            color: "#111111",
            fontWeight: 700,
            fontSize: "15px",
            textDecoration: "none",
          }}
        >
          Volver al inicio
        </a>

        <style>{`
          @media (max-width: 480px) {
            .booking-summary-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    );
  }


  /* ── form state ── */
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{
        width: "100%",
        maxWidth: "680px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "28px",
        padding: "36px",
        boxShadow: "0 20px 80px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
        gap: "28px",
      }}
    >
      {/* ── Personal info ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#6a6a6a",
            fontWeight: 600,
          }}
        >
          Tus datos
        </p>

        {/* Name */}
        <div style={sectionStyle}>
          <label htmlFor="booking-name" style={labelStyle}>
            Nombre completo
          </label>
          <input
            id="booking-name"
            type="text"
            autoComplete="name"
            placeholder="Ej: María García"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              ...inputStyle,
              borderColor: errors.name
                ? "rgba(255,107,107,0.5)"
                : "rgba(255,255,255,0.1)",
            }}
          />
          {errors.name && <p style={errorStyle}>{errors.name}</p>}
        </div>

        {/* Phone + Email row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
          }}
        >
          <div style={sectionStyle}>
            <label htmlFor="booking-phone" style={labelStyle}>
              Teléfono
            </label>
            <input
              id="booking-phone"
              type="tel"
              autoComplete="tel"
              placeholder="Ej: +54 11 1234 5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                ...inputStyle,
                borderColor: errors.phone
                  ? "rgba(255,107,107,0.5)"
                  : "rgba(255,255,255,0.1)",
              }}
            />
            {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
          </div>

          <div style={sectionStyle}>
            <label htmlFor="booking-email" style={labelStyle}>
              Email
            </label>
            <input
              id="booking-email"
              type="email"
              autoComplete="email"
              placeholder="Ej: hola@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                ...inputStyle,
                borderColor: errors.email
                  ? "rgba(255,107,107,0.5)"
                  : "rgba(255,255,255,0.1)",
              }}
            />
            {errors.email && <p style={errorStyle}>{errors.email}</p>}
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div
        style={{
          height: "1px",
          backgroundColor: "rgba(255,255,255,0.07)",
          margin: "0 -4px",
        }}
      />

      {/* ── Schedule ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#6a6a6a",
            fontWeight: 600,
          }}
        >
          Tu turno
        </p>

        {/* Day picker */}
        <div>
          <DaySelector
            selectedDate={selectedDate}
            onChange={(d) => {
              setSelectedDate(d);
              setSelectedTime(null);
              setErrors((prev) => ({ ...prev, day: undefined, time: undefined }));
            }}
          />
          {errors.day && <p style={{ ...errorStyle, marginTop: "8px" }}>{errors.day}</p>}
        </div>

        {/* Time picker */}
        <div>
          <TimeSelector
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onChange={(t) => {
              setSelectedTime(t);
              setErrors((prev) => ({ ...prev, time: undefined }));
            }}
          />
          {errors.time && <p style={{ ...errorStyle, marginTop: "8px" }}>{errors.time}</p>}
        </div>
      </div>

      {/* ── Server error banner ── */}
      {status === "error" && serverError && (
        <div
          style={{
            padding: "14px 16px",
            borderRadius: "14px",
            backgroundColor: "rgba(255,107,107,0.08)",
            border: "1px solid rgba(255,107,107,0.25)",
            color: "#ff6b6b",
            fontSize: "14px",
          }}
        >
          {serverError}
        </div>
      )}

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          padding: "18px 24px",
          borderRadius: "16px",
          border: "none",
          backgroundColor: status === "loading" ? "rgba(255,255,255,0.6)" : "#ffffff",
          color: "#111111",
          fontWeight: 700,
          fontSize: "16px",
          cursor: status === "loading" ? "wait" : "pointer",
          transition: "background-color 0.15s, opacity 0.15s",
          fontFamily: "var(--font-geist-sans), Arial, sans-serif",
          letterSpacing: "-0.01em",
        }}
      >
        {status === "loading" ? "Confirmando reserva…" : "Confirmar reserva"}
      </button>

      <p
        style={{
          fontSize: "13px",
          color: "#6a6a6a",
          textAlign: "center",
          marginTop: "-12px",
        }}
      >
        Al confirmar, aceptás que nos pongamos en contacto para coordinar tu visita.
      </p>
    </form>
  );
}
