import AdminNavButton from "@/app/components/AdminNavButton";

export default function Home() {
  const highlights = [
    "Sesiones de 45 min",
    "Máximo 2 personas por turno",
    "Lunes a viernes de 7 a 20 h",
    "Sábados de 9 a 13 h",
  ];

  const steps = [
    {
      step: "01",
      title: "Completá tus datos",
      text: "Dejanos tu nombre, teléfono y email para reservar tu lugar.",
    },
    {
      step: "02",
      title: "Elegí día y horario",
      text: "Seleccioná el turno que mejor se adapte a tu agenda.",
    },
    {
      step: "03",
      title: "Confirmá tu reserva",
      text: "Recibí la confirmación y preparate para vivir TecnoFit.",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f0f10",
        color: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-geist-sans), Arial, sans-serif",
      }}
    >
      {/* ── Navbar ──────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          width: "100%",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backgroundColor: "rgba(15,15,16,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 32px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo / wordmark */}
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <span
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#111111"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </span>
            <span
              style={{
                fontSize: "15px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#f5f5f5",
              }}
            >
              TecnoFit
            </span>
          </a>

          <AdminNavButton />
        </div>
      </header>

      {/* ── Hero content ─────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 32px",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "1100px",
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "40px",
            alignItems: "center",
          }}
          className="home-grid"
        >
          <div>
            <span
              style={{
                display: "inline-block",
                padding: "8px 14px",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: "999px",
                fontSize: "13px",
                letterSpacing: "0.04em",
                color: "#cfcfcf",
                marginBottom: "22px",
              }}
            >
              TECNOFIT · CLASE DE PRUEBA
            </span>

            <h1
              style={{
                fontSize: "clamp(40px, 6vw, 72px)",
                lineHeight: 1,
                margin: "0 0 18px 0",
                fontWeight: 800,
                letterSpacing: "-0.04em",
              }}
            >
              Reservá tu
              <br />
              clase de prueba
            </h1>

            <p
              style={{
                fontSize: "18px",
                lineHeight: 1.6,
                color: "#b8b8b8",
                maxWidth: "560px",
                marginBottom: "32px",
              }}
            >
              Viví la experiencia TecnoFit con una sesión de prueba guiada,
              dinámica y semiprivada. Elegí tu día, tu horario y asegurá tu
              lugar en menos de 2 minutos.
            </p>

            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                marginBottom: "28px",
              }}
            >
              <a
                href="/reservar"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#111111",
                  textDecoration: "none",
                  padding: "16px 24px",
                  borderRadius: "14px",
                  fontWeight: 700,
                  fontSize: "16px",
                }}
              >
                Reservar ahora
              </a>

              <a
                href="#como-funciona"
                style={{
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "#f5f5f5",
                  textDecoration: "none",
                  padding: "16px 24px",
                  borderRadius: "14px",
                  fontWeight: 600,
                  fontSize: "16px",
                }}
              >
                Cómo funciona
              </a>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              {highlights.map((item) => (
                <span
                  key={item}
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    padding: "10px 14px",
                    borderRadius: "999px",
                    fontSize: "14px",
                    color: "#d6d6d6",
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "28px",
              padding: "28px",
              boxShadow: "0 20px 80px rgba(0,0,0,0.35)",
            }}
          >
            <div
              style={{
                display: "grid",
                gap: "18px",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    color: "#9f9f9f",
                    fontSize: "13px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Experiencia
                </p>
                <h2
                  style={{
                    margin: "8px 0 0 0",
                    fontSize: "28px",
                    lineHeight: 1.1,
                  }}
                >
                  Una prueba real.
                  <br />
                  No una clase genérica.
                </h2>
              </div>

              <div
                id="como-funciona"
                style={{
                  display: "grid",
                  gap: "14px",
                  marginTop: "6px",
                }}
              >
                {steps.map((item) => (
                  <div
                    key={item.step}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "56px 1fr",
                      gap: "14px",
                      alignItems: "start",
                      padding: "16px",
                      borderRadius: "18px",
                      backgroundColor: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "16px",
                        backgroundColor: "#ffffff",
                        color: "#111111",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                      }}
                    >
                      {item.step}
                    </div>

                    <div>
                      <h3
                        style={{
                          margin: "0 0 6px 0",
                          fontSize: "18px",
                        }}
                      >
                        {item.title}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color: "#b6b6b6",
                          fontSize: "15px",
                          lineHeight: 1.5,
                        }}
                      >
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Responsive overrides ─────────────────────────────── */}
      <style>{`
        @media (max-width: 700px) {
          .home-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .admin-label {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}