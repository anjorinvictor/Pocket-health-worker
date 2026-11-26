/**
 * Pocket Health Worker — Welcome screen
 *
 * Phone first: headline and the two ways to start are the first thing on a 360px screen;
 * the three urgency levels and the privacy promise follow. On wide screens they sit side
 * by side.
 */

"use client";

import UrgencyBadge from "./UrgencyBadge";
import { ArrowRightIcon, BodyIcon, ChatIcon, PhoneIcon } from "./Icons";

interface Props {
  onSelectMode: (mode: "chat" | "bodymap") => void;
  onCrisisClick: () => void;
}

export default function WelcomeScreen({ onSelectMode, onCrisisClick }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start animate-fade-in">
      {/* Start */}
      <section className="lg:col-span-7 space-y-6 lg:pt-6" aria-labelledby="welcome-title">
        <p className="eyebrow">Free · Private · Works offline</p>
        <h1 id="welcome-title" className="text-4xl sm:text-5xl font-bold text-ink">
          A calm hand for when you can&rsquo;t reach a doctor.
        </h1>
        <p className="text-lg text-muted max-w-xl">
          Tell us what is wrong, in your own words or by tapping where it hurts. In about a minute you will
          know the next step: care at home, visit a clinic, or go to hospital now.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onSelectMode("chat")}
            className="btn btn-primary justify-between text-left min-h-20 px-5 py-4"
          >
            <span className="flex items-center gap-3">
              <ChatIcon />
              <span>
                <span className="block text-lg">Describe it in your own words</span>
                <span className="block text-sm font-normal opacity-90">A short, gentle conversation</span>
              </span>
            </span>
            <ArrowRightIcon />
          </button>
          <button
            type="button"
            onClick={() => onSelectMode("bodymap")}
            className="btn btn-secondary justify-between text-left min-h-20 px-5 py-4"
          >
            <span className="flex items-center gap-3">
              <BodyIcon className="w-6 h-6 text-rust" />
              <span>
                <span className="block text-lg">Tap where it hurts</span>
                <span className="block text-sm font-normal text-muted">Works without internet</span>
              </span>
            </span>
            <ArrowRightIcon className="w-5 h-5 text-rust" />
          </button>
        </div>

        <a href="tel:112" className="btn btn-quiet px-0">
          <PhoneIcon /> In an emergency, call 112 now
        </a>
      </section>

      {/* What you get + promise */}
      <aside className="on-dark lg:col-span-5 rounded-3xl bg-espresso text-cream p-6 sm:p-8 space-y-7">
        <section aria-labelledby="levels-title" className="space-y-4">
          <h2 id="levels-title" className="text-2xl font-bold">One clear next step</h2>
          <ul className="space-y-4">
            <li className="space-y-1.5">
              <UrgencyBadge level="GREEN" />
              <p className="text-on-dark-muted">Look after it at home, and what to watch for.</p>
            </li>
            <li className="space-y-1.5">
              <UrgencyBadge level="YELLOW" />
              <p className="text-on-dark-muted">See a health worker at a PHC or clinic within 1–2 days.</p>
            </li>
            <li className="space-y-1.5">
              <UrgencyBadge level="RED" />
              <p className="text-on-dark-muted">Go to hospital now, with 112 one tap away.</p>
            </li>
          </ul>
        </section>

        <section aria-labelledby="promise-title" className="space-y-2 border-t border-espresso-soft pt-6">
          <h2 id="promise-title" className="text-xl font-bold text-ember">Our privacy promise</h2>
          <p className="text-on-dark-muted">
            No account, no tracking, no cookies. Nothing you enter is saved. When you are online, your answers
            are sent to an AI service to write your guidance, and are not stored by us.
          </p>
        </section>

        <p className="text-on-dark-muted">
          Struggling emotionally?{" "}
          <button type="button" onClick={onCrisisClick} className="btn btn-quiet text-ember min-h-12 px-1">
            Find support
          </button>
        </p>

        <p className="text-sm text-on-dark-muted">Guidance, not diagnosis. Never a replacement for a health worker.</p>
      </aside>
    </div>
  );
}
