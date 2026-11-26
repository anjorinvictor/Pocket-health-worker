/**
 * Pocket Health Worker — language (English / Nigerian Pidgin)
 *
 * The chosen language lives in memory only (nothing stored, privacy promise), so it
 * resets to English on reload, like Data Saver.
 *
 *  t(key, vars)  interface text from strings.ts
 *  label(value)  a body-map option shown in the chosen language (the value sent stays English)
 *  tx(text)      a fixed sentence from the rules / red flags, translated sentence by sentence;
 *                anything not in the table (e.g. AI text already in Pidgin) is shown as is.
 */

"use client";

import { createContext, useContext, useEffect } from "react";
import { en, pcm, type StringKey } from "./strings";
import { FIXED_SENTENCES, PCM_LABELS, splitSentences } from "./labels";

export type Lang = "en" | "pcm";

export interface I18n {
  lang: Lang;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
  label: (value: string) => string;
  tx: (text: string) => string;
}

export function makeI18n(lang: Lang): I18n {
  const table = lang === "pcm" ? pcm : en;
  return {
    lang,
    t: (key, vars) => {
      let s: string = table[key] ?? en[key];
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
      return s;
    },
    label: (value) => (lang === "pcm" ? PCM_LABELS[value] ?? value : value),
    tx: (text) => {
      if (lang !== "pcm" || !text) return text;
      if (FIXED_SENTENCES[text]) return FIXED_SENTENCES[text];
      return splitSentences(text)
        .map((s) => FIXED_SENTENCES[s] ?? s)
        .join(" ");
    },
  };
}

const I18nContext = createContext<I18n>(makeI18n("en"));

export function LangProvider({ value, children }: { value: I18n; children: React.ReactNode }) {
  // Screen readers and the browser's own features read the page language from <html lang>.
  useEffect(() => {
    document.documentElement.lang = value.lang === "pcm" ? "pcm" : "en";
  }, [value.lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}
