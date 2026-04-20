"use client";

export default function AdminNavButton() {
  return (
    <a
      href="/admin/login"
      title="Acceso administrador"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.04)",
        color: "#5a5a6a",
        fontSize: "12px",
        fontWeight: 500,
        textDecoration: "none",
        letterSpacing: "0.02em",
        transition: "color 0.15s, border-color 0.15s, background-color 0.15s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.color = "#9f9f9f";
        el.style.borderColor = "rgba(255,255,255,0.16)";
        el.style.backgroundColor = "rgba(255,255,255,0.07)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.color = "#5a5a6a";
        el.style.borderColor = "rgba(255,255,255,0.08)";
        el.style.backgroundColor = "rgba(255,255,255,0.04)";
      }}
    >
      {/* Lock icon */}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <span className="admin-label">Admin</span>
    </a>
  );
}
