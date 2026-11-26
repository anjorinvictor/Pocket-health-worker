/**
 * Pocket Health Worker — "Connect to a health worker" (roadmap preview)
 *
 * Clearly labelled "coming soon". No backend, no network call, no effect on triage.
 * Shown on clinic / emergency results. Dialog: focus moves in on open, Esc closes,
 * focus returns to the button on close.
 */

"use client";

import { useEffect, useRef, useState } from "react";

export default function ConnectHealthWorker() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)} className="btn btn-secondary w-full">
        Connect to a health worker
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-espresso/60"
          onClick={close}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="chw-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md card p-6 space-y-4 animate-fade-in"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="chw-title" className="text-xl font-bold">Connect to a health worker</h2>
              <span className="shrink-0 rounded-full bg-clinic-soft text-clinic text-sm font-bold px-3 py-1">
                Coming soon
              </span>
            </div>
            <p>
              Soon you will be able to share this check, with your permission, with a trained Community Health
              Worker near you for a follow-up, a referral, or help getting to care.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted">
              <li>Hand your check to a health worker, only if you agree</li>
              <li>Follow-up by SMS or WhatsApp, even on a basic phone</li>
              <li>Referral to the nearest PHC or hospital</li>
            </ul>
            <p className="text-sm text-muted">
              This is not available yet. If you need care now, use the hospital list and 112.
            </p>
            <button ref={closeRef} type="button" onClick={close} className="btn btn-primary w-full">
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
