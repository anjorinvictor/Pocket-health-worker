/**
 * Pocket Health Worker — clinic responder dashboard (DEMO).
 *
 * What a clinic would keep open at the front desk: emergency alerts from people nearby, with
 * the danger sign, their answers and where they are. Staff acknowledge ("team on the way"),
 * which the person sees on their phone. For the pitch this runs between two windows of one
 * browser (see lib/responder.ts): nothing goes over the internet and nothing is stored.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import {
  DEMO_FACILITY,
  distanceKm,
  openChannel,
  type ClinicAlert,
  type ResponderMessage,
} from "@/lib/responder";

type Row = ClinicAlert & { state: "new" | "dispatched" | "resolved" | "cancelled"; receivedAt: number };

/** Two-tone alert sound (Web Audio, no file to download). Needs one click first (browser rule). */
function playAlarm(ctx: AudioContext) {
  const now = ctx.currentTime;
  for (let i = 0; i < 6; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = i % 2 === 0 ? 880 : 660;
    gain.gain.setValueAtTime(0.0001, now + i * 0.28);
    gain.gain.exponentialRampToValueAtTime(0.25, now + i * 0.28 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.28 + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + i * 0.28);
    osc.stop(now + i * 0.28 + 0.27);
  }
}

function ago(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s} s ago`;
  return `${Math.floor(s / 60)} min ago`;
}

const STATE_LABEL: Record<Row["state"], { text: string; classes: string }> = {
  new: { text: "NEW — not yet answered", classes: "bg-danger text-white" },
  dispatched: { text: "Team on the way", classes: "bg-home-soft text-home" },
  resolved: { text: "Resolved", classes: "bg-sand text-muted" },
  cancelled: { text: "Cancelled by the person", classes: "bg-sand text-muted" },
};

export default function ResponderDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [listening, setListening] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const channel = useRef<BroadcastChannel | null>(null);
  const audio = useRef<AudioContext | null>(null);

  useEffect(() => {
    const ch = openChannel();
    channel.current = ch;
    if (!ch) return;
    ch.onmessage = (e: MessageEvent<ResponderMessage>) => {
      const m = e.data;
      if (m?.type === "alert") {
        setRows((r) => [{ ...m, state: "new", receivedAt: Date.now() }, ...r.filter((x) => x.id !== m.id)]);
        if (audio.current) playAlarm(audio.current);
      } else if (m?.type === "cancel") {
        setRows((r) => r.map((x) => (x.id === m.id ? { ...x, state: "cancelled" } : x)));
      }
    };
    return () => ch.close();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  const open = rows.filter((r) => r.state === "new").length;
  useEffect(() => {
    document.title = open > 0 ? `(${open}) Emergency alert — PHW Responder` : "PHW Responder — demo";
  }, [open]);

  const startListening = () => {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (Ctx && !audio.current) audio.current = new Ctx();
    setListening(true);
  };

  const acknowledge = (id: string) => {
    channel.current?.postMessage({ type: "ack", id, facility: DEMO_FACILITY.name } satisfies ResponderMessage);
    setRows((r) => r.map((x) => (x.id === id ? { ...x, state: "dispatched" } : x)));
  };
  const resolve = (id: string) => setRows((r) => r.map((x) => (x.id === id ? { ...x, state: "resolved" } : x)));

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <header className="on-dark bg-espresso text-cream">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10 shrink-0" />
            <div>
              <p className="font-serif text-lg font-bold leading-tight">PHW Responder</p>
              <p className="text-sm text-on-dark-muted">{DEMO_FACILITY.name}</p>
            </div>
          </div>
          <span className="rounded-full bg-ember text-espresso px-3 py-1 text-sm font-bold">DEMO</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Emergency alerts nearby</h1>
            <p className="text-muted">
              Coverage: within {DEMO_FACILITY.radiusKm} km of {DEMO_FACILITY.name} (demo setting)
            </p>
          </div>
          {listening ? (
            <p className="flex items-center gap-2 font-semibold text-home" aria-live="polite">
              <span className="relative flex h-3 w-3" aria-hidden>
                <span className="absolute inline-flex h-full w-full rounded-full bg-home opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-home" />
              </span>
              Listening, sound on
            </p>
          ) : (
            <button type="button" onClick={startListening} className="btn btn-primary">
              Start listening (turn sound on)
            </button>
          )}
        </div>

        <div aria-live="assertive" className="space-y-4">
          {rows.length === 0 && (
            <div className="card p-6 text-muted">
              <p className="font-semibold text-ink">No alerts right now.</p>
              <p>
                When someone near you gets an emergency result in Pocket Health Worker and taps “Send alert to nearby
                clinic”, it appears here with their danger sign and location.
              </p>
            </div>
          )}

          {rows.map((r) => {
            const km = distanceKm(DEMO_FACILITY, r.location);
            const maps = `https://www.google.com/maps?q=${r.location.lat},${r.location.lng}`;
            const label = STATE_LABEL[r.state];
            return (
              <article
                key={r.id}
                className={`card p-5 sm:p-6 space-y-4 animate-fade-in ${r.state === "new" ? "border-2 border-danger pulse-ring" : ""}`}
                aria-label={`Alert: ${r.finding}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${label.classes}`}>{label.text}</span>
                  <span className="text-sm text-muted">
                    {new Date(r.sentAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} ·{" "}
                    {ago(now - r.receivedAt)}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-danger">{r.finding}</h2>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-lg">
                  {r.age && (
                    <div>
                      <dt className="text-sm font-bold uppercase tracking-wider text-muted">Age</dt>
                      <dd>{r.age}</dd>
                    </div>
                  )}
                  {r.sex && (
                    <div>
                      <dt className="text-sm font-bold uppercase tracking-wider text-muted">Sex / pregnancy</dt>
                      <dd>{r.sex}</dd>
                    </div>
                  )}
                  {r.region && (
                    <div>
                      <dt className="text-sm font-bold uppercase tracking-wider text-muted">Where</dt>
                      <dd>{r.region}</dd>
                    </div>
                  )}
                  {r.symptoms.length > 0 && (
                    <div>
                      <dt className="text-sm font-bold uppercase tracking-wider text-muted">Symptoms</dt>
                      <dd>{r.symptoms.join(", ")}</dd>
                    </div>
                  )}
                  {r.words.length > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-bold uppercase tracking-wider text-muted">In their own words</dt>
                      <dd>{r.words.map((w) => `“${w}”`).join(" ")}</dd>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-bold uppercase tracking-wider text-muted">Location</dt>
                    <dd>
                      About {km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`} from you · accurate to ~
                      {r.location.accuracy} m{r.location.demo ? " · demo location" : ""}
                      <br />
                      <a href={maps} target="_blank" rel="noreferrer" className="btn btn-quiet px-0">
                        Open in Maps ({r.location.lat.toFixed(5)}, {r.location.lng.toFixed(5)})
                      </a>
                    </dd>
                  </div>
                </dl>

                {(r.state === "new" || r.state === "dispatched") && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    {r.state === "new" && (
                      <button type="button" onClick={() => acknowledge(r.id)} className="btn btn-danger sm:flex-1">
                        Acknowledge — team on the way
                      </button>
                    )}
                    <button type="button" onClick={() => resolve(r.id)} className="btn btn-secondary sm:flex-1">
                      Mark resolved
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <p className="text-sm text-muted">
          Demo: alerts travel between windows on this computer only. Nothing is sent over the internet and nothing is
          stored. Guidance only, not a diagnosis.
        </p>
      </main>
    </div>
  );
}
