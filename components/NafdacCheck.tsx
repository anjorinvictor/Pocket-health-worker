/**
 * Pocket Health Worker — NAFDAC medicine check (honest version)
 *
 * The app never decides whether a medicine is genuine. It only helps the person use
 * NAFDAC's own services:
 *  1. Scratch-code (MAS): opens the phone's SMS app with the PIN addressed to the short
 *     code printed on THEIR pack (several MAS providers exist, each with its own code —
 *     never hard-coded). SMS needs no mobile data. The answer comes back by SMS.
 *  2. Registration number (NRN): opens NAFDAC's Greenbook (greenbook.nafdac.gov.ng).
 *     Its search runs in the page, so the number is copied for the person to paste.
 */

"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

const GREENBOOK_URL = "https://greenbook.nafdac.gov.ng/";

export default function NafdacCheck() {
  const { t } = useI18n();
  const [pin, setPin] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [nrn, setNrn] = useState("");
  const [copied, setCopied] = useState(false);

  const cleanPin = pin.replace(/\D/g, "");
  const cleanCode = shortCode.replace(/\D/g, "");
  const smsReady = cleanPin.length >= 6 && cleanCode.length >= 3;
  // Android reads "?body=", iOS accepts it too.
  const smsHref = `sms:${cleanCode}?body=${encodeURIComponent(cleanPin)}`;

  const openGreenbook = async () => {
    const value = nrn.trim();
    if (value) {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
      } catch {
        setCopied(false);
      }
    }
    window.open(GREENBOOK_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">

      {/* 1. Scratch code */}
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (smsReady) window.location.href = smsHref;
        }}
      >
        <h2 className="text-xl font-bold">{t("masTitle")}</h2>
        <p className="text-sm text-muted -mt-2">{t("masStrongest")}</p>
        <div>
          <label htmlFor="mas-pin" className="block text-sm font-semibold text-muted mb-1.5">
            {t("masPin")}
          </label>
          <input
            id="mas-pin"
            className="field"
            inputMode="numeric"
            autoComplete="off"
            placeholder={t("masPinPlaceholder")}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="mas-code" className="block text-sm font-semibold text-muted mb-1.5">
            {t("masCode")}
          </label>
          <input
            id="mas-code"
            className="field"
            inputMode="numeric"
            autoComplete="off"
            placeholder={t("masCodePlaceholder")}
            value={shortCode}
            onChange={(e) => setShortCode(e.target.value)}
          />
        </div>
        <a
          href={smsReady ? smsHref : undefined}
          aria-disabled={!smsReady}
          onClick={(e) => { if (!smsReady) e.preventDefault(); }}
          className="btn btn-primary w-full"
        >
          {t("masOpenSms")}
        </a>
        <p className="text-sm text-muted">{t("masNote")}</p>
      </form>

      {/* 2. Registration number */}
      <div className="space-y-3 border-t border-line pt-5">
        <h2 className="text-xl font-bold">{t("nrnTitle")}</h2>
        <div>
          <label htmlFor="nrn" className="block text-sm font-semibold text-muted mb-1.5">
            {t("nrnLabel")}
          </label>
          <input
            id="nrn"
            className="field"
            autoComplete="off"
            placeholder={t("nrnPlaceholder")}
            value={nrn}
            onChange={(e) => { setNrn(e.target.value); setCopied(false); }}
          />
        </div>
        <button type="button" onClick={openGreenbook} className="btn btn-secondary w-full">
          {t("nrnSearch")}
        </button>
        <p role="status" className="text-sm text-muted">
          {copied ? t("nrnCopied") : t("nrnNote")}
        </p>
        <p className="text-sm text-muted">{t("nrnFakers")}</p>
      </div>
    </div>
  );
}
