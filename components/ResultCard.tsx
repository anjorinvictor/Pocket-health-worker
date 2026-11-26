/**
 * Pocket Health Worker — AI result
 *
 * Urgency first (words + icon + colour), then what we found, why, what to do in Nigeria,
 * general possibilities (informational only) and the disclaimer. RED results lead with the
 * shared emergency actions.
 */

"use client";

import type { ChatTurn, TriageResult } from "@/types";
import UrgencyBadge from "./UrgencyBadge";
import EmergencyBanner from "./EmergencyBanner";
import EmergencyActions from "./EmergencyActions";
import ShareCheck from "./ShareCheck";
import ConnectHealthWorker from "./ConnectHealthWorker";
import { ChatIcon } from "./Icons";

interface Props {
  result: TriageResult;
  history: ChatTurn[];
  onReset: () => void;
  onContinue?: () => void;
  selectedState: string | null;
  onStateChange: (state: string) => void;
}

const HEADLINE = {
  GREEN: "You can likely look after this at home",
  YELLOW: "See a health worker within 1–2 days",
  RED: "",
} as const;

export default function ResultCard({ result, history, onReset, onContinue, selectedState, onStateChange }: Props) {
  const isRed = result.urgencyLevel === "RED";

  return (
    <div className="space-y-5 animate-fade-in">
      {isRed && (
        <>
          <EmergencyBanner />
          <EmergencyActions selectedState={selectedState} onStateChange={onStateChange} />
        </>
      )}

      <article className="card p-5 sm:p-6 space-y-6" aria-labelledby="result-title">
        <div className="space-y-3">
          <UrgencyBadge level={result.urgencyLevel} />
          {isRed ? (
            <h2 id="result-title" className="text-2xl font-bold">What might be wrong</h2>
          ) : (
            <h1 id="result-title" className="text-3xl font-bold">{HEADLINE[result.urgencyLevel]}</h1>
          )}
        </div>

        <section className="space-y-2">
          {!isRed && <h2 className="text-lg font-bold">What might be wrong</h2>}
          {result.likelyCondition && (
            <p className="rounded-xl bg-rust-soft px-4 py-3 text-lg">
              <span className="font-semibold">Most likely: </span>
              <span className="font-serif font-bold">{result.likelyCondition}</span>
            </p>
          )}
          <p className="text-lg">{result.assessment}</p>
        </section>

        {result.generalCauses && result.generalCauses.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-lg font-bold">
              It could also be <span className="font-sans text-base font-normal text-muted">(informational only)</span>
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              {result.generalCauses.map((cause, i) => (
                <li key={i}>{cause}</li>
              ))}
            </ul>
            <p className="text-sm text-muted">Not a diagnosis. Only a health worker who examines you can confirm what it is.</p>
          </section>
        )}

        <section className="space-y-1.5">
          <h2 className="text-lg font-bold">Why we think so</h2>
          <p>{result.reasoning}</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-lg font-bold">What to do (Nigeria)</h2>
          <div className="whitespace-pre-line rounded-xl bg-sand p-4">{result.recommendedAction}</div>
        </section>

        <p className="border-t border-line pt-4 text-sm text-muted">{result.disclaimer}</p>
      </article>

      <div className="grid grid-cols-1 gap-3">
        {onContinue && (
          <button type="button" onClick={onContinue} className={`btn w-full ${isRed ? "btn-secondary" : "btn-primary"}`}>
            <ChatIcon className="w-5 h-5" /> Continue the conversation
          </button>
        )}
        {result.urgencyLevel !== "GREEN" && <ConnectHealthWorker />}
        <ShareCheck result={result} history={history} />
        <button type="button" onClick={onReset} className="btn btn-secondary w-full">
          Start a new check
        </button>
      </div>
    </div>
  );
}
