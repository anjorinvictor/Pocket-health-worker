/**
 * Pocket Health Worker — Message Bubble Component
 *
 * Renders individual dialogue turns within the chat window.
 * Distinguishes user messages (styled in premium clinical teal) from assistant 
 * responses (styled in frosted milk-white), with smooth margins and micro-shadows (SDG 3 UI).
 */

"use client";

import type { ChatTurn } from "@/types";

interface Props {
  turn: ChatTurn;
}

export default function MessageBubble({ turn }: Props) {
  const isUser = turn.role === "user";
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all duration-300 ${
          isUser
            ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-br-none shadow-emerald-600/5"
            : "bg-white text-slate-700 border border-slate-100/80 rounded-bl-none shadow-slate-100/50"
        }`}
      >
        {turn.content}
      </div>
    </div>
  );
}
