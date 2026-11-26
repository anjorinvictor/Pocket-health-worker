/**
 * Pocket Health Worker — Rules result (no AI)
 *
 * Shown when the phone's deterministic rules gave the answer: no signal, Data Saver,
 * or the AI could not be reached. Says plainly which, so the person knows what it is.
 * RED never normally reaches this card (it goes to the emergency screen), but if it does,
 * the emergency call is still first.
 */

"use client";

import type { RulesResult } from "@/types";
import UrgencyBadge from "./UrgencyBadge";
import EmergencyBanner from "./EmergencyBanner";
import ConnectHealthWorker from "./ConnectHealthWorker";
import { PhoneIcon } from "./Icons";

export type RulesReason = "offline" | "dataSaver" | "unavailable";

const REASON: Record<RulesReason, { title: string; body: string }> = {
  offline: {
    title: "Checked on your phone, with no internet",
    body: "This answer comes from fixed safety rules that work offline. When you have signal, you can also describe it in your own words for a fuller check.",
  },
  dataSaver: {
    title: "Checked on your phone (Data Saver)",
    body: "Data Saver is on, so fixed safety rules on your phone gave this answer without using data.",
  },
  unavailable: {
    title: "Checked on your phone",
    body: "The full assistant could not be reached just now, so fixed safety rules on your phone gave this answer.",
  },
};

interface Props {
  result: RulesResult;
  reason: RulesReason;
  onReset: () => void;
}

export default function OfflineResultCard({ result, reason, onReset }: Props) {
  const isRed = result.urgencyLevel === "RED";
  const why = REASON[reason];

  return (
    <div className="space-y-5 animate-fade-in">
      {isRed && (
        <>
          <EmergencyBanner />
          <a href="tel:112" className="btn btn-danger w-full text-lg min-h-14">
            <PhoneIcon className="w-6 h-6" /> Call 112
          </a>
        </>
      )}

      <div role="note" className="rounded-2xl bg-clinic-soft text-clinic p-4">
        <p className="font-bold">{why.title}</p>
        <p className="mt-1">{why.body}</p>
      </div>

      <article className="card p-5 sm:p-6 space-y-6" aria-labelledby="rules-title">
        <div className="space-y-3">
          <UrgencyBadge level={result.urgencyLevel} />
          {isRed ? (
            <h2 id="rules-title" className="text-2xl font-bold">{result.headline}</h2>
          ) : (
            <h1 id="rules-title" className="text-3xl font-bold">{result.headline}</h1>
          )}
        </div>

        <section className="space-y-1.5">
          <h2 className="text-lg font-bold">What to do</h2>
          <p className="text-lg">{result.details}</p>
        </section>

        {result.warningSignsToWatch.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-lg font-bold">Get help sooner if</h2>
            <ul className="list-disc pl-5 space-y-1">
              {result.warningSignsToWatch.map((sign) => (
                <li key={sign}>{sign}</li>
              ))}
            </ul>
          </section>
        )}

        <p className="border-t border-line pt-4 text-sm text-muted">
          This check uses general safety rules and only what you told us. It is not a diagnosis and does not replace a
          health worker. If you are worried, get care.
        </p>
      </article>

      <div className="grid grid-cols-1 gap-3">
        {result.urgencyLevel !== "GREEN" && <ConnectHealthWorker />}
        <button type="button" onClick={onReset} className="btn btn-primary w-full">
          Start a new check
        </button>
      </div>
    </div>
  );
}
