/**
 * Pocket Health Worker — Share this check
 *
 * Builds a plain-text summary on the phone and opens the share sheet (WhatsApp, SMS…),
 * or copies it when sharing isn't available. Nothing is uploaded or stored.
 */

"use client";

import { useCallback, useState } from "react";
import type { ChatTurn, TriageResult } from "@/types";
import { URGENCY_LABEL } from "./UrgencyBadge";
import { useI18n } from "@/lib/i18n";

interface Props {
  result: TriageResult;
  history: ChatTurn[];
}

export default function ShareCheck({ result, history }: Props) {
  const { t } = useI18n();
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  const getShareText = useCallback(() => {
    const firstComplaint = history.find((t) => t.role === "user")?.content ?? "Not provided";
    return `POCKET HEALTH WORKER CHECK
Next step: ${URGENCY_LABEL[result.urgencyLevel].toUpperCase()}

What was reported:
${firstComplaint}

${result.likelyCondition ? `Most likely: ${result.likelyCondition} (not a diagnosis)
` : ""}What might be wrong:
${result.assessment}

Why:
${result.reasoning}

What to do:
${result.recommendedAction}

${result.disclaimer}
(Made privately on Pocket Health Worker. Nothing was saved.)`;
  }, [result, history]);

  const handleShare = async () => {
    const shareData = { title: "Pocket Health Worker check", text: getShareText() };
    if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // The person closed the share sheet: nothing to report.
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(shareData.text);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("failed");
    }
  };

  return (
    <div>
      <button type="button" onClick={handleShare} className="btn btn-secondary w-full">
        {status === "copied" ? t("shareCopied") : t("shareCheck")}
      </button>
      {status === "failed" && (
        <p role="status" className="text-sm text-muted mt-2">
          {t("shareFailed")}
        </p>
      )}
    </div>
  );
}
