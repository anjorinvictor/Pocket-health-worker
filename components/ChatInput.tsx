/**
 * Pocket Health Worker — Chat Input Area
 *
 * Implements the text entry interface for describing symptoms. Integrates a capped 
 * character limit (600 characters) to keep prompt lengths optimal, supports multiline text wrapping, 
 * blocks input during AI loading, and executes sending operations on simple keypress events (SDG 3 UI).
 */

"use client";

import { useState, KeyboardEvent } from "react";

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
}

const MAX_LENGTH = 600;

export default function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");

  const send = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="px-4 pb-5 pt-2 bg-slate-50 border-t border-slate-100">
      <div className="flex items-end gap-2 bg-white rounded-2xl border border-slate-200 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/10 shadow-sm px-3 py-2.5 transition-all duration-200">
        <textarea
          className="flex-1 resize-none text-sm text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent max-h-32 leading-relaxed"
          rows={1}
          placeholder="Describe how you're feeling…"
          value={value}
          maxLength={MAX_LENGTH}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          style={{ minHeight: "2rem" }}
        />
        
        <button
          onClick={send}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="flex-shrink-0 w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.288Z" />
          </svg>
        </button>
      </div>
      
      <p className="text-[10px] font-semibold text-slate-400 mt-1.5 text-right pr-1">
        {value.length} / {MAX_LENGTH}
      </p>
    </div>
  );
}
