"use client";

import { useEffect, useRef } from "react";

const STEPS = [
  {
    num: "01",
    title: "Install & add your API key",
    description:
      "Install the extension from the Chrome Web Store. Open the TabMind options page and paste in your Gemini API key. That's all the setup there is.",
    code: `// options page saves key to
// chrome.storage.local — never leaves
// your browser in plaintext
chrome.storage.local.set({
  "tabmind:gemini:apiKey": yourKey
})`,
    note: "Get a free key at aistudio.google.com",
  },
  {
    num: "02",
    title: "Browse normally",
    description:
      "TabMind sits in the background. A service worker fires every 90 seconds, captures open tab titles and URLs, and sends them to Gemini for analysis. Nothing else is captured.",
    code: `// background/index.ts
chrome.alarms.create("tabmind:snapshot", {
  periodInMinutes: 1.5
})`,
    note: "Only titles + URLs are sent — no page content",
  },
  {
    num: "03",
    title: "Open the widget to see the picture",
    description:
      "Click the brain orb on any page to expand the widget. You'll see a topic label, a summary sentence, per-page notes, and the todos the AI extracted from what you were browsing.",
    code: `// session shape
{
  topic: "React Development",
  summary: "Reviewing WXT docs…",
  todos: ["Check migration guide"],
  durationMs: 1080000
}`,
    note: "Drag the widget anywhere. Minimise anytime.",
  },
];

export default function HowItWorks() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) (e.target as HTMLElement).classList.add("visible");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    refs.current.filter(Boolean).forEach((el) => observer.observe(el!));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      style={{
        padding: "120px 24px",
        background: "rgba(255,255,255,0.015)",
        borderTop: "1px solid #1a1d2e",
        borderBottom: "1px solid #1a1d2e",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background accent */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(124,58,237,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
        {/* Heading */}
        <div
          ref={(el) => { refs.current[0] = el; }}
          className="reveal"
          style={{ textAlign: "center", marginBottom: 80 }}
        >
          <span className="mono-tag" style={{ marginBottom: 16, display: "inline-block" }}>
            How it works
          </span>
          <h2
            style={{
              fontSize: "clamp(28px, 3.5vw, 42px)",
              fontWeight: 780,
              letterSpacing: "-0.035em",
              color: "#f0f2f8",
              marginTop: 16,
              lineHeight: 1.15,
            }}
          >
            Three steps. Then it runs itself.
          </h2>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {STEPS.map((step, i) => (
            <div
              key={i}
              ref={(el) => { refs.current[i + 1] = el; }}
              className={`reveal delay-${i + 1}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 56,
                alignItems: "start",
                flexDirection: i % 2 === 1 ? "row-reverse" : "row",
              }}
            >
              {/* Copy side */}
              <div style={{ order: i % 2 === 1 ? 2 : 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                  <div className="step-num">{step.num}</div>
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: "linear-gradient(90deg, #252840, transparent)",
                    }}
                  />
                </div>
                <h3
                  style={{
                    fontSize: "clamp(18px, 2vw, 22px)",
                    fontWeight: 700,
                    letterSpacing: "-0.025em",
                    color: "#e8eaf0",
                    marginBottom: 14,
                    lineHeight: 1.3,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: "#64748b",
                    marginBottom: 16,
                    letterSpacing: "-0.005em",
                  }}
                >
                  {step.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "#5b4a8a",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="#7c3aed" strokeWidth="1.2" opacity="0.5" />
                    <path d="M7 5v3.5M7 9.5v.5" stroke="#7c3aed" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  <span style={{ letterSpacing: "-0.01em" }}>{step.note}</span>
                </div>
              </div>

              {/* Code side */}
              <div style={{ order: i % 2 === 1 ? 1 : 2 }}>
                <div
                  style={{
                    background: "#0a0b14",
                    border: "1px solid #1a1d2e",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  {/* Code bar */}
                  <div
                    style={{
                      padding: "10px 14px",
                      borderBottom: "1px solid #1a1d2e",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <div style={{ display: "flex", gap: 5 }}>
                      {["#ff5f57", "#febc2e", "#28c840"].map((c, j) => (
                        <div key={j} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.6 }} />
                      ))}
                    </div>
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        color: "#4b5568",
                        fontFamily: "monospace",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {i === 0 ? "options.ts" : i === 1 ? "background/index.ts" : "types.ts"}
                    </span>
                  </div>
                  {/* Code content */}
                  <pre
                    style={{
                      padding: "18px 20px",
                      fontSize: 12.5,
                      lineHeight: 1.7,
                      color: "#8892a4",
                      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                      overflowX: "auto",
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    <code
                      dangerouslySetInnerHTML={{
                        __html: highlight(step.code),
                      }}
                    />
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function highlight(code: string): string {
  return code
    .replace(/\/\/.*/g, '<span style="color:#4b5568">$&</span>')
    .replace(/"([^"]+)"/g, '<span style="color:#a78bfa">"$1"</span>')
    .replace(/\b(chrome|const|let|await|return)\b/g, '<span style="color:#7c3aed">$1</span>')
    .replace(/\b(true|false|null)\b/g, '<span style="color:#64748b">$1</span>');
}
