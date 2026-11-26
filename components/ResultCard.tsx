/**
 * Pocket Health Worker — AI result
 *
 * Urgency first (words + icon + colour), then what we found, why, what to do in Nigeria,
 * general possibilities (informational only) and the disclaimer. RED results lead with the
 * shared emergency actions.
 */

"use client";

import type { ChatTurn, HandoverInfo, TriageResult } from "@/types";
import { useI18n } from "@/lib/i18n";
import UrgencyBadge from "./UrgencyBadge";
import EmergencyBanner from "./EmergencyBanner";
import EmergencyActions from "./EmergencyActions";
import ShareCheck from "./ShareCheck";
import ConnectHealthWorker from "./ConnectHealthWorker";
import NurseCard from "./NurseCard";
import { ChatIcon } from "./Icons";

interface Props {
  result: TriageResult;
  history: ChatTurn[];
  handover: HandoverInfo;
  onReset: () => void;
  onContinue?: () => void;
  selectedState: string | null;
  onStateChange: (state: string) => void;
}

export default function ResultCard({ result, history, handover, onReset, onContinue, selectedState, onStateChange }: Props) {
  const { t, tx } = useI18n();
  const isRed = result.urgencyLevel === "RED";
  const headline = result.urgencyLevel === "GREEN" ? t("headlineGREEN") : t("headlineYELLOW");

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
            <h2 id="result-title" className="text-2xl font-bold">{t("whatMightBeWrong")}</h2>
          ) : (
            <h1 id="result-title" className="text-3xl font-bold">{headline}</h1>
          )}
        </div>

        <section className="space-y-2">
          {!isRed && <h2 className="text-lg font-bold">{t("whatMightBeWrong")}</h2>}
          {result.likelyCondition && (
            <p className="rounded-xl bg-rust-soft px-4 py-3 text-lg">
              <span className="font-semibold">{t("mostLikely")}</span>
              <span className="font-serif font-bold">{result.likelyCondition}</span>
            </p>
          )}
          <p className="text-lg">{tx(result.assessment)}</p>
        </section>

        {result.generalCauses && result.generalCauses.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-lg font-bold">
              {t("itCouldAlsoBe")} <span className="font-sans text-base font-normal text-muted">{t("infoOnly")}</span>
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              {result.generalCauses.map((cause, i) => (
                <li key={i}>{cause}</li>
              ))}
            </ul>
            <p className="text-sm text-muted">{t("notDxExam")}</p>
          </section>
        )}

        <section className="space-y-1.5">
          <h2 className="text-lg font-bold">{t("whyWeThink")}</h2>
          <p>{tx(result.reasoning)}</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-lg font-bold">{t("whatToDoNigeria")}</h2>
          <div className="whitespace-pre-line rounded-xl bg-sand p-4">{tx(result.recommendedAction)}</div>
        </section>

        <p className="border-t border-line pt-4 text-sm text-muted">{tx(result.disclaimer)}</p>
      </article>

      <div className="grid grid-cols-1 gap-3">
        {onContinue && (
          <button type="button" onClick={onContinue} className={`btn w-full ${isRed ? "btn-secondary" : "btn-primary"}`}>
            <ChatIcon className="w-5 h-5" /> {t("continueChat")}
          </button>
        )}
        {result.urgencyLevel !== "GREEN" && <ConnectHealthWorker />}
        <NurseCard info={handover} urgency={result.urgencyLevel} likelyCondition={result.likelyCondition} />
        <ShareCheck result={result} history={history} />
        <button type="button" onClick={onReset} className="btn btn-secondary w-full">
          {t("startNewCheck")}
        </button>
      </div>
    </div>
  );
}
