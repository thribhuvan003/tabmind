"use client";

import { useEffect, useRef } from "react";
import BrowserMockup from "./BrowserMockup";

export default function Hero() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [tagRef.current, headingRef.current, subRef.current, ctaRef.current];
    els.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      setTimeout(() => {
        if (!el) return;
        el.style.transition = "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 100 + i * 120);
    });
  }, []);

  return (
    <section
      className="dot-grid noise"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "120px 24px 80px",
        overflow: "hidden",
      }}
    >
      {/* Spotlight */}
      <div className="spotlight" />

      {/* Side glow accents */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "-80px",
          width: 300,
          height: 300,
          background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "-60px",
          width: 250,
          height: 250,
          background: "radial-gradient(circle, rgba(99,40,200,0.1) 0%, transparent 70%)",
          filter: "blur(36px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
        }}
      >
        {/* Left: copy */}
        <div>
          <div ref={tagRef} style={{ marginBottom: 24 }}>
            <span className="mono-tag">Chrome Extension · Free · Open Source</span>
          </div>

          <h1
            ref={headingRef}
            style={{
              fontSize: "clamp(40px, 5.5vw, 68px)",
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              color: "#f0f2f8",
              marginBottom: 24,
            }}
          >
            Every tab<br />
            <span className="gradient-text">tells a story.</span>
          </h1>

          <p
            ref={subRef}
            style={{
              fontSize: "clamp(15px, 1.6vw, 18px)",
              lineHeight: 1.65,
              color: "#94a3b8",
              maxWidth: 440,
              marginBottom: 40,
              letterSpacing: "-0.01em",
            }}
          >
            TabMind watches your browser silently, then surfaces what you've been working on — in plain language. No input needed. No interruptions.
          </p>

          <div ref={ctaRef} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <a
              href="https://chromewebstore.google.com"
              className="btn-primary"
              style={{ fontSize: 15, padding: "13px 32px" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" opacity="0.5" />
                <circle cx="12" cy="12" r="4" fill="currentColor" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
              </svg>
              Install for Chrome
            </a>
            <a
              href="https://github.com/thribhuvan003/tabmind"
              className="btn-ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              View source
            </a>
          </div>

          {/* Social proof line */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 48,
              paddingTop: 32,
              borderTop: "1px solid #1a1d2e",
            }}
          >
            <Stat value="90s" label="snapshot interval" />
            <div style={{ width: 1, height: 28, background: "#1a1d2e" }} />
            <Stat value="100%" label="local storage" />
            <div style={{ width: 1, height: 28, background: "#1a1d2e" }} />
            <Stat value="MV3" label="manifest v3" />
          </div>
        </div>

        {/* Right: browser mockup */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <BrowserMockup />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: "#a78bfa",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: "#4b5568", letterSpacing: "0.02em", marginTop: 1 }}>
        {label}
      </div>
    </div>
  );
}
