/**
 * EmergencyBanner — the unmistakable top of every RED screen.
 * Words + warning-triangle shape + colour; never colour alone. No emoji.
 */

"use client";

import { useI18n } from "@/lib/i18n";
import { AlertIcon } from "./Icons";

export default function EmergencyBanner({ message }: { message?: string }) {
  const { t, tx } = useI18n();
  return (
    <div role="alert" className="rounded-2xl bg-danger text-white p-5 sm:p-6 slide-down">
      <div className="flex items-start gap-3">
        <AlertIcon className="w-8 h-8 mt-0.5 shrink-0 throb" />
        <div>
          <p className="text-sm font-bold uppercase tracking-wider">{t("emergencyEyebrow")}</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold">{t("emergencyTitle")}</h1>
          {message && <p className="mt-2 text-base">{tx(message)}</p>}
          <p className="mt-2 text-base font-semibold">{t("emergencyNoWait")}</p>
        </div>
      </div>
    </div>
  );
}
