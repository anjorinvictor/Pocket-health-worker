/**
 * Pocket Health Worker — Crisis Support Component
 *
 * Rendered deterministically BEFORE AI calls if crisis or self-harm keywords are detected.
 * Provides a gentle, non-judgmental, clinical-soothing screen encouraging immediate human connection.
 * Displays verified, clickable, live Nigerian helplines (MANI and SURPIN) as primary action items (SDG 3 safety core).
 */

"use client";

interface Props {
  onReset: () => void;
}

export default function CrisisSupport({ onReset }: Props) {
  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div className="bg-gradient-to-b from-indigo-50/70 to-blue-50/30 border border-indigo-100/60 rounded-3xl p-6 md:p-8 space-y-5 shadow-sm shadow-indigo-100/30">
        <div className="text-center text-4xl" aria-hidden>
          💙
        </div>
        
        <h2 className="text-xl font-bold text-slate-800 text-center tracking-tight">
          You are not alone.
        </h2>
        
        <p className="text-slate-600 text-sm leading-relaxed">
          It sounds like you are going through a very heavy and painful time right now. Sharing how you feel takes incredible courage, and we want you to know that your life matters.
        </p>
        
        <p className="text-slate-600 text-sm leading-relaxed">
          Please reach out to a trusted loved one, a close friend, a community leader, or a health worker. You do not have to carry this heavy burden by yourself.
        </p>

        {/* Clickable Crisis Numbers */}
        <div className="bg-white rounded-2xl border border-indigo-50 p-5 space-y-3 shadow-sm">
          <p className="font-bold text-slate-700 text-xs uppercase tracking-wider">
            Free, Confidential Nigerian Helplines (24/7)
          </p>
          
          <div className="space-y-3 text-sm text-slate-600">
            {/* MANI Hotline */}
            <div className="flex items-start gap-2 border-b border-slate-50 pb-2">
              <span className="text-base flex-shrink-0" aria-hidden>📞</span>
              <div>
                <p className="font-semibold text-slate-800 text-xs">Mentally Aware Nigeria Initiative (MANI)</p>
                <div className="flex flex-col gap-1 mt-0.5">
                  <a
                    href="tel:08091116264"
                    className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors text-sm"
                  >
                    0809 111 6264
                  </a>
                  <a
                    href="tel:08111680686"
                    className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors text-sm"
                  >
                    0811 168 0686
                  </a>
                </div>
              </div>
            </div>

            {/* SURPIN Hotline */}
            <div className="flex items-start gap-2 pt-1">
              <span className="text-base flex-shrink-0" aria-hidden>📞</span>
              <div>
                <p className="font-semibold text-slate-800 text-xs">SURPIN (Suicide Research & Prevention Initiative)</p>
                <a
                  href="tel:080000787746"
                  className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors mt-0.5 inline-block text-sm"
                >
                  0800 0078 7746
                </a>
              </div>
            </div>
          </div>
        </div>

        <p className="text-slate-400 text-[11px] text-center leading-relaxed px-4 pt-1">
          This digital assistant is informational and does not replace active crisis counseling. If you are in immediate threat, please seek shelter at the nearest hospital.
        </p>
      </div>

      <button
        onClick={onReset}
        className="w-full py-3.5 rounded-2xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] transform transition-all duration-200 cursor-pointer"
      >
        ↩ Return to Home Screen
      </button>
    </div>
  );
}
