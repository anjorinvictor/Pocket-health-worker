/**
 * Pocket Health Worker — Chat Window Viewport
 *
 * Implements the scrollable chat turn container. Manages scroll-to-bottom synchronization 
 * to ensure newly received questions or responses are immediately brought into visual focus.
 * Serves as the central dialogue thread during intermediate symptoms collection (SDG 3 access core).
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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {history.length === 0 && (
        <div className="flex justify-start animate-fade-in">
          <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white border border-slate-100/80 px-4 py-3.5 text-sm text-slate-700 shadow-sm leading-relaxed">
            🌿 Hello! I'm your Pocket Health Worker. Please describe what symptoms you are 
            experiencing, and I'll help you assess how urgent they are and guide you to the correct local facility.
          </div>
        </div>
      )}
      
      {history.map((turn, i) => (
        <MessageBubble key={i} turn={turn} />
      ))}
      
      {loading && (
        <div className="flex justify-start animate-pulse">
          <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3.5 shadow-sm">
            <span className="flex gap-1.5 items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:300ms]" />
            </span>
          </div>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
}
