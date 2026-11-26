/**
 * Pocket Health Worker — small inline icons (no icon library: keeps the bundle small).
 * All decorative: callers pair each icon with visible text.
 */

type P = { className?: string };
const base = "shrink-0";

export function PhoneIcon({ className = "w-5 h-5" }: P) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={`${base} ${className}`}>
      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8Z" />
    </svg>
  );
}

export function AlertIcon({ className = "w-6 h-6" }: P) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={`${base} ${className}`}>
      <path fillRule="evenodd" d="M9.4 3.5c1.2-2 4-2 5.2 0l7.4 12.8c1.1 2-.3 4.5-2.6 4.5H4.6c-2.3 0-3.7-2.5-2.6-4.5L9.4 3.5ZM12 8.3a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0v-4a1 1 0 0 1 1-1Zm0 8.7a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z" clipRule="evenodd" />
    </svg>
  );
}

export function HomeIcon({ className = "w-5 h-5" }: P) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`${base} ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5M10 20v-5h4v5" />
    </svg>
  );
}

export function ClinicIcon({ className = "w-5 h-5" }: P) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`${base} ${className}`}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path strokeLinecap="round" d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function ArrowLeftIcon({ className = "w-5 h-5" }: P) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className={`${base} ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12l7.5-7.5M3 12h18" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "w-5 h-5" }: P) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className={`${base} ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12l-7.5 7.5M21 12H3" />
    </svg>
  );
}

export function PinIcon({ className = "w-5 h-5" }: P) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`${base} ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function WifiOffIcon({ className = "w-5 h-5" }: P) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`${base} ${className}`}>
      <path strokeLinecap="round" d="M3 3l18 18M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 4.3-2.5M19 12.9a10 10 0 0 0-2.4-1.7M2 9.3a15 15 0 0 1 4-2.6M22 9.3A15 15 0 0 0 11 5.1" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

export function ChatIcon({ className = "w-6 h-6" }: P) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`${base} ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v11H9l-5 4V5Z" />
    </svg>
  );
}

export function BodyIcon({ className = "w-6 h-6" }: P) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`${base} ${className}`}>
      <circle cx="12" cy="4.5" r="2.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9h12M12 9v6m0 0-3 6m3-6 3 6" />
    </svg>
  );
}

export function SendIcon({ className = "w-5 h-5" }: P) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className={`${base} ${className}`}>
      <path d="M3.1 2.3a.75.75 0 0 0-.8.9l1.4 5A1.5 1.5 0 0 0 5.1 9.3h6.2a.75.75 0 0 1 0 1.5H5.1a1.5 1.5 0 0 0-1.4 1.1l-1.4 4.9a.75.75 0 0 0 .8 1 28.9 28.9 0 0 0 15.3-7.2.75.75 0 0 0 0-1.1A28.9 28.9 0 0 0 3.1 2.3Z" />
    </svg>
  );
}

export function PillIcon({ className = "w-6 h-6" }: P) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`${base} ${className}`}>
      <rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)" />
      <path strokeLinecap="round" d="M9.5 9.5l5 5" />
    </svg>
  );
}
