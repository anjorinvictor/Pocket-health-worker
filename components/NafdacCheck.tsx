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

const GREENBOOK_URL = "https://greenbook.nafdac.gov.ng/";

export default function NafdacCheck() {
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
      <div>
        <h2 className="text-xl font-bold">Check a medicine with NAFDAC</h2>
        <p className="text-sm text-muted mt-0.5">
          NAFDAC gives the answer, not this app.
        </p>
      </div>

      {/* 1. Scratch code */}
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (smsReady) window.location.href = smsHref;
        }}
      >
        <p className="font-semibold">1. Scratch code on the pack (strongest check)</p>
        <div>
          <label htmlFor="mas-pin" className="block text-sm font-semibold text-muted mb-1.5">
            PIN under the scratch panel
          </label>
          <input
            id="mas-pin"
            className="field"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Numbers only"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="mas-code" className="block text-sm font-semibold text-muted mb-1.5">
            Short code printed beside the panel
          </label>
          <input
            id="mas-code"
            className="field"
            inputMode="numeric"
            autoComplete="off"
            placeholder="For example 38353"
            value={shortCode}
            onChange={(e) => setShortCode(e.target.value)}
          />
        </div>
        <a
          href={smsReady ? smsHref : undefined}
          aria-disabled={!smsReady}
          onClick={(e) => { if (!smsReady) e.preventDefault(); }}
          className="btn btn-secondary w-full"
        >
          Open SMS to send the PIN
        </a>
        <p className="text-sm text-muted">
          Your phone texts the PIN to NAFDAC&apos;s verification service. The reply SMS tells you if the
          medicine is genuine. Texting the PIN is free and works without data.
        </p>
      </form>

      {/* 2. Registration number */}
      <div className="space-y-3 border-t border-line pt-5">
        <p className="font-semibold">2. NAFDAC registration number</p>
        <div>
          <label htmlFor="nrn" className="block text-sm font-semibold text-muted mb-1.5">
            NAFDAC Reg. No. on the pack
          </label>
          <input
            id="nrn"
            className="field"
            autoComplete="off"
            placeholder="For example A4-1234"
            value={nrn}
            onChange={(e) => { setNrn(e.target.value); setCopied(false); }}
          />
        </div>
        <button type="button" onClick={openGreenbook} className="btn btn-secondary w-full">
          Search NAFDAC Greenbook
        </button>
        <p role="status" className="text-sm text-muted">
          {copied
            ? "Number copied. Paste it into the “NAFDAC Reg. No.” box on the Greenbook page."
            : "Opens NAFDAC's official list of registered medicines (needs data)."}
        </p>
        <p className="text-sm text-muted">
          Fakers sometimes copy real registration numbers, so the scratch-code check is the stronger test.
        </p>
      </div>
    </div>
  );
}
