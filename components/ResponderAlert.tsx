/**
 * Pocket Health Worker — "Alert the nearest clinic" (DEMO, shown only with ?demo=1).
 * Sends the danger sign, the answers and the location to the clinic dashboard (/responder)
 * open in another window of this browser. Waits for the clinic to acknowledge.
 * 112 stays the first action on the screen; this card says so.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import type { HandoverInfo } from "@/types";
import { REGION_LABELS } from "@/lib/triage/options";
import { useI18n } from "@/lib/i18n";
import {
  DEMO_PATIENT_LOCATION,
  newAlertId,
  openChannel,
  type AlertLocation,
  type ClinicAlert,
  type ResponderMessage,
} from "@/lib/responder";
import { AlertIcon } from "./Icons";

type Status =
  | { s: "idle" }
  | { s: "locating" }
  | { s: "sent"; id: string; location: AlertLocation }
  | { s: "ack"; id: string; location: AlertLocation; facility: string }
  | { s: "cancelled" };

interface Props {
  finding: string;
  sign?: string;
  info: HandoverInfo;
}

function getLocation(): Promise<AlertLocation> {
  return new Promise((resolve) => {
    const fallback = () => resolve({ ...DEMO_PATIENT_LOCATION, demo: true });
    if (typeof navigator === "undefined" || !navigator.geolocation) return fallback();
    navigator.geolocation.getCurrentPosition(
      (p) =>
        resolve({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: Math.round(p.coords.accuracy),
          demo: false,
        }),
      fallback,
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });
}

export default function ResponderAlert({ finding, sign, info }: Props) {
  const { t } = useI18n();
  const [status, setStatus] = useState<Status>({ s: "idle" });
  const channel = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const ch = openChannel();
    channel.current = ch;
    if (!ch) return;
    ch.onmessage = (e: MessageEvent<ResponderMessage>) => {
      const m = e.data;
      if (m?.type !== "ack") return;
      setStatus((cur) =>
        cur.s === "sent" && cur.id === m.id ? { s: "ack", id: cur.id, location: cur.location, facility: m.facility } : cur
      );
    };
    return () => ch.close();
  }, []);

  const send = async () => {
    setStatus({ s: "locating" });
    const location = await getLocation();
    const s = info.structured;
    const alert: ClinicAlert = {
      type: "alert",
      id: newAlertId(),
      sentAt: new Date().toISOString(),
      finding,
      sign,
      age: s?.ageGroup,
      sex: s?.biologicalSex,
      region: s ? REGION_LABELS[s.region] ?? s.region : undefined,
      symptoms: s?.symptoms ?? [],
      words: [...(s?.additionalText ? [s.additionalText] : []), ...info.messages],
      location,
    };
    channel.current?.postMessage(alert);
    setStatus({ s: "sent", id: alert.id, location });
  };

  const cancel = () => {
    if (status.s === "sent" || status.s === "ack") channel.current?.postMessage({ type: "cancel", id: status.id });
    setStatus({ s: "cancelled" });
  };

  const location = status.s === "sent" || status.s === "ack" ? status.location : null;

  return (
    <section aria-labelledby="resp-title" className="card p-5 sm:p-6 space-y-3 border-2 border-dashed border-edge">
      <p className="eyebrow">{t("respDemo")}</p>
      <h2 id="resp-title" className="text-xl font-bold">
        {t("respTitle")}
      </h2>
      <p className="text-muted">{t("respBody")}</p>

      {(status.s === "idle" || status.s === "cancelled") && (
        <>
          {status.s === "cancelled" && <p className="text-sm text-muted">{t("respCancelled")}</p>}
          <button type="button" onClick={send} className="btn btn-primary w-full">
            <AlertIcon className="w-5 h-5" /> {t("respSend")}
          </button>
        </>
      )}

      <div aria-live="polite" className="space-y-3">
        {status.s === "locating" && <p className="font-semibold">{t("respLocating")}</p>}

        {status.s === "sent" && (
          <p className="flex items-center gap-3 font-semibold">
            <span className="relative flex h-3 w-3 shrink-0" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-rust opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-rust" />
            </span>
            {t("respSent")}
          </p>
        )}

        {status.s === "ack" && (
          <p className="rounded-2xl bg-home-soft text-home px-4 py-3 text-lg font-bold animate-fade-in">
            {t("respAck", { facility: status.facility })}
          </p>
        )}

        {location && (
          <p className="text-sm text-muted">
            {location.demo ? t("respNoLoc") : t("respLocShared", { m: location.accuracy })}
          </p>
        )}
      </div>

      {(status.s === "sent" || status.s === "ack") && (
        <button type="button" onClick={cancel} className="btn btn-secondary w-full">
          {t("respCancel")}
        </button>
      )}
    </section>
  );
}
