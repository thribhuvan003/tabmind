/**
 * TabMind brand mark — orbit + central node, not a brain emoji.
 * Pure SVG so it stays crisp at any size and we don't ship an emoji.
 */
export function Mark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="tm-mark-grad" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      {/* outer orbit */}
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="url(#tm-mark-grad)"
        strokeWidth="1.4"
        opacity="0.55"
      />
      {/* tilted inner orbit */}
      <ellipse
        cx="12"
        cy="12"
        rx="9"
        ry="3.6"
        stroke="url(#tm-mark-grad)"
        strokeWidth="1.2"
        opacity="0.4"
        transform="rotate(-28 12 12)"
      />
      {/* central node */}
      <circle cx="12" cy="12" r="2.6" fill="url(#tm-mark-grad)" />
      {/* satellite */}
      <circle cx="20" cy="6.5" r="1.5" fill="#a78bfa" />
    </svg>
  );
}
