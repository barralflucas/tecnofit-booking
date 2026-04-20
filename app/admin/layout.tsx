"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/admin/schedule", label: "📅 Agenda" },
  { href: "/admin/bookings", label: "📋 Reservas" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  if (pathname === "/admin/login") return <>{children}</>;

  const sidebar = (
    <nav style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "16px 0" }}>
      {NAV.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <a
            key={item.href}
            href={item.href}
            style={{
              display: "block", padding: "10px 20px", borderRadius: "10px",
              fontSize: "14px", fontWeight: active ? 600 : 400,
              color: active ? "#f5f5f5" : "#6a6a7a",
              backgroundColor: active ? "rgba(255,255,255,0.07)" : "transparent",
              textDecoration: "none", transition: "all 0.15s",
            }}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0c0c0d", color: "#e0e0e0", fontFamily: "var(--font-geist-sans), Arial, sans-serif", display: "flex" }}>
      {/* Desktop sidebar */}
      <aside style={{ width: "220px", flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "0 0 20px 0" }}
        className="admin-sidebar">
        <div>
          <div style={{ padding: "24px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a4a5a", fontWeight: 600 }}>TecnoFit</span>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#3a3a4a", letterSpacing: "0.06em", textTransform: "uppercase" }}>Admin</p>
          </div>
          {sidebar}
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{ margin: "0 12px", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "transparent", color: "#4a4a5a", fontSize: "13px", cursor: "pointer", transition: "all 0.15s" }}
        >
          {loggingOut ? "Saliendo…" : "Cerrar sesión"}
        </button>
      </aside>

      {/* Mobile top bar */}
      <div style={{ display: "none" }} className="admin-topbar">
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.02em" }}>TecnoFit Admin</span>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: "#9f9f9f", fontSize: "20px", cursor: "pointer" }}>☰</button>
        </div>
        {menuOpen && (
          <div style={{ backgroundColor: "#111113", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "8px 0" }}>
            {sidebar}
          </div>
        )}
      </div>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto", padding: "0" }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { display: none !important; }
          .admin-topbar { display: block !important; position: sticky; top: 0; z-index: 10; background: #0c0c0d; width: 100%; }
        }
      `}</style>
    </div>
  );
}
