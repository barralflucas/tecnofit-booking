"use client";

export default function BackLink() {
  return (
    <a
      href="/"
      id="back-link"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        color: "#9f9f9f",
        fontSize: "14px",
        textDecoration: "none",
        transition: "color 0.15s",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLAnchorElement).style.color = "#f5f5f5")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLAnchorElement).style.color = "#9f9f9f")
      }
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Volver al inicio
    </a>
  );
}
