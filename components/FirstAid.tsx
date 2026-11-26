/**
 * Pocket Health Worker — "What to do on the way"
 *
 * Simple first-aid steps for the danger sign that fired, under the call buttons on every
 * emergency screen. Plain data from data/first-aid.ts, so it works offline. No medicines,
 * no doses.
 */

"use client";

import { FIRST_AID, firstAidFor } from "@/data/first-aid";
import { useI18n } from "@/lib/i18n";

export default function FirstAid({ sign }: { sign?: string }) {
  const { t, lang } = useI18n();
  const steps = FIRST_AID[firstAidFor(sign)][lang];

  return (
    <section aria-labelledby="first-aid-title" className="card p-5 space-y-3">
      <h2 id="first-aid-title" className="text-xl font-bold">{t("firstAidTitle")}</h2>
      <ol className="space-y-2.5">
        {steps.map((step, i) => (
          <li key={step} className="flex gap-3">
            <span
              aria-hidden
              className="shrink-0 w-7 h-7 rounded-full bg-rust-soft text-rust-dark font-bold flex items-center justify-center text-sm"
            >
              {i + 1}
            </span>
            <span className="text-lg leading-snug">{step}</span>
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted">{t("firstAidNote")}</p>
    </section>
  );
}
