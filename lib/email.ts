import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("Missing RESEND_API_KEY environment variable.");
    _resend = new Resend(key);
  }
  return _resend;
}

/* ─── shared helpers ──────────────────────────────────────── */

const MONTHS_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const DAYS_ES = [
  "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado",
];

function formatDateEs(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return `${DAYS_ES[d.getDay()]} ${day} de ${MONTHS_ES[month - 1]} de ${year}`;
}

/* ─── styles ───────────────────────── */

const BASE_STYLES = `
  body { margin: 0; padding: 0; background-color: #0f0f10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
  .wrapper { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
  .card { background: linear-gradient(180deg, #1a1a1b 0%, #141415 100%); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 36px; }
  .badge { display: inline-block; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); border-radius: 999px; padding: 6px 14px; font-size: 12px; letter-spacing: 0.08em; color: #9f9f9f; text-transform: uppercase; margin-bottom: 24px; }
  h1 { color: #f5f5f5; font-size: 26px; font-weight: 800; margin: 0 0 12px 0; }
  p { color: #b8b8b8; font-size: 15px; line-height: 1.6; }
  .highlight { color: #f5f5f5; font-weight: 600; }
  .info-row { margin-bottom: 10px; }
  .footer { font-size: 13px; color: #4a4a4a; text-align: center; margin-top: 28px; }
`;

/* ─── types ───────────────────────── */

export interface BookingEmailData {
  id?: string; // 👈 ahora opcional (clave)
  name: string;
  phone: string;
  email: string;
  booking_date: string;
  booking_time: string;
}

/* ─── user email ───────────────────── */

export async function sendUserConfirmation(
  booking: BookingEmailData
): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  const dateLabel = formatDateEs(booking.booking_date);

  const safeId = booking.id
    ? booking.id.slice(0, 8).toUpperCase()
    : "SIN-ID";

  const html = `
  <html>
  <head>
    <style>${BASE_STYLES}</style>
  </head>
  <body>
    <div class="wrapper">
      <div class="card">
        <div class="badge">TECNOFIT</div>

        <h1>Reserva confirmada ✅</h1>

        <p>
          Hola <span class="highlight">${booking.name}</span>,<br/>
          Te esperamos el <span class="highlight">${dateLabel}</span>
          a las <span class="highlight">${booking.booking_time} hs</span>.
        </p>

        <div class="info-row">📅 ${dateLabel}</div>
        <div class="info-row">⏰ ${booking.booking_time}</div>
        <div class="info-row">📞 ${booking.phone}</div>

        <p class="footer">
          Reserva #${safeId}
        </p>
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    const resend = getResend();

    const { error } = await resend.emails.send({
      from,
      to: booking.email,
      subject: `Reserva confirmada TecnoFit`,
      html,
    });

    if (error) {
      console.error("❌ Error enviando mail usuario:", error);
    } else {
      console.log("✅ Mail usuario enviado");
    }
  } catch (err) {
    console.error("💥 Exception mail usuario:", err);
  }
}

/* ─── staff email ───────────────────── */

export async function sendStaffNotification(
  booking: BookingEmailData
): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  const to = process.env.TECNOFIT_NOTIFY_EMAIL;

  if (!to) return;

  const dateLabel = formatDateEs(booking.booking_date);

  const html = `
  <html>
  <head>
    <style>${BASE_STYLES}</style>
  </head>
  <body>
    <div class="wrapper">
      <div class="card">
        <h1>Nueva reserva 📋</h1>

        <p><strong>${booking.name}</strong></p>
        <p>${dateLabel} - ${booking.booking_time}</p>
        <p>${booking.phone}</p>
        <p>${booking.email}</p>
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    const resend = getResend();

    const { error } = await resend.emails.send({
      from,
      to,
      subject: `Nueva reserva TecnoFit`,
      html,
    });

    if (error) {
      console.error("❌ Error mail staff:", error);
    } else {
      console.log("✅ Mail staff enviado");
    }
  } catch (err) {
    console.error("💥 Exception mail staff:", err);
  }
}