/**
 * Pocket Health Worker — Triage Result Card
 *
 * Overhauls the results presentation into a premium "Clinical Triage Report."
 * Visualizes the final assessment, reasoning, general possibilities, and disclaimer 
 * using sophisticated glassmorphism and clear grid layouts. Integrates our native 
 * ShareCheck action bar and provides a prominent emergency escalation warning if RED (SDG 3).
 */

/**
 * Pocket Health Worker — Triage Result Card
 *
 * Visually renders the output of the AI triage engine, transforming raw JSON
 * into a highly readable, color-coded, and actionable medical report.
 * 
 * CORE ARCHITECTURE & HACKATHON ALIGNMENT:
 * - UN SDG 3: Provides clear, actionable health guidance to reduce maternal and infant mortality.
 * - Safety-First: Conditionally renders the 'Emergency Bridge Panel' on RED results, forcing logistics over home care.
 */

"use client";

import type { TriageResult, ChatTurn } from "@/types";
import UrgencyBadge from "./UrgencyBadge";
import EmergencyBanner from "./EmergencyBanner";
import ShareCheck from "./ShareCheck";

interface Props {
  result: TriageResult;
  history: ChatTurn[];
  onReset: () => void;
  onContinue?: () => void;
}

export default function ResultCard({ result, history, onReset, onContinue }: Props) {
  const isRed = result.urgencyLevel === "RED";

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Prominent Emergency Flag & Emergency Bridge Panel */}
      {isRed && (
        <div className="space-y-4">
          <EmergencyBanner message="Your symptoms indicate potential high-risk indicators. Do not wait for self-healing." />
          
          {/* Emergency Bridge Panel */}
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 space-y-5 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <h3 className="text-sm font-bold text-red-900 uppercase tracking-widest">Emergency — Get Help Now</h3>
            </div>
            
            <p className="text-xs text-red-800 font-medium leading-relaxed">
              Do not attempt to manage these symptoms at home. Head to the nearest General Hospital Emergency Department immediately.
            </p>

            <div className="space-y-3">
              {/* Reach care fast */}
              <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-sm flex flex-col gap-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Reach Care Fast</p>
                <div className="flex flex-col gap-2">
                  <a href="tel:112" className="flex items-center justify-between w-full p-3 bg-red-50 hover:bg-red-100 transition-colors rounded-xl border border-red-100 text-red-900 font-bold text-xs cursor-pointer">
                    <span>Call National Emergency: 112</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" /></svg>
                  </a>
                  <button type="button" className="flex items-center justify-between w-full p-3 bg-red-50 hover:bg-red-100 transition-colors rounded-xl border border-red-100 text-red-900 font-bold text-xs text-left cursor-pointer">
                    <span>[LOCAL AMBULANCE LINE — developer to verify and insert]</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0"><path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              </div>

              {/* No transport */}
              <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1.5">No transport? Get moving now</p>
                <p className="text-xs text-red-800 font-medium leading-relaxed">
                  If you have no way to get there, call a neighbour, an okada/keke rider, or an ambulance service right now — do not wait.
                </p>
              </div>

              {/* Talk to someone now */}
              <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-sm flex flex-col gap-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Talk to someone now</p>
                <button type="button" className="flex items-center justify-between w-full p-3 bg-red-50 hover:bg-red-100 transition-colors rounded-xl border border-red-100 text-red-900 font-bold text-xs text-left cursor-pointer">
                  <span>[MEDICAL/EMERGENCY HOTLINE — developer to verify and insert]</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0"><path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Report Dashboard */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-md shadow-slate-100/50 p-6 space-y-6">
        {/* Header Block */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider">Triage Report</span>
          </div>
          <UrgencyBadge level={result.urgencyLevel} />
        </div>

        {/* Assessment Plain Summary */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Clinical Assessment</p>
          <p className="text-base font-medium text-slate-800 leading-relaxed">
            {result.assessment}
          </p>
        </div>

        {/* Clinical Reasoning */}
        <div className="space-y-1.5 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/60">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reasoning Details</p>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {result.reasoning}
          </p>
        </div>

        {/* Actionable Next Steps */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recommended Steps (Nigeria)</p>
          <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-gradient-to-tr from-[#faf9f6] to-[#f4f7f6] border border-slate-100 rounded-2xl p-4 shadow-sm font-medium">
            {result.recommendedAction}
          </div>
        </div>

        {/* General Underlying Causes */}
        {result.generalCauses && result.generalCauses.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              General Possibilities <span className="font-normal text-slate-400 normal-case">(informational only)</span>
            </p>
            <ul className="grid grid-cols-1 gap-1.5">
              {result.generalCauses.map((cause, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-xs text-slate-600 font-normal bg-slate-50/40 rounded-xl px-3 py-2 border border-slate-50/60"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" aria-hidden />
                  {cause}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sticky Legal Disclaimer */}
        <div className="border-t border-slate-100 pt-4">
          <p className="text-[10px] text-slate-400 leading-relaxed font-normal">
            {result.disclaimer}
          </p>
        </div>
      </div>

      {/* Floating Action Button Bar */}
      <div className="flex flex-col gap-2 pt-2">
        {onContinue && (
          <button
            onClick={onContinue}
            className="w-full py-4 rounded-xl bg-[#ac4c28] hover:bg-[#913d1e] text-white font-bold text-xs uppercase tracking-wider active:scale-[0.99] transform transition-all duration-200 cursor-pointer shadow-md shadow-[#ac4c28]/10 text-center flex items-center justify-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" />
            </svg>
            Continue Conversation with AI
          </button>
        )}
        <ShareCheck result={result} history={history} />
        
        <button
          onClick={onReset}
          className="w-full py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider hover:bg-slate-100 active:scale-[0.99] transform transition-all duration-200 cursor-pointer shadow-sm text-center flex items-center justify-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Start New Assessment
        </button>
      </div>
    </div>
  );
}
