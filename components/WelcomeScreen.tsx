/**
 * Pocket Health Worker — Welcome screen
 *
 * Phone first: language choice, headline and the three ways to start are the first thing
 * on a 360px screen; the install card, the three urgency levels and the privacy promise
 * follow. On wide screens they sit side by side.
 */

"use client";

import UrgencyBadge from "./UrgencyBadge";
import InstallCard from "./InstallCard";
import LanguageToggle from "./LanguageToggle";
import { BodyIcon, ChatIcon, PhoneIcon, PillIcon } from "./Icons";
import { NATIONAL_EMERGENCY } from "@/data/emergency-lines";
import { useI18n, type Lang } from "@/lib/i18n";

interface Props {
  onSelectMode: (mode: "chat" | "bodymap" | "medicine") => void;
  onCrisisClick: () => void;
  onLangChange: (lang: Lang) => void;
  canInstall: boolean;
  installed: boolean;
  onInstall: () => void;
}

export default function WelcomeScreen({ onSelectMode, onCrisisClick, onLangChange, canInstall, installed, onInstall }: Props) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start animate-fade-in">
      {/* Start */}
      <section className="lg:col-span-7 space-y-6 lg:pt-6" aria-labelledby="welcome-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="eyebrow">{t("welcomeEyebrow")}</p>
          <LanguageToggle variant="choice" onChange={onLangChange} />
        </div>
        <h1 id="welcome-title" className="text-4xl sm:text-5xl font-bold text-ink">
          {t("welcomeTitle")}
        </h1>
        <p className="text-lg text-muted max-w-xl">{t("welcomeIntro")}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onSelectMode("chat")}
            className="btn btn-primary justify-start md:flex-col md:items-start text-left min-h-20 px-5 py-4 gap-3"
          >
            <ChatIcon />
            <span>
              <span className="block text-lg">{t("modeChat")}</span>
              <span className="block text-sm font-normal opacity-90">{t("modeChatSub")}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelectMode("bodymap")}
            className="btn btn-secondary justify-start md:flex-col md:items-start text-left min-h-20 px-5 py-4 gap-3"
          >
            <BodyIcon className="w-6 h-6 text-rust" />
            <span>
              <span className="block text-lg">{t("modeBody")}</span>
              <span className="block text-sm font-normal text-muted">{t("modeBodySub")}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelectMode("medicine")}
            className="btn btn-secondary justify-start md:flex-col md:items-start text-left min-h-20 px-5 py-4 gap-3"
          >
            <PillIcon className="w-6 h-6 text-rust" />
            <span>
              <span className="block text-lg">{t("modeMedicine")}</span>
              <span className="block text-sm font-normal text-muted">{t("modeMedicineSub")}</span>
            </span>
          </button>
        </div>

        <a href={`tel:${NATIONAL_EMERGENCY.tel}`} className="btn btn-quiet px-0">
          <PhoneIcon /> {t("welcomeCall", { n: NATIONAL_EMERGENCY.display })}
        </a>

        <InstallCard canPrompt={canInstall} installed={installed} onInstall={onInstall} />
      </section>

      {/* What you get + promise */}
      <aside className="on-dark lg:col-span-5 rounded-3xl bg-espresso text-cream p-6 sm:p-8 space-y-7">
        <section aria-labelledby="levels-title" className="space-y-4">
          <h2 id="levels-title" className="text-2xl font-bold">{t("levelsTitle")}</h2>
          <ul className="space-y-4">
            <li className="space-y-1.5">
              <UrgencyBadge level="GREEN" />
              <p className="text-on-dark-muted">{t("levelGREEN")}</p>
            </li>
            <li className="space-y-1.5">
              <UrgencyBadge level="YELLOW" />
              <p className="text-on-dark-muted">{t("levelYELLOW")}</p>
            </li>
            <li className="space-y-1.5">
              <UrgencyBadge level="RED" />
              <p className="text-on-dark-muted">{t("levelRED")}</p>
            </li>
          </ul>
        </section>

        <section aria-labelledby="promise-title" className="space-y-2 border-t border-espresso-soft pt-6">
          <h2 id="promise-title" className="text-xl font-bold text-ember">{t("promiseTitle")}</h2>
          <p className="text-on-dark-muted">{t("promiseBody")}</p>
        </section>

        <p className="text-on-dark-muted">
          {t("struggling")}{" "}
          <button type="button" onClick={onCrisisClick} className="btn btn-quiet text-ember min-h-12 px-1">
            {t("findSupport")}
          </button>
        </p>

        <p className="text-sm text-on-dark-muted">{t("welcomeFoot")}</p>
      </aside>
    </div>
  );
}
