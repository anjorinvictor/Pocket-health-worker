/**
 * Pocket Health Worker — Chat window
 *
 * Scrollable conversation. New messages are announced politely to screen readers
 * and scrolled into view.
 */

"use client";

import { useEffect, useRef } from "react";
import type { ChatTurn } from "@/types";
import MessageBubble from "./MessageBubble";
import { useI18n } from "@/lib/i18n";

interface Props {
  history: ChatTurn[];
  loading: boolean;
}

export default function ChatWindow({ history, loading }: Props) {
  const { t } = useI18n();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [history, loading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{t("chatTitle")}</h1>
        <p className="text-muted">{t("chatIntro")}</p>
      </div>

      <div role="log" aria-live="polite" aria-label={t("chatLog")} className="space-y-4">
        {history.map((turn, i) => (
          <MessageBubble key={i} turn={turn} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <p className="rounded-2xl rounded-bl-sm bg-sand px-4 py-3 text-muted">
              {t("chatChecking")}<span aria-hidden>…</span>
            </p>
          </div>
        )}
      </div>

      <div ref={bottomRef} />
    </div>
  );
}
