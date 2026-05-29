/**
 * Pocket Health Worker — Share Check Component
 *
 * Implements a high-end share drawer that extracts the stateless clinical summary 
 * of the current check on the fly. Allows users to either copy it to their clipboard
 * or share it natively via WhatsApp, SMS, or email to show to their Primary Health 
 * Centre (PHC) worker or family doctor (UN SDG 3 access helper).
 */

"use client";

import { useState, useCallback } from "react";
import type { TriageResult, ChatTurn } from "@/types";

interface Props {
  result: TriageResult;
  history: ChatTurn[];
}

export default function ShareCheck({ result, history }: Props) {
  const [copied, setCopied] = useState(false);

  const getShareText = useCallback(() => {
    const firstComplaint = history.find((t) => t.role === "user")?.content ?? "Not provided";
    const emojiMap = {
      GREEN: "🟢 GREEN (Self-care at home)",
      YELLOW: "🟡 YELLOW (See a clinic or doctor soon)",
      RED: "🔴 RED (Emergency – go to hospital now)",
    };

    return `🩺 POCKET HEALTH WORKER ASSESSMENT
----------------------------------
Urgency: ${emojiMap[result.urgencyLevel]}

Initial Symptoms Described:
"${firstComplaint}"

Triage Assessment:
${result.assessment}

Reasoning:
${result.reasoning}

Recommended Next Steps (Nigeria):
${result.recommendedAction.replace(/\n/g, "\n")}

Disclaimer:
${result.disclaimer}

*Generated privately and statelessly on Pocket Health Worker. No health data was saved.*`;
  }, [result, history]);

  const handleShare = async () => {
    const shareData = {
      title: "Pocket Health Worker Assessment",
      text: getShareText(),
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn("Share sheet cancelled or failed:", err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareData.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error("Failed to copy text:", err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`w-full py-2.5 rounded-xl border font-medium text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
        copied
          ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm"
          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.99]"
      }`}
    >
      {copied ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-emerald-600 animate-scale-up"
          >
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              clipRule="evenodd"
            />
          </svg>
          Assessment Copied!
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-slate-500"
          >
            <path
              fillRule="evenodd"
              d="M13.75 4h-3V2.75a.75.75 0 0 0-1.5 0V4h-3a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 6.25 19h7.5A2.25 2.25 0 0 0 16 16.75V6.25A2.25 2.25 0 0 0 13.75 4Zm-3 11.5a.75.75 0 0 1-.75.75H8a.75.75 0 0 1 0-1.5h2a.75.75 0 0 1 .75.75Zm0-3a.75.75 0 0 1-.75.75H8a.75.75 0 0 1 0-1.5h2a.75.75 0 0 1 .75.75Zm0-3a.75.75 0 0 1-.75.75h-2a.75.75 0 0 1 0-1.5h2a.75.75 0 0 1 .75.75Zm3-3a.75.75 0 0 1-.75.75h-5a.75.75 0 0 1 0-1.5h5a.75.75 0 0 1 .75.75Z"
              clipRule="evenodd"
            />
          </svg>
          Share this check
        </>
      )}
    </button>
  );
}
