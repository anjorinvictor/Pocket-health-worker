/**
 * Pocket Health Worker — Offline Triage Result Card
 *
 * Visually distinct from the online AI ResultCard. Renders the output of the local deterministic triage engine.
 * 
 * CORE ARCHITECTURE & HACKATHON ALIGNMENT:
 * - UN SDG 3: Ensures life-saving triage continues even in regions with zero mobile data.
 * - Safety-First: Includes an honest "rules-based" banner to prevent false reassurance.
 * - Offline-First: Renders a fully cached PHC directory for immediate offline referral.
 */

"use client";

import type { OfflineTriageResult } from "@/lib/triage/offlineTriage";
import UrgencyBadge from "./UrgencyBadge";
import EmergencyBanner from "./EmergencyBanner";

interface PHC {
  name: string;
  type: string;
  address: string;
  phone: string;
}

const PHC_DIRECTORY: Record<string, PHC[]> = {
  Lagos: [
    { name: "Yaba Primary Health Centre", type: "PHC / Clinic", address: "32, Herbert Macaulay Way, Yaba, Lagos", phone: "0802 301 9283" },
    { name: "Ebute Metta Comprehensive Health Centre", type: "PHC / Clinic", address: "Cemetery Street, Ebute Metta, Lagos", phone: "0803 440 2931" },
    { name: "Lagos Island General Hospital", type: "General Hospital / Emergency", address: "1-3, Broad Street, Lagos Island", phone: "0812 390 1029" },
    { name: "Ikeja General Hospital", type: "General Hospital / Emergency", address: "Opp. Local Govt Secretariat, Ikeja, Lagos", phone: "0803 309 2102" },
    { name: "Lagos University Teaching Hospital (LUTH)", type: "Teaching Hospital / Emergency", address: "Ishaga Road, Idi-Araba, Surulere, Lagos", phone: "0802 293 1122" },
  ],
  Abuja: [
    { name: "Garki Primary Health Centre", type: "PHC / Clinic", address: "Area 11, Garki, Abuja", phone: "0805 920 1120" },
    { name: "Wuse District Hospital", type: "General Hospital / Emergency", address: "Conakry Street, Wuse Zone 3, Abuja", phone: "0809 310 9940" },
    { name: "National Hospital Abuja", type: "Teaching Hospital / Trauma Centre", address: "Plot 272, Central Business District, Abuja", phone: "09 623 7820" },
    { name: "Maitama District Hospital", type: "General Hospital / Emergency", address: "Aguiyi-Ironsi Way, Maitama, Abuja", phone: "0805 400 1029" },
  ],
  Oyo: [
    { name: "Ibadan North Primary Health Centre", type: "PHC / Clinic", address: "Bodija Road, Ibadan North, Oyo State", phone: "0802 911 3829" },
    { name: "Ring Road State Hospital", type: "General Hospital / Emergency", address: "Ring Road, Ibadan, Oyo State", phone: "0803 720 1192" },
    { name: "University College Hospital (UCH)", type: "Teaching Hospital / Trauma Centre", address: "Queen Elizabeth Road, Ibadan", phone: "02 241 0088" },
  ],
  Kano: [
    { name: "Nassarawa Primary Health Centre", type: "PHC / Clinic", address: "Hadejia Road, Nassarawa, Kano State", phone: "0806 290 8831" },
    { name: "Murtala Muhammad Specialist Hospital", type: "General Hospital / Emergency", address: "Kofar Mata, Kano City, Kano State", phone: "0803 410 2038" },
    { name: "Aminu Kano Teaching Hospital", type: "Teaching Hospital / Emergency", address: "Zaria Road, Kano", phone: "064 669 860" },
  ],
  Rivers: [
    { name: "Mile 3 Primary Health Centre", type: "PHC / Clinic", address: "Ikwerre Road, Mile 3, Port Harcourt, Rivers State", phone: "0802 331 4092" },
    { name: "Port Harcourt General Hospital", type: "General Hospital / Emergency", address: "Hospital Road, Town, Port Harcourt", phone: "0803 992 1029" },
    { name: "Rivers State University Teaching Hospital", type: "Teaching Hospital / Trauma Centre", address: "Harley Street, Old GRA, Port Harcourt", phone: "084 461 611" },
  ],
  Enugu: [
    { name: "Enugu Urban Primary Health Centre", type: "PHC / Clinic", address: "Agbani Road, Uwani, Enugu, Enugu State", phone: "0803 729 1029" },
    { name: "ESUT Teaching Hospital (Parklane)", type: "Teaching Hospital / Emergency", address: "Parklane, GRA, Enugu", phone: "042 251 012" },
    { name: "National Orthopaedic Hospital Enugu", type: "Teaching Hospital / Specialist", address: "Enugu-Onitsha Expressway, Enugu", phone: "0803 590 1928" },
  ],
  Kaduna: [
    { name: "Kaduna South Primary Health Centre", type: "PHC / Clinic", address: "Tudun Wada, Kaduna South, Kaduna State", phone: "0805 390 1022" },
    { name: "Barau Dikko Teaching Hospital", type: "Teaching Hospital / Emergency", address: "Lafia Road, Kaduna, Kaduna State", phone: "0803 330 2931" },
    { name: "44 Nigerian Army Reference Hospital", type: "Military Hospital / Emergency", address: "Abakpa Barracks, Kaduna", phone: "0803 550 1922" },
  ],
  Edo: [
    { name: "Oredo Primary Health Centre", type: "PHC / Clinic", address: "Airport Road, Benin City, Edo State", phone: "0812 490 2031" },
    { name: "Stella Obasanjo Women and Children Hospital", type: "General Hospital / Emergency", address: "Sapele Road, Benin City, Edo State", phone: "0803 890 2231" },
    { name: "University of Benin Teaching Hospital (UBTH)", type: "Teaching Hospital / Emergency", address: "PMB 1111, Benin City, Edo State", phone: "052 600 300" },
  ],
  Delta: [
    { name: "Central Hospital Warri", type: "General Hospital / Emergency", address: "Hospital Road, Warri, Delta State", phone: "0803 590 4010" },
    { name: "Federal Medical Centre Asaba", type: "Teaching Hospital / Emergency", address: "Nnebisi Road, Asaba, Delta State", phone: "0803 210 3902" },
  ],
  Ondo: [
    { name: "State Specialist Hospital Akure", type: "General Hospital / Emergency", address: "Ondo Road, Akure, Ondo State", phone: "0803 760 2198" },
    { name: "Federal Medical Centre Owo", type: "Teaching Hospital / Emergency", address: "Ikare Road, Owo, Ondo State", phone: "0803 490 2939" },
  ],
  Anambra: [
    { name: "Nnamdi Azikiwe University Teaching Hospital", type: "Teaching Hospital / Emergency", address: "Nnewi, Anambra State", phone: "046 460 276" },
    { name: "General Hospital Onitsha", type: "General Hospital / Emergency", address: "New Market Road, Onitsha, Anambra State", phone: "0803 220 3822" },
  ],
  Borno: [
    { name: "State Specialist Hospital Maiduguri", type: "General Hospital / Emergency", address: "Hospital Road, Maiduguri, Borno State", phone: "0803 710 2398" },
    { name: "University of Maiduguri Teaching Hospital", type: "Teaching Hospital / Emergency", address: "Bama Road, Maiduguri, Borno State", phone: "076 232 052" },
  ],
  Osun: [
    { name: "Obafemi Awolowo University Teaching Hospital (OAUTHC)", type: "Teaching Hospital / Emergency", address: "Ilesa-Ife Road, Ile-Ife, Osun State", phone: "036 230 190" },
    { name: "Asubiaro General Hospital", type: "General Hospital / Emergency", address: "Asubiaro, Osogbo, Osun State", phone: "0803 920 2018" },
  ],
};

