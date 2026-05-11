/**
 * TabMind design tokens — Superhuman-inspired dark glass.
 *
 * Palette decisions:
 *   - background is not pure black; warm-cool deep neutral (#0b0b0f) so glass blur reads.
 *   - accent is a single restrained violet (oklch ~67% C0.18 H285) — no rainbow.
 *   - hairline borders + inset highlight on top for the "etched glass" effect.
 *
 * Easing is Japanese-influenced: heavy ease-out, never linear, never bouncy.
 *   - "Yūgen" curve for entries: cubic-bezier(0.16, 1, 0.3, 1) — easeOutExpo
 *   - "Ma" curve for micro-actions: cubic-bezier(0.22, 1, 0.36, 1) — easeOutQuart
 */

export const T = {
  /* surfaces */
  glass: "rgba(14, 14, 18, 0.72)",
  glassRaised: "rgba(20, 20, 26, 0.78)",
  border: "rgba(255, 255, 255, 0.07)",
  borderStrong: "rgba(255, 255, 255, 0.12)",
  inset: "rgba(255, 255, 255, 0.06)",

  /* text */
  text: "#f3f4f7",
  textDim: "#a1a4b0",
  textFaint: "#6b6f7d",
  textTrace: "#42454f",

  /* accent (single violet) */
  accent: "#a78bfa",
  accentSoft: "rgba(167, 139, 250, 0.14)",
  accentLine: "rgba(167, 139, 250, 0.32)",
  accentDeep: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",

  /* radii */
  rLg: "16px",
  rMd: "10px",
  rSm: "7px",
  rPill: "999px",

  /* shadows */
  shadowFloat:
    "0 24px 64px rgba(0, 0, 0, 0.45), 0 8px 18px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
  shadowOrb: "0 12px 32px rgba(99, 40, 200, 0.4), inset 0 1px 0 rgba(255,255,255,0.15)",

  /* type */
  font: '"Geist", "Inter Variable", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  mono: '"Geist Mono", "JetBrains Mono", ui-monospace, monospace',

  /* motion */
  easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeOutQuart: "cubic-bezier(0.22, 1, 0.36, 1)",
  dur: "240ms",
  durFast: "120ms",
} as const;

/**
 * Inject the Geist font once at the document level. Shadow DOM children
 * inherit document fonts, so this works even with our shadow root widget.
 */
let fontInjected = false;
export function ensureFont() {
  if (fontInjected || typeof document === "undefined") return;
  fontInjected = true;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap";
  document.head.appendChild(link);
}
