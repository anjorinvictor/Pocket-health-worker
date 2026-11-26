/**
 * Pocket Health Worker — Chat input
 * Labelled multi-line box (600 characters), Enter sends, Shift+Enter adds a line.
 */

"use client";

import { useState, type KeyboardEvent } from "react";
import { SendIcon } from "./Icons";

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
    <form
      className="border-t border-line bg-cream px-3 py-3"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <label htmlFor="chat-input" className="sr-only">Describe how you feel</label>
      <div className="flex items-end gap-2">
        <textarea
          id="chat-input"
          className="field flex-1 resize-none max-h-40"
          rows={2}
          placeholder="For example: my baby has had a high fever since last night"
          value={value}
          maxLength={MAX_LENGTH}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          aria-describedby="chat-count"
        />
        <button type="submit" disabled={disabled || !value.trim()} className="btn btn-primary px-4" aria-label="Send">
          <SendIcon />
        </button>
      </div>
      <p id="chat-count" className="text-sm text-muted mt-1 text-right">
        {value.length} / {MAX_LENGTH}
      </p>
    </form>
  );
}
