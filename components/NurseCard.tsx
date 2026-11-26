/**
 * Pocket Health Worker — "Show this to the nurse"
 *
 * A full-screen, large-print summary of what the person entered, for the health worker at
 * the clinic or hospital, so a scared parent does not have to remember everything.
 * Always in English (the language of Nigerian clinical staff); the instruction to the
 * person follows the chosen language. Built from memory on the phone: nothing is sent or
 * stored. Dialog: focus moves in on open, Esc closes, focus returns to the button.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import type { HandoverInfo, UrgencyLevel } from "@/types";
import { REGION_LABELS } from "@/lib/triage/options";
import { useI18n } from "@/lib/i18n";
import { AlertIcon, ClinicIcon, HomeIcon } from "./Icons";

interface Props {
  info: HandoverInfo;
  urgency: UrgencyLevel;
  /** Danger sign the safety rules found (English). */
  finding?: string;
  /** The AI's "most likely" cause, if there was one. */
  likelyCondition?: string;
}

const RESULT: Record<UrgencyLevel, { text: string; classes: string; Icon: typeof HomeIcon }> = {
  RED: { text: "EMERGENCY — told to go to hospital now", classes: "bg-danger text-white", Icon: AlertIcon },
  YELLOW: { text: "Told to see a health worker within 1–2 days", classes: "bg-clinic-soft text-clinic", Icon: ClinicIcon },
  GREEN: { text: "Told to care at home and watch for warning signs", classes: "bg-home-soft text-home", Icon: HomeIcon },
};

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-line">
      <dt className="text-sm font-bold uppercase tracking-wider text-muted">{term}</dt>
      <dd className="text-xl leading-snug mt-0.5">{children}</dd>
    </div>
  );
}

export default function NurseCard({ info, urgency, finding, likelyCondition }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  // The time this result appeared, from the phone's clock.
  const [checkedAt] = useState(() => new Date());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const s = info.structured;
  const time = checkedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const date = checkedAt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const result = RESULT[urgency];

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)} className="btn btn-secondary w-full">
        {t("nurseButton")}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="nurse-title"
          className="fixed inset-0 z-50 overflow-y-auto bg-paper"
        >
          <div className="mx-auto max-w-2xl px-4 sm:px-6 py-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow">{t("nurseInstruction")}</p>
              <button ref={closeRef} type="button" onClick={close} className="btn btn-secondary shrink-0">
                {t("close")}
              </button>
            </div>

            <div lang="en" className="space-y-4">
              <div>
                <h2 id="nurse-title" className="text-3xl font-bold">Patient check</h2>
                <p className="text-lg text-muted">
                  {time} · {date} <span className="text-base">(time on this phone)</span>
                </p>
              </div>

              <p className={`rounded-2xl px-4 py-3 text-xl font-bold flex items-start gap-3 ${result.classes}`}>
                <result.Icon className="w-6 h-6 mt-0.5 shrink-0" />
                {result.text}
              </p>

              <dl>
                {finding && <Row term="Danger sign found">{finding}</Row>}
                {s && (
                  <>
                    <Row term="Age">{s.ageGroup}</Row>
                    <Row term="Sex / pregnancy">{s.biologicalSex}</Row>
                    <Row term="Where">{REGION_LABELS[s.region] ?? s.region}</Row>
                    <Row term="Symptoms">{s.symptoms.length > 0 ? s.symptoms.join(", ") : "General discomfort"}</Row>
                    <Row term="How strong">{s.severity}</Row>
                    <Row term="Since">{s.duration}</Row>
                    <Row term="Long-term conditions">
                      {s.comorbidities.length > 0 ? s.comorbidities.join(", ") : "None reported"}
                    </Row>
                    {s.additionalText && <Row term="In their own words">“{s.additionalText}”</Row>}
                  </>
                )}
                {info.messages.length > 0 && (
                  <Row term={s ? "Answers to follow-up questions" : "In their own words"}>
                    <ul className="space-y-1.5">
                      {info.messages.map((m, i) => (
                        <li key={i}>“{m}”</li>
                      ))}
                    </ul>
                  </Row>
                )}
                {likelyCondition && (
                  <Row term="App’s suggestion (not a diagnosis)">{likelyCondition}</Row>
                )}
              </dl>

              <p className="text-base text-muted">
                Reported by the patient or carer in the Pocket Health Worker app. Guidance only, not a diagnosis.
                Nothing was stored.
              </p>
            </div>

            <button type="button" onClick={close} className="btn btn-secondary w-full">
              {t("close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
