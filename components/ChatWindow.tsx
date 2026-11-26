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

interface Props {
  history: ChatTurn[];
  loading: boolean;
}

export default function ChatWindow({ history, loading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [history, loading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Tell me what&rsquo;s wrong</h1>
        <p className="text-muted">
          Describe how you or the person you care for feels, in your own words. I&rsquo;ll ask a few short
          questions, then tell you how urgent it is and where to go.
        </p>
      </div>

      <div role="log" aria-live="polite" aria-label="Conversation" className="space-y-4">
        {history.map((turn, i) => (
          <MessageBubble key={i} turn={turn} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <p className="rounded-2xl rounded-bl-sm bg-sand px-4 py-3 text-muted">
              Checking your answers<span aria-hidden>…</span>
            </p>
          </div>
        )}
      </div>

      <div ref={bottomRef} />
    </div>
  );
}
