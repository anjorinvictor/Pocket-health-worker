/**
 * Pocket Health Worker — "Connect to a Health Worker" (Roadmap Stub)
 *
 * A fully self-contained button + modal that previews an upcoming feature:
 * connecting the user to a local Community Health Worker (CHW). This is a clearly
 * labelled "coming soon" roadmap stub with NO backend — it never calls a network,
 * never touches the triage or safety flows, and only manages its own open/close state.
 *
 * Shown only on YELLOW / RED results (where escalation to a human matters most) to
 * demonstrate product evolution without adding any risk to the live demo.
 */

"use client";

import { useState, useEffect } from "react";

export default function ConnectHealthWorker() {
  const [open, setOpen] = useState(false);

  // Allow Esc to close — purely local UX, no global side effects.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold text-xs uppercase tracking-wider hover:bg-emerald-100 active:scale-[0.99] transform transition-all duration-200 cursor-pointer shadow-sm text-center flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
        Connect to a health worker
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="chw-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 md:p-7 space-y-5 animate-scale-up"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </span>
                <h3 id="chw-title" className="text-base font-bold text-slate-800 leading-tight">
                  Connect to a health worker
                </h3>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1 flex-shrink-0">
                Coming soon
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Soon you&apos;ll be able to securely share this check with a trained{" "}
              <span className="font-semibold text-slate-700">Community Health Worker (CHW)</span> near
              you — for a real human follow-up, a referral, or help arranging care.
            </p>

            <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">On the roadmap</p>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" aria-hidden />
                  Hand-off your assessment to a CHW with your consent
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" aria-hidden />
                  Follow-up over SMS or WhatsApp — works on basic phones
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" aria-hidden />
                  Referral routing into the nearest PHC or general hospital
                </li>
              </ul>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              This is a preview of a planned feature and is not yet available. For now, if you need
              care, please use the clinic directory and emergency numbers shown above.
            </p>

            <button
              onClick={() => setOpen(false)}
              className="w-full py-3 rounded-xl bg-[#ac4c28] hover:bg-[#913d1e] text-white font-bold text-xs uppercase tracking-wider active:scale-[0.99] transform transition-all duration-200 cursor-pointer shadow-sm text-center"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
