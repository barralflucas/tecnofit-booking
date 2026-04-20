import AdminNavButton from "@/app/components/AdminNavButton";

export default function Home() {

  const steps = [
    {
      step: "01",
      title: "Elegí día y horario",
      text: "Seleccioná el turno que mejor se adapte a tu agenda. Hay lugares disponibles de lunes a sábado.",
    },
    {
      step: "02",
      title: "Completá tus datos",
      text: "Dejanos tu nombre, teléfono y email. Solo toma un minuto.",
    },
    {
      step: "03",
      title: "Recibí confirmación por email",
      text: "Te enviamos todos los detalles al instante. ¡Listo para entrenar!",
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
          {/* Logo */}
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="TecnoFit"
              style={{
                height: "36px",
                width: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
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
                padding: "6px 14px",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: "999px",
                fontSize: "12px",
                letterSpacing: "0.06em",
                color: "#9f9f9f",
                marginBottom: "20px",
                textTransform: "uppercase",
              }}
            >
              Clase de prueba gratuita
            </span>

            <h1
              style={{
                fontSize: "clamp(36px, 5.5vw, 68px)",
                lineHeight: 1.05,
                margin: "0 0 20px 0",
                fontWeight: 800,
                letterSpacing: "-0.04em",
              }}
            >
              Reservá tu clase
              <br />
              de prueba en
              <br />
              TecnoFit
            </h1>

            <p
              style={{
                fontSize: "17px",
                lineHeight: 1.65,
                color: "#b8b8b8",
                maxWidth: "520px",
                marginBottom: "32px",
              }}
            >
              Entrenamiento funcional guiado, en grupos reducidos y con
              seguimiento personalizado. Asegurá tu lugar en menos de
              2 minutos.
            </p>

            {/* Emotional value line */}
            <p
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#e0e0e0",
                letterSpacing: "-0.01em",
                marginBottom: "20px",
              }}
            >
              Entréná distinto. Resultados reales desde la primera clase.
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "36px",
              }}
              className="cta-buttons"
            >
              <a
                href="/reservar"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#111111",
                  textDecoration: "none",
                  padding: "17px 28px",
                  borderRadius: "14px",
                  fontWeight: 700,
                  fontSize: "16px",
                  flex: "1 1 auto",
                  textAlign: "center",
                  minWidth: "160px",
                }}
              >
                Reservar mi clase
              </a>

              <a
                href="#como-funciona"
                style={{
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "#f5f5f5",
                  textDecoration: "none",
                  padding: "17px 24px",
                  borderRadius: "14px",
                  fontWeight: 600,
                  fontSize: "16px",
                  flex: "1 1 auto",
                  textAlign: "center",
                  minWidth: "140px",
                }}
              >
                Cómo funciona
              </a>
            </div>

            {/* Microcopy */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                marginTop: "4px",
              }}
            >
              {[
                "Cupos limitados por turno (máx. 2 personas)",
                "Confirmación inmediata por email",
              ].map((line) => (
                <p
                  key={line}
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#5a5a6a",
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                  }}
                >
                  <span style={{ color: "#4a7a5a", fontWeight: 700, fontSize: "15px", lineHeight: 1 }}>✓</span>
                  {line}
                </p>
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
          .cta-buttons a {
            min-width: unset !important;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}