/**
 * Pocket Health Worker — brand mark.
 * A medical cross (care) with a heartbeat line through it (health), joined at both ends by
 * nodes and a signal arc (technology, connection). Same drawing as public/icon.svg.
 * The heartbeat draws itself once on load (off for reduced motion, see globals.css).
 */

export default function Logo({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true" focusable="false">
      <rect width="512" height="512" rx="120" fill="#1c1412" />
      <g fill="#ad4a2b">
        <rect x="196" y="96" width="120" height="320" rx="30" />
        <rect x="96" y="196" width="320" height="120" rx="30" />
      </g>
      <polyline
        className="logo-beat"
        points="118,256 198,256 226,204 262,318 294,232 314,256 394,256"
        fill="none"
        stroke="#f6f2eb"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={100}
      />
      <circle cx="118" cy="256" r="17" fill="#e58a5f" />
      <circle cx="394" cy="256" r="17" fill="#e58a5f" />
      <g fill="none" stroke="#e58a5f" strokeWidth="18" strokeLinecap="round" className="logo-signal">
        <path d="M352 120 a46 46 0 0 1 40 40" />
        <path d="M354 76 a90 90 0 0 1 82 82" />
      </g>
    </svg>
  );
}
