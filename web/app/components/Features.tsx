"use client";

import { useEffect, useRef } from "react";

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" fill="#a78bfa" opacity="0.6"/>
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    title: "Passive by design",
    description:
      "TabMind runs entirely in the background. No buttons to click, no commands to run. It watches your tabs every 90 seconds and builds a picture of your session automatically.",
    tag: "zero friction",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V9l-6-6z" stroke="#a78bfa" strokeWidth="1.7" strokeLinejoin="round"/>
        <path d="M9 3v6h6" stroke="#a78bfa" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        <path d="M7 13h10M7 17h6" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      </svg>
    ),
    title: "Plain-language summaries",
    description:
      "Gemini reads your open tab titles and URLs, then returns a one-sentence description of what you're working on. No page content is sent — just titles and URLs.",
    tag: "gemini api",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#a78bfa" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#a78bfa" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
      </svg>
    ),
    title: "Per-page notes",
    description:
      "Attach a note to any URL. It follows you across visits and persists in chrome.storage.local. Useful for research, debugging sessions, or just thinking out loud.",
    tag: "url-scoped",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 11l3 3L22 4" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#a78bfa" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
      </svg>
    ),
    title: "Auto-extracted todos",
    description:
      "The AI picks out action items from what you're browsing — open issues, docs you bookmarked, steps you were following. They appear in the widget without you writing a single thing.",
    tag: "ai extracted",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="#a78bfa" strokeWidth="1.7"/>
        <path d="M8 21h8M12 17v4" stroke="#a78bfa" strokeWidth="1.7" strokeLinecap="round" opacity="0.6"/>
        <path d="M6 7h4M6 11h12" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    title: "Floating widget",
    description:
      "A draggable overlay that lives on every page. Minimize it to a brain-icon orb. It persists its position across sessions and stays well out of your way until you want it.",
    tag: "content script",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#a78bfa" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="#a78bfa" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
      </svg>
    ),
    title: "30-session history",
    description:
      "Your last 30 sessions are kept in chrome.storage.local. No cloud account, no sync server, no telemetry. The only external request TabMind makes is to the Gemini API.",
    tag: "local only",
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    cards.forEach((c) => observer.observe(c));
    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="features"
      style={{
        padding: "120px 24px",
        position: "relative",
      }}
    >
      {/* Section label + heading */}
      <div
        ref={sectionRef}
        className="reveal"
        style={{ textAlign: "center", marginBottom: 72, maxWidth: 560, margin: "0 auto 72px" }}
      >
        <span className="mono-tag" style={{ marginBottom: 20, display: "inline-block" }}>
          Features
        </span>
        <h2
          style={{
            fontSize: "clamp(28px, 3.5vw, 42px)",
            fontWeight: 780,
            letterSpacing: "-0.035em",
            color: "#f0f2f8",
            lineHeight: 1.15,
            marginTop: 16,
          }}
        >
          Built to stay out of your way
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "#64748b",
            lineHeight: 1.65,
            marginTop: 14,
            letterSpacing: "-0.01em",
          }}
        >
          Every decision optimised for low friction. The best productivity tool is one you don't notice.
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        {FEATURES.map((f, i) => (
          <div
            key={i}
            ref={(el) => { cardRefs.current[i] = el; }}
            className={`reveal feature-card delay-${i + 1}`}
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid #1a1d2e",
              borderRadius: 14,
              padding: "28px 28px 30px",
            }}
          >
            {/* Icon container */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              {f.icon}
            </div>

            {/* Title + tag */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 650,
                  letterSpacing: "-0.02em",
                  color: "#e8eaf0",
                }}
              >
                {f.title}
              </h3>
            </div>

            {/* Tag */}
            <div style={{ marginBottom: 12 }}>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 9.5,
                  fontWeight: 500,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "#5b4a8a",
                  background: "rgba(91,74,138,0.12)",
                  border: "1px solid rgba(91,74,138,0.2)",
                  padding: "2px 8px",
                  borderRadius: 99,
                }}
              >
                {f.tag}
              </span>
            </div>

            <p
              style={{
                fontSize: 13.5,
                lineHeight: 1.65,
                color: "#64748b",
                letterSpacing: "-0.005em",
              }}
            >
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
