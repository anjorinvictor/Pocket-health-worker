/**
 * Pocket Health Worker — Data Saver switch
 *
 * What it really does when on (see app/page.tsx and app/api/triage/route.ts):
 *  - emergencies are answered on the phone by the rules engine — no data used;
 *  - the AI gets a shorter instruction and a hard cap on answer length;
 *  - follow-up messages send only the first complaint and the latest turns.
 * The setting is kept in memory only (nothing stored), so it resets on reload.
 */

"use client";

interface Props {
  on: boolean;
  onChange: (on: boolean) => void;
  /** Compact pill for the header; full row for the tools panel. */
  variant?: "header" | "row";
}

export default function DataSaverToggle({ on, onChange, variant = "row" }: Props) {
  if (variant === "header") {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className="btn btn-on-dark rounded-full px-3.5 text-sm"
      >
        <span aria-hidden className={`w-2.5 h-2.5 rounded-full ${on ? "bg-espresso" : "border border-cream"}`} />
        Data Saver {on ? "on" : "off"}
      </button>
    );
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 id="ds-label" className="text-xl font-bold">Data Saver</h2>
        <p id="ds-desc" className="text-sm text-muted mt-0.5">
          Uses less data: emergencies are answered on your phone, and AI answers are kept short.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby="ds-label"
        aria-describedby="ds-desc"
        onClick={() => onChange(!on)}
        className="shrink-0 min-h-12 min-w-16 flex items-center justify-center cursor-pointer rounded-full"
      >
        {/* 48px tap area; the visible track sits inside it. */}
        <span
          aria-hidden
          className={`relative block w-14 h-8 rounded-full border-2 ${on ? "bg-rust border-rust" : "bg-sand border-edge"}`}
        >
          <span
            className={`absolute top-0.5 w-6 h-6 rounded-full bg-paper shadow transition-transform ${
              on ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </span>
        <span className="sr-only">{on ? "On" : "Off"}</span>
      </button>
    </div>
  );
}
