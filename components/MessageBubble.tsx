/**
 * Pocket Health Worker — Message bubble
 * The person's messages on rust, the assistant's on sand. Text stays at body size.
 */

"use client";

import type { ChatTurn } from "@/types";
import { useI18n } from "@/lib/i18n";

export default function MessageBubble({ turn }: { turn: ChatTurn }) {
  const { t } = useI18n();
  const isUser = turn.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] sm:max-w-[75%] rounded-2xl px-4 py-3 whitespace-pre-line break-words ${
          isUser ? "bg-rust text-white rounded-br-sm" : "bg-sand text-ink rounded-bl-sm"
        }`}
      >
        <span className="sr-only">{isUser ? t("youSaid") : t("phwSaid")}</span>
        {turn.content}
      </div>
    </div>
  );
}
