"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin/schedule");
      } else {
        const d = await res.json();
        setError(d.error ?? "Contraseña incorrecta.");
      }
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#0c0c0d", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "var(--font-geist-sans), Arial, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span style={{ display: "inline-block", padding: "6px 14px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "999px", fontSize: "11px", letterSpacing: "0.1em", color: "#6a6a7a", textTransform: "uppercase", marginBottom: "16px" }}>
            TECNOFIT · ADMIN
          </span>
          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.04em", color: "#e0e0e0", margin: 0 }}>
            Acceso restringido
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div>
            <label htmlFor="admin-password" style={{ display: "block", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6a6a7a", marginBottom: "8px" }}>
              Contraseña
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "13px 16px", borderRadius: "12px", border: error ? "1px solid rgba(255,107,107,0.5)" : "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)", color: "#e0e0e0", fontSize: "15px", outline: "none", fontFamily: "inherit" }}
            />
          </div>

          {error && (
            <p style={{ fontSize: "13px", color: "#ff6b6b", margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{ padding: "14px", borderRadius: "12px", border: "none", backgroundColor: loading ? "rgba(255,255,255,0.5)" : "#ffffff", color: "#111", fontWeight: 700, fontSize: "15px", cursor: loading ? "wait" : "pointer", fontFamily: "inherit" }}
          >
            {loading ? "Verificando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}
