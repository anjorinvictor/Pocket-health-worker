/**
 * Pocket Health Worker — Welcome Screen (Editorial Masterpiece)
 *
 * Implements the flagship split editorial layout matching modern clinical portals.
 *  - Left Pane (Bronze-Terracotta): Houses brand testimonials, statistics, and pillars.
 *  - Right Pane (Soft Ivory): Houses the start pathway, welcoming copy, and interactive CTA cards.
 * Purged of emojis, utilizing custom HSL terracotta tokens, serif typography, and SVGs (UN SDG 3).
 */

"use client";

interface Props {
  onSelectMode: (mode: "chat" | "bodymap") => void;
  onCrisisClick: () => void;
}

export default function WelcomeScreen({ onSelectMode, onCrisisClick }: Props) {
  return (
    <div className="w-full max-w-6xl mx-auto rounded-3xl overflow-hidden bg-[#faf8f5] shadow-xl border border-slate-100/70 grid grid-cols-1 lg:grid-cols-12 min-h-[640px] animate-scale-up">
      {/* 1. Left Side: Brand Testimonial & Core Pillars (Deep Bronze-Terracotta) */}
      <div className="lg:col-span-5 bg-[#1a110e] text-white p-8 md:p-12 flex flex-col justify-between space-y-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#c8562e] text-xs font-black tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c8562e] animate-pulse" />
            Pocket Health Worker
          </div>
        </div>

        <div className="space-y-6">
          <span className="text-4xl md:text-5xl font-serif text-[#f2e8df]/20 block leading-none font-bold">
            “
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-[#f5eae2] leading-snug tracking-tight">
            A caring first check for when you can’t reach a doctor.
          </h2>
          <p className="text-xs md:text-sm text-[#c4b5a9] leading-relaxed font-medium">
            Built for everyday people in Nigeria — the friend who listens, asks gentle questions, and tells you plainly whether to rest at home, see a clinic, or get help now.
          </p>
        </div>

        {/* Brand Statistics Footer */}
        <div className="grid grid-cols-3 gap-4 border-t border-[#f2e8df]/10 pt-8">
          <div>
            <p className="text-xl font-bold font-serif text-[#e49b80] leading-none">3</p>
            <p className="text-[9px] font-black tracking-wider text-[#9d8d80] uppercase mt-1">Urgency Levels</p>
          </div>
          <div>
            <p className="text-xl font-bold font-serif text-[#e49b80] leading-none">100%</p>
            <p className="text-[9px] font-black tracking-wider text-[#9d8d80] uppercase mt-1">Private & Safe</p>
          </div>
          <div>
            <p className="text-xl font-bold font-serif text-[#e49b80] leading-none">SDG 3</p>
            <p className="text-[9px] font-black tracking-wider text-[#9d8d80] uppercase mt-1">Health for All</p>
          </div>
        </div>
      </div>

      {/* 2. Right Side: Start Console & Action Cards (Soft Warm Ivory) */}
      <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between space-y-10">
        {/* Welcome Taglines */}
        <div className="space-y-4">
          <p className="text-[10px] font-black tracking-widest text-[#ac4c28] uppercase leading-none">
            Start Here
          </p>
          <h3 className="text-3xl md:text-4xl font-serif font-semibold text-slate-800 tracking-tight leading-tight">
            A calm hand for when you <br />can’t reach a doctor.
          </h3>
          <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed max-w-xl">
            I’ll listen like a caring neighbor, ask a few gentle questions, and help you understand how urgent it is — and what to do next.
          </p>
        </div>

        {/* Feature List (Custom SVGs) */}
        <div className="space-y-3.5">
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-[#fbf3ed] border border-[#f5e3d7] flex items-center justify-center text-[#ac4c28] flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </span>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Warm, plain-language guidance for all patient symptoms.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-[#fbf3ed] border border-[#f5e3d7] flex items-center justify-center text-[#ac4c28] flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </span>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Clear urgency classification: home care, clinic referrals, or emergency care.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-[#fbf3ed] border border-[#f5e3d7] flex items-center justify-center text-[#ac4c28] flex-shrink-0 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ac4c28]" />
            </span>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Stateless & 100% Private. No tracking or cookies, nothing is stored.
            </p>
          </div>
        </div>

        {/* Choose How To Start Actions */}
        <div className="space-y-4">
          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase leading-none">
            Choose how to start
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CTA Option A: Chat */}
            <button
              onClick={() => onSelectMode("chat")}
              className="group text-left p-5 rounded-2xl bg-[#ac4c28] hover:bg-[#913d1e] text-white border border-[#ac4c28] shadow-md shadow-[#ac4c28]/10 hover:shadow-lg transition-all duration-300 active:scale-[0.985] cursor-pointer flex flex-col justify-between h-36"
            >
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/90">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4.5 h-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.12 2.99 2.68 3.22 1.79.27 3.59.4 5.4.38 1.8.02 3.6-.1 5.4-.38 1.56-.23 2.68-1.62 2.68-3.22V9.15c0-1.6-1.12-2.99-2.68-3.22A48.394 48.394 0 0 0 12 5.56c-1.8.02-3.6.1-5.4.38-1.56.23-2.68 1.62-2.68 3.22v5.44Z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1 font-bold text-sm">
                  Describe it in your own words
                  <span className="transform transition-transform duration-300 group-hover:translate-x-1">→</span>
                </div>
                <p className="text-[10px] text-[#f2dfd5] leading-relaxed mt-1 font-medium">
                  A gentle conversation, step by step.
                </p>
              </div>
            </button>

            {/* CTA Option B: Body Map */}
            <button
              onClick={() => onSelectMode("bodymap")}
              className="group text-left p-5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.985] cursor-pointer flex flex-col justify-between h-36"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#ac4c28]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4.5 h-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1 1 0 0 1 .848-.93l9.185-1.312a1 1 0 0 1 1.117 1.007v7.928a2 2 0 0 1-1.666 1.97l-9.186 1.313a1 1 0 0 1-1.118-1.007V4.575Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5h15" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1 font-bold text-sm text-slate-800">
                  Tap where it hurts
                  <span className="transform transition-transform duration-300 group-hover:translate-x-1 text-[#ac4c28]">→</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-1 font-medium">
                  Pick from a visual body map.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Crisis helical link & legal disclaimers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100 pt-5 text-[10px] font-semibold text-slate-400 gap-3">
          <p className="leading-none">
            Struggling emotionally?{" "}
            <button
              onClick={onCrisisClick}
              className="text-[#ac4c28] hover:underline font-bold bg-transparent border-none cursor-pointer"
            >
              Find support
            </button>
          </p>
          <p className="uppercase tracking-widest text-[9px] leading-none font-bold">
            Not a diagnosis · Guidance only
          </p>
        </div>
      </div>
    </div>
  );
}
