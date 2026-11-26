/**
 * Pocket Health Worker — English / Pidgin switch
 *
 * Header: one button naming the other language ("Pidgin" while in English).
 * Welcome: both choices side by side, so the first screen shows it exists.
 * Memory only — nothing stored — so it starts in English on every visit.
 */

"use client";

import type { Lang } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n";

interface Props {
  onChange: (lang: Lang) => void;
  variant?: "header" | "choice";
}

export default function LanguageToggle({ onChange, variant = "header" }: Props) {
  const { lang, t } = useI18n();

  if (variant === "header") {
    const other: Lang = lang === "en" ? "pcm" : "en";
    return (
      <button
        type="button"
        onClick={() => onChange(other)}
        aria-label={t("langSwitchAria")}
        className="btn btn-on-dark px-3 text-sm"
      >
        <span lang={other === "pcm" ? "pcm" : "en"}>{t("langSwitchTo")}</span>
      </button>
    );
  }

  return (
    <div role="group" aria-label={t("langLabel")} className="inline-grid grid-cols-2 gap-2">
      <button type="button" aria-pressed={lang === "en"} onClick={() => onChange("en")} className="chip justify-center" lang="en">
        English
      </button>
      <button type="button" aria-pressed={lang === "pcm"} onClick={() => onChange("pcm")} className="chip justify-center" lang="pcm">
        Pidgin
      </button>
    </div>
  );
}