interface Props {
  result: OfflineTriageResult;
  onReset: () => void;
}

export default function OfflineResultCard({ result, onReset }: Props) {
  const isRed = result.urgencyLevel === "RED";

  /* ── Inline PHC directory ──────────────────────────────────── */
  const stateKeys = Object.keys(PHC_DIRECTORY);
  const defaultState = stateKeys[0];

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Emergency Bridge for RED */}
      {isRed && (
        <div className="space-y-4">
          <EmergencyBanner message="Your symptoms indicate potential high-risk indicators. Do not wait for self-healing." />
          
          {/* Emergency Bridge Panel (same as online RED) */}
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
              <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-sm flex flex-col gap-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Reach Care Fast</p>
                <a href="tel:112" className="flex items-center justify-between w-full p-3 bg-red-50 hover:bg-red-100 transition-colors rounded-xl border border-red-100 text-red-900 font-bold text-xs cursor-pointer">
                  <span>Call National Emergency: 112</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" /></svg>
                </a>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1.5">No transport? Get moving now</p>
                <p className="text-xs text-red-800 font-medium leading-relaxed">
                  If you have no way to get there, call a neighbour, an okada/keke rider, or an ambulance service right now — do not wait.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Honest Offline Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5">
          <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-xs font-bold text-amber-900">Offline — Preliminary Rules-Based Check</p>
          <p className="text-[10px] text-amber-700 leading-relaxed mt-0.5">
            This is not a full AI assessment. Reconnect to the internet for a complete triage analysis. When in doubt, see a health worker.
          </p>
        </div>
      </div>

      {/* Main Report Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-md shadow-slate-100/50 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-amber-500">
              <path fillRule="evenodd" d="M2.25 6a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V6Zm3.97.97a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 0 1-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 0 1 0-1.06Zm4.28 4.28a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider">Offline Safety Check</span>
          </div>
          <UrgencyBadge level={result.urgencyLevel} />
        </div>

        {/* Assessment */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Assessment</p>
          <p className="text-base font-medium text-slate-800 leading-relaxed">
            {result.headline}
          </p>
        </div>

        {/* Details */}
        <div className="space-y-1.5 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/60">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Guidance</p>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {result.details}
          </p>
        </div>

        {/* Warning Signs */}
        {result.warningSignsToWatch.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Watch For These Warning Signs
            </p>
            <ul className="grid grid-cols-1 gap-1.5">
              {result.warningSignsToWatch.map((sign, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-xs text-slate-600 font-normal bg-rose-50/40 rounded-xl px-3 py-2 border border-rose-50/60"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" aria-hidden />
                  {sign}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer */}
        <div className="border-t border-slate-100 pt-4">
          <p className="text-[10px] text-slate-400 leading-relaxed font-normal">
            This offline assessment is based on general clinical rules and the information you provided. It is not a diagnosis and does not replace professional medical advice. Always consult a qualified health worker for any concerns about your health.
          </p>
        </div>
      </div>

      {/* Inline PHC Directory */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
        <div className="space-y-0.5">
          <h4 className="text-sm font-extrabold text-slate-700">Find a Clinic Near You</h4>
          <p className="text-[10px] text-slate-400 font-medium">Select your state to see available health facilities</p>
        </div>

        <select
          defaultValue={defaultState}
          id="offline-phc-state"
          className="w-full px-3 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl focus:outline-none bg-slate-50 cursor-pointer"
          onChange={(e) => {
            const list = document.getElementById("offline-phc-list");
            if (list) {
              const cards = list.querySelectorAll("[data-state]");
              cards.forEach((card) => {
                const el = card as HTMLElement;
                el.style.display = el.dataset.state === e.target.value ? "block" : "none";
              });
            }
          }}
        >
          {stateKeys.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>

        <div id="offline-phc-list" className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {stateKeys.map((state) =>
            PHC_DIRECTORY[state].map((phc, idx) => (
              <div
                key={`${state}-${idx}`}
                data-state={state}
                style={{ display: state === defaultState ? "block" : "none" }}
                className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 transition-all duration-200"
              >
                <div className="flex justify-between items-start gap-1">
                  <p className="text-[11px] font-bold text-slate-700 leading-tight">{phc.name}</p>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-white border border-slate-100 text-slate-400 uppercase tracking-wide rounded-md flex-shrink-0">
                    {phc.type.split(" / ")[0]}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  {phc.address}
                </p>
                <a
                  href={`tel:${phc.phone.replace(/\s+/g, "")}`}
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 hover:underline flex items-center gap-1 mt-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" /></svg>
                  Call: {phc.phone}
                </a>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-2">
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
