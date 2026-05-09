"use client";

import { useEffect, useRef } from "react";

export default function Privacy() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) (e.target as HTMLElement).classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="privacy"
      style={{ padding: "120px 24px", position: "relative" }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(124,58,237,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 900, margin: "0 auto", position: "relative" }}>
        <div
          ref={ref}
          className="reveal"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid #252840",
            borderRadius: 20,
            padding: "52px 60px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative gradient corner */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 200,
              height: 200,
              background:
                "radial-gradient(circle at top right, rgba(124,58,237,0.12), transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }}>
            {/* Left */}
            <div>
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "rgba(124,58,237,0.1)",
                    border: "1px solid rgba(124,58,237,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                      stroke="#a78bfa"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="#a78bfa"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="mono-tag" style={{ marginBottom: 16, display: "inline-block" }}>
                  Privacy-first
                </span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(24px, 3vw, 34px)",
                  fontWeight: 760,
                  letterSpacing: "-0.03em",
                  color: "#f0f2f8",
                  lineHeight: 1.2,
                  marginBottom: 18,
                }}
              >
                Your data stays
                <br />
                <span className="gradient-text">on your machine.</span>
              </h2>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: "#64748b",
                  letterSpacing: "-0.005em",
                }}
              >
                TabMind was designed with the assumption that your browsing data is private. Session history, notes, and todos are stored in{" "}
                <span className="code-badge">chrome.storage.local</span> — local-only, never synced to any server.
              </p>
            </div>

            {/* Right: data flow diagram */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>
              <DataFlowItem
                icon="🧠"
                label="TabMind Extension"
                description="Captures tab titles + URLs on the 90-second alarm"
                color="rgba(124,58,237,0.15)"
                borderColor="rgba(124,58,237,0.3)"
              />

              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 22 }}>
                <div
                  style={{
                    width: 1,
                    height: 24,
                    background: "linear-gradient(180deg, rgba(124,58,237,0.4), rgba(124,58,237,0.1))",
                  }}
                />
                <span style={{ fontSize: 11, color: "#4b5568", fontFamily: "monospace" }}>
                  titles + urls only
                </span>
              </div>

              <DataFlowItem
                icon="✦"
                label="Gemini API"
                description="Returns summary, topic label, and extracted todos"
                color="rgba(99,40,200,0.1)"
                borderColor="rgba(99,40,200,0.25)"
              />

              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 22 }}>
                <div
                  style={{
                    width: 1,
                    height: 24,
                    background: "linear-gradient(180deg, rgba(124,58,237,0.3), rgba(124,58,237,0.05))",
                  }}
                />
                <span style={{ fontSize: 11, color: "#4b5568", fontFamily: "monospace" }}>
                  structured json
                </span>
              </div>

              <DataFlowItem
                icon="💾"
                label="chrome.storage.local"
                description="Session history stored locally. 30 snapshots max."
                color="rgba(30,30,60,0.6)"
                borderColor="#252840"
              />

              <div
                style={{
                  marginTop: 8,
                  padding: "10px 14px",
                  background: "rgba(124,58,237,0.07)",
                  border: "1px solid rgba(124,58,237,0.15)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#7c6aaa",
                  lineHeight: 1.5,
                }}
              >
                No cloud sync. No analytics. No account required.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DataFlowItem({
  icon,
  label,
  description,
  color,
  borderColor,
}: {
  icon: string;
  label: string;
  description: string;
  color: string;
  borderColor: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 14px",
        background: color,
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#c4b5fd",
            letterSpacing: "-0.01em",
            marginBottom: 3,
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{description}</div>
      </div>
    </div>
  );
}
