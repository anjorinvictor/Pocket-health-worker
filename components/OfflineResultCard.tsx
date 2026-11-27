/**
 * Pocket Health Worker — Rules result (no AI)
 *
 * Shown when the phone's deterministic rules gave the answer: no signal, Data Saver,
 * or the AI could not be reached. Says plainly which, so the person knows what it is.
 * RED never normally reaches this card (it goes to the emergency screen), but if it does,
 * the emergency call is still first.
 */

"use client";

import type { HandoverInfo, RulesResult } from "@/types";
import type { StringKey } from "@/lib/i18n/strings";
import { useI18n } from "@/lib/i18n";
import UrgencyBadge from "./UrgencyBadge";
import EmergencyBanner from "./EmergencyBanner";
import ConnectHealthWorker from "./ConnectHealthWorker";
import NurseCard from "./NurseCard";
import { PhoneIcon } from "./Icons";
import { NATIONAL_EMERGENCY } from "@/data/emergency-lines";

export type RulesReason = "offline" | "dataSaver" | "unavailable";

const REASON: Record<RulesReason, { title: StringKey; body: StringKey }> = {
  offline: { title: "reasonOfflineTitle", body: "reasonOfflineBody" },
  dataSaver: { title: "reasonDataSaverTitle", body: "reasonDataSaverBody" },
  unavailable: { title: "reasonUnavailableTitle", body: "reasonUnavailableBody" },
};

interface Props {
  result: RulesResult;
  reason: RulesReason;
  handover: HandoverInfo;
  onReset: () => void;
}

export default function OfflineResultCard({ result, reason, handover, onReset }: Props) {
  const { t, tx } = useI18n();
  const isRed = result.urgencyLevel === "RED";
  const why = REASON[reason];

  return (
    <div className="space-y-5 stagger">
      {isRed && (
        <>
          <EmergencyBanner />
          <a href={`tel:${NATIONAL_EMERGENCY.tel}`} className="btn btn-danger w-full text-lg min-h-14">
            <PhoneIcon className="w-6 h-6" /> {t("callN", { n: NATIONAL_EMERGENCY.display })}
          </a>
        </>
      )}

      <div role="note" className="rounded-2xl bg-clinic-soft text-clinic p-4">
        <p className="font-bold">{t(why.title)}</p>
        <p className="mt-1">{t(why.body)}</p>
      </div>

      <article className="card p-5 sm:p-6 space-y-6" aria-labelledby="rules-title">
        <div className="space-y-3">
          <UrgencyBadge level={result.urgencyLevel} />
          {isRed ? (
            <h2 id="rules-title" className="text-2xl font-bold">{tx(result.headline)}</h2>
          ) : (
            <h1 id="rules-title" className="text-3xl font-bold">{tx(result.headline)}</h1>
          )}
        </div>

        <section className="space-y-1.5">
          <h2 className="text-lg font-bold">{t("whatToDo")}</h2>
          <p className="text-lg">{tx(result.details)}</p>
        </section>

        {result.warningSignsToWatch.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-lg font-bold">{t("getHelpSoonerIf")}</h2>
            <ul className="list-disc pl-5 space-y-1">
              {result.warningSignsToWatch.map((sign) => (
                <li key={sign}>{tx(sign)}</li>
              ))}
            </ul>
          </section>
        )}

        <p className="border-t border-line pt-4 text-sm text-muted">{t("rulesDisclaimer")}</p>
      </article>

      <div className="grid grid-cols-1 gap-3">
        {result.urgencyLevel !== "GREEN" && <ConnectHealthWorker />}
        <NurseCard info={handover} urgency={result.urgencyLevel} />
        {/* The only next step on this screen, so it is the screen's one primary action. */}
        <button type="button" onClick={onReset} className="btn btn-primary w-full">
          {t("startNewCheck")}
        </button>
      </div>
    </div>
  );
}
