/**
 * Pocket Health Worker — "Keep it on your phone"
 *
 * One tap to add the app to the home screen where the browser offers it (Android Chrome,
 * Edge: the beforeinstallprompt event, caught in app/page.tsx). iPhone Safari has no such
 * event, so it gets the two-step instruction; other browsers get the menu instruction.
 * Hidden when the app is already running installed. Nothing is stored.
 */

"use client";

import { useSyncExternalStore } from "react";
import { useI18n } from "@/lib/i18n";
import { DownloadIcon } from "./Icons";

const noSubscribe = () => () => {};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

interface Props {
  /** The browser offered an install prompt. */
  canPrompt: boolean;
  installed: boolean;
  onInstall: () => void;
}

export default function InstallCard({ canPrompt, installed, onInstall }: Props) {
  const { t } = useI18n();
  const standalone = useSyncExternalStore(noSubscribe, isStandalone, () => true);
  const ios = useSyncExternalStore(noSubscribe, isIos, () => false);

  if (standalone) return null;

  return (
    <section aria-labelledby="install-title" className="card p-5 space-y-3">
      <div className="flex items-start gap-3">
        <DownloadIcon className="w-6 h-6 text-rust mt-0.5 shrink-0" />
        <div>
          <h2 id="install-title" className="text-xl font-bold">{t("installTitle")}</h2>
          <p className="text-muted">{t("installBody")}</p>
        </div>
      </div>
      {installed ? (
        <p role="status" className="rounded-xl bg-home-soft text-home px-4 py-3 font-semibold">{t("installDone")}</p>
      ) : canPrompt ? (
        <button type="button" onClick={onInstall} className="btn btn-secondary w-full">
          <DownloadIcon /> {t("installButton")}
        </button>
      ) : (
        <p className="rounded-xl bg-sand px-4 py-3">{ios ? t("installIos") : t("installOther")}</p>
      )}
    </section>
  );
}
