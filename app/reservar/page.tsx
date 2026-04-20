import type { Metadata } from "next";
import BookingForm from "./BookingForm";
import BackLink from "./BackLink";

export const metadata: Metadata = {
  title: "Reservar clase de prueba · TecnoFit",
  description:
    "Completá tus datos, elegí el día y horario que mejor se adapte a tu agenda y asegurá tu lugar en TecnoFit.",
};

export default function ReservarPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f0f10",
        color: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        fontFamily: "var(--font-geist-sans), Arial, sans-serif",
      }}
    >
      {/* Back link */}
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          marginBottom: "28px",
        }}
      >
        <BackLink />
      </div>

      {/* Header */}
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          marginBottom: "36px",
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "7px 14px",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: "999px",
            fontSize: "12px",
            letterSpacing: "0.08em",
            color: "#9f9f9f",
            marginBottom: "20px",
            textTransform: "uppercase",
          }}
        >
          TECNOFIT · CLASE DE PRUEBA
        </span>

        <h1
          style={{
            fontSize: "clamp(32px, 6vw, 52px)",
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            margin: "0 0 14px 0",
          }}
        >
          Asegurá tu lugar
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "#b8b8b8",
            lineHeight: 1.6,
            maxWidth: "480px",
            margin: "0 auto",
          }}
        >
          Completá tus datos y elegí el turno que mejor se adapte a tu agenda.
          Te confirmamos la reserva al instante.
        </p>
      </div>

      {/* Booking form */}
      <BookingForm />
    </main>
  );
}
