"use client";

import BrainIcon from "./BrainIcon";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid #1a1d2e",
        padding: "48px 24px",
        position: "relative",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BrainIcon size={20} />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "#f0f2f8",
            }}
          >
            TabMind
          </span>
          <span style={{ color: "#252840", margin: "0 4px" }}>·</span>
          <span style={{ fontSize: 13, color: "#4b5568" }}>
            MIT License · Open Source
          </span>
        </div>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {[
            { label: "GitHub", href: "https://github.com/thribhuvan003/tabmind" },
            { label: "Issues", href: "https://github.com/thribhuvan003/tabmind/issues" },
            { label: "Chrome Web Store", href: "https://chromewebstore.google.com" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 13,
                color: "#4b5568",
                textDecoration: "none",
                transition: "color 150ms ease",
                letterSpacing: "-0.005em",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#94a3b8"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#4b5568"; }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Tech stack */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {["WXT", "React", "Gemini API", "Next.js"].map((t) => (
            <span
              key={t}
              style={{
                fontFamily: "monospace",
                fontSize: 10.5,
                color: "#4b5568",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid #1a1d2e",
                borderRadius: 5,
                padding: "2px 8px",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
