/**
 * Pocket Health Worker — Crisis support
 *
 * Shown before any AI call when self-harm language is detected, or from "Find support".
 * Calm, non-judgemental, one tap to a person. Numbers come from data/emergency-lines.ts
 * (each cited there).
 */

"use client";

import { MENTAL_HEALTH_LINES, NATIONAL_EMERGENCY } from "@/data/emergency-lines";
import { PhoneIcon } from "./Icons";
import { useI18n } from "@/lib/i18n";

export default function CrisisSupport({ onReset }: { onReset: () => void }) {
  const { t } = useI18n();
  const [first, ...rest] = MENTAL_HEALTH_LINES;

  return (
    <div className="mx-auto max-w-xl space-y-5 stagger">
      <section className="card p-6 sm:p-8 space-y-4" aria-labelledby="crisis-title">
        <h1 id="crisis-title" className="text-3xl font-bold">{t("crisisTitle")}</h1>
        <p className="text-lg">{t("crisisBody1")}</p>
        <p>{t("crisisBody2")}</p>
      </section>

      <section className="card p-6 space-y-4" aria-labelledby="lines-title">
        <h2 id="lines-title" className="text-xl font-bold">{t("talkToSomeone")}</h2>

        <div className="space-y-2">
          <p className="font-semibold">{first.org}</p>
          {first.lines.map((l, i) => (
            <a key={l.tel} href={`tel:${l.tel}`} className={`btn w-full ${i === 0 ? "btn-primary" : "btn-secondary"}`}>
              <PhoneIcon /> {t("callN", { n: l.display })}
            </a>
          ))}
        </div>

        {rest.map((group) => (
          <div key={group.org} className="space-y-2 border-t border-line pt-4">
            <p className="font-semibold">{group.org}</p>
            {group.lines.map((l) => (
              <a key={l.tel} href={`tel:${l.tel}`} className="btn btn-secondary w-full">
                <PhoneIcon /> {t("callN", { n: l.display })}
              </a>
            ))}
          </div>
        ))}
      </section>

      <section className="rounded-2xl bg-danger-soft text-danger-dark p-5 space-y-3" aria-labelledby="danger-title">
        <h2 id="danger-title" className="text-lg font-bold">{t("inDanger")}</h2>
        <a href={`tel:${NATIONAL_EMERGENCY.tel}`} className="btn btn-danger w-full">
          <PhoneIcon /> {t("callN", { n: NATIONAL_EMERGENCY.display })}
        </a>
        <p className="text-sm">{t("crisisFoot")}</p>
      </section>

      <button type="button" onClick={onReset} className="btn btn-secondary w-full">
        {t("backToStart")}
      </button>
    </div>
  );
}
