export default function BrainIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="brain-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="brain-grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
      </defs>
      {/* Outer brain shape */}
      <path
        d="M16 4C11.5 4 8 7.5 8 12c0 1.5.4 2.9 1.1 4.1C8.4 17 8 18 8 19c0 2.8 2 5 4.5 5.4V26h7v-1.6C22 23.9 24 21.7 24 19c0-1-.4-2-.9-2.9C23.7 14.9 24 13.5 24 12c0-4.5-3.6-8-8-8z"
        fill="url(#brain-grad)"
        opacity="0.15"
      />
      {/* Brain outline */}
      <path
        d="M16 5.5c-3.6 0-6.5 2.9-6.5 6.5 0 1.2.3 2.4.9 3.4-.6.9-.9 2-.9 3.1 0 2.5 1.7 4.6 4 5.2V25h5v-1.3c2.3-.5 4-2.7 4-5.2 0-1.1-.3-2.2-.9-3.1.6-1 .9-2.1.9-3.4 0-3.6-2.9-6.5-6.5-6.5z"
        stroke="url(#brain-grad)"
        strokeWidth="1.2"
        fill="none"
      />
      {/* Brain folds */}
      <path
        d="M13 10.5c1 .5 2 .5 3 0M13 14c1 .7 2.5.9 3.5.4M15 17.5c.7.5 1.8.6 2.5.2"
        stroke="url(#brain-grad2)"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Vertical center line */}
      <line x1="16" y1="7.5" x2="16" y2="23.5" stroke="url(#brain-grad)" strokeWidth="0.9" opacity="0.4" />
      {/* Neural dots */}
      <circle cx="12" cy="12" r="1.2" fill="#a78bfa" opacity="0.6" />
      <circle cx="20" cy="12" r="1.2" fill="#a78bfa" opacity="0.6" />
      <circle cx="11.5" cy="17" r="1" fill="#7c3aed" opacity="0.5" />
      <circle cx="20.5" cy="17" r="1" fill="#7c3aed" opacity="0.5" />
    </svg>
  );
}
