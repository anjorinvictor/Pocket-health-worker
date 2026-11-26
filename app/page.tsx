/**
 * Pocket Health Worker — app shell and flow
 *
 * One page, seven screens: welcome → (chat | body map) → result / rules result /
 * emergency / crisis. Safety order on the phone, before any network call:
 *  crisis check → red flags / deterministic rules (RED goes straight to emergency)
 *  → AI (online) → AI may raise urgency, never lower it.
 * If there is no signal, the request times out, or the AI fails, the body-map flow
 * falls back to the rules engine on the phone. Nothing is stored.
 */

"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ChatTurn, RulesResult, StructuredInput, TriageResponse, TriageResult } from "@/types";
import WelcomeScreen from "@/components/WelcomeScreen";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import ResultCard from "@/components/ResultCard";
import OfflineResultCard, { type RulesReason } from "@/components/OfflineResultCard";
import CrisisSupport from "@/components/CrisisSupport";
import EmergencyBanner from "@/components/EmergencyBanner";
import EmergencyActions from "@/components/EmergencyActions";
import EmergencyExplanation, { type ExplainState } from "@/components/EmergencyExplanation";
import ClinicalSidebar from "@/components/ClinicalSidebar";
import DataSaverToggle from "@/components/DataSaverToggle";
import BodyMap from "@/components/BodyMap";
import NafdacCheck from "@/components/NafdacCheck";
import { ArrowLeftIcon, HomeIcon, WifiOffIcon } from "@/components/Icons";
import { isCrisis } from "@/lib/safety/crisis";
import { checkRedFlags } from "@/lib/safety/redFlags";
import { runOfflineTriage } from "@/lib/triage/offlineTriage";
import { raiseUrgency } from "@/lib/triage/urgency";
import { track } from "@/lib/telemetry";

type AppState =
  | { screen: "welcome" }
  | { screen: "chat" }
  | { screen: "bodymap" }
  | { screen: "medicine" }
  | { screen: "result"; result: TriageResult }
  | { screen: "offlineResult"; result: RulesResult; reason: RulesReason }
  | { screen: "crisis" }
  | { screen: "emergency"; message: string; local: boolean };

/** Weak signal must not leave a scared parent waiting forever. */
const REQUEST_TIMEOUT_MS = 25000;

function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

async function postTriage(payload: unknown): Promise<TriageResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch("/api/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    return (await res.json()) as TriageResponse;
  } finally {
    clearTimeout(timer);
  }
}

/** Data Saver: send the first complaint plus the latest two turns, never drop the complaint. */
function trimForDataSaver(history: ChatTurn[]): ChatTurn[] {
  if (history.length <= 3) return history;
  const firstUser = history.find((t) => t.role === "user");
  const tail = history.slice(-2);
  return firstUser && !tail.includes(firstUser) ? [firstUser, ...tail] : tail;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>({ screen: "welcome" });
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [followupCount, setFollowupCount] = useState(0);
  const [dataSaver, setDataSaver] = useState(false);
  const [chatNeedsSignal, setChatNeedsSignal] = useState(false);
  const [userState, setUserState] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [explain, setExplain] = useState<ExplainState>({ status: "none" });
  /** Ignores an explanation that arrives after the person has started over. */
  const explainRun = useRef(0);

  const isOffline = useSyncExternalStore(
    subscribeOnline,
    () => !navigator.onLine,
    () => false
  );

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const onInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onInstall);
    return () => window.removeEventListener("beforeinstallprompt", onInstall);
  }, []);

  // Each new screen starts at the top (phones keep the old scroll position otherwise).
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [appState.screen]);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  };

  const reset = useCallback(() => {
    setAppState({ screen: "welcome" });
    setHistory([]);
    setLoading(false);
    setFollowupCount(0);
    setChatNeedsSignal(false);
    setExplain({ status: "none" });
    explainRun.current += 1;
  }, []);

  /**
   * Emergency screen first (instant, no network). Then, if online and Data Saver is off, ask
   * the AI to explain what is most likely going on; urgency stays RED whatever it says.
   */
  const goEmergency = useCallback(
    (message: string, local: boolean, explainPayload?: { history: ChatTurn[]; structured?: StructuredInput }) => {
      setAppState({ screen: "emergency", message, local });
      const run = ++explainRun.current;
      if (!explainPayload || dataSaver || !navigator.onLine) {
        setExplain({ status: "none" });
        return;
      }
      setExplain({ status: "loading" });
      postTriage({ ...explainPayload, followupCount: 0, dataSaver: false, explain: true })
        .then((data) => {
          if (run !== explainRun.current) return;
          setExplain(data.kind === "result" ? { status: "done", result: data.result } : { status: "failed" });
        })
        .catch(() => {
          if (run === explainRun.current) setExplain({ status: "failed" });
        });
    },
    [dataSaver]
  );

  const showRules = useCallback((result: RulesResult, reason: RulesReason) => {
    if (result.urgencyLevel === "RED") {
      setAppState({ screen: "emergency", message: result.details.split(". ")[0] + ".", local: true });
    } else {
      setAppState({ screen: "offlineResult", result, reason });
    }
  }, []);

  /* ── Body map ─────────────────────────────────────────────── */
  const handleBodyMapSubmit = useCallback(
    async (formattedText: string, structured: StructuredInput) => {
      if (isCrisis(structured.additionalText)) {
        track({ name: "crisis_intercepted", mode: isOffline ? "offline" : "online" });
        setAppState({ screen: "crisis" });
        return;
      }

      // Deterministic rules on the phone first: instant, no data, works with no signal.
      // Offline (no AI to ask) severity alone can mean emergency; online the AI decides that,
      // while danger signs are an emergency either way (owner decision 2026-11-26).
      const offlineNow = isOffline || !navigator.onLine;
      const offlineRules = runOfflineTriage(structured);
      const onlineFloor = runOfflineTriage(structured, { severityEscalates: false });
      const newHistory: ChatTurn[] = [{ role: "user", content: formattedText }];

      if (offlineNow) {
        track({ name: "triage_completed", urgency: offlineRules.urgencyLevel, mode: "offline" });
        showRules(offlineRules, "offline");
        return;
      }
      if (onlineFloor.urgencyLevel === "RED") {
        track({ name: "triage_completed", urgency: "RED", mode: "online" });
        setHistory(newHistory);
        goEmergency(onlineFloor.details.split(". ")[0] + ".", true, { history: newHistory, structured });
        return;
      }

      setLoading(true);
      setAppState({ screen: "chat" });
      setHistory(newHistory);

      try {
        const data = await postTriage({ history: newHistory, followupCount: 0, dataSaver, structured });
        switch (data.kind) {
          case "crisis":
            setAppState({ screen: "crisis" });
            break;
          case "emergency":
            goEmergency(data.matched, false, { history: newHistory, structured });
            break;
          case "rules":
            showRules(data.result, "unavailable");
            break;
          case "followup":
            setHistory((prev) => [...prev, { role: "assistant", content: data.question }]);
            setFollowupCount(1);
            break;
          case "result":
            // Belt and braces: the phone's rules are a floor here too.
            setAppState({
              screen: "result",
              result: { ...data.result, urgencyLevel: raiseUrgency(data.result.urgencyLevel, onlineFloor.urgencyLevel) },
            });
            break;
        }
      } catch {
        track({ name: "triage_error", stage: "bodymap_fetch" });
        // No AI answer: fall back to the full-strength (offline) rules.
        showRules(offlineRules, "unavailable");
      } finally {
        setLoading(false);
      }
    },
    [dataSaver, isOffline, showRules, goEmergency]
  );

  /* ── Chat ─────────────────────────────────────────────────── */
  const handleSend = useCallback(
    async (text: string) => {
      const newHistory: ChatTurn[] = [...history, { role: "user", content: text }];
      setHistory(newHistory);
      setChatNeedsSignal(false);

      if (isCrisis(text)) {
        track({ name: "crisis_intercepted", mode: isOffline ? "offline" : "online" });
        setAppState({ screen: "crisis" });
        return;
      }
      const allUserText = newHistory.filter((t) => t.role === "user").map((t) => t.content).join(" ");
      const redFlag = checkRedFlags(allUserText);
      if (redFlag) {
        track({ name: "red_flag_detected", flag: redFlag.label, mode: isOffline ? "offline" : "online" });
        goEmergency(redFlag.message, true, isOffline ? undefined : { history: newHistory });
        return;
      }

      if (isOffline || !navigator.onLine) {
        setHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "You're offline, so I can't read typed messages right now. No danger signs were found in what you wrote. The body map works without internet — tap the button below to use it.",
          },
        ]);
        setChatNeedsSignal(true);
        return;
      }

      setLoading(true);
      try {
        const data = await postTriage({
          history: dataSaver ? trimForDataSaver(newHistory) : newHistory,
          followupCount,
          dataSaver,
        });
        switch (data.kind) {
          case "crisis":
            setAppState({ screen: "crisis" });
            break;
          case "emergency":
            goEmergency(data.matched, false, { history: newHistory });
            break;
          case "rules":
            showRules(data.result, "unavailable");
            break;
          case "followup":
            setHistory((prev) => [...prev, { role: "assistant", content: data.question }]);
            setFollowupCount((c) => c + 1);
            break;
          case "result":
            setAppState({ screen: "result", result: data.result });
            break;
        }
      } catch {
        track({ name: "triage_error", stage: "chat_fetch" });
        setHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "The connection is too weak right now. No danger signs were found in what you wrote. You can try again, or use the body map — it works without internet. If you are worried, see a health worker.",
          },
        ]);
        setChatNeedsSignal(true);
      } finally {
        setLoading(false);
      }
    },
    [history, followupCount, dataSaver, isOffline, showRules, goEmergency]
  );

  const tools = (
    <ClinicalSidebar
      dataSaver={dataSaver}
      onToggleDataSaver={setDataSaver}
      selectedState={userState}
      onStateChange={setUserState}
    />
  );

  return (
    <div className="min-h-dvh flex flex-col bg-cream text-ink">
      {/* Header */}
      <header className="on-dark sticky top-0 z-40 bg-espresso text-cream">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-2.5 min-h-12 cursor-pointer text-left"
            aria-label="Pocket Health Worker — go to start"
          >
            <span aria-hidden className="w-9 h-9 rounded-xl bg-rust flex items-center justify-center font-serif font-bold text-cream">
              P
            </span>
            <span className="font-serif text-lg font-bold leading-tight hidden min-[380px]:block">Pocket Health Worker</span>
          </button>
          <div className="flex items-center gap-2">
            {installPrompt && (
              <button type="button" onClick={handleInstallClick} className="btn btn-quiet text-ember hidden sm:inline-flex">
                Install app
              </button>
            )}
            <DataSaverToggle on={dataSaver} onChange={setDataSaver} variant="header" />
            {appState.screen !== "welcome" && (
              <button type="button" onClick={reset} className="btn btn-on-dark px-3">
                <HomeIcon />
                <span className="hidden sm:inline">Start over</span>
                <span className="sr-only sm:hidden">Start over</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {isOffline && (
        <div role="status" className="bg-espresso-soft text-cream">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-start gap-2.5 text-sm">
            <WifiOffIcon className="w-5 h-5 text-ember mt-0.5" />
            <p>
              <span className="font-bold">No internet — still working on your phone.</span> The body map, danger-sign
              checks, emergency numbers and hospital list all work offline.
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 w-full mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        {appState.screen === "welcome" && (
          <WelcomeScreen
            onSelectMode={(mode) => setAppState({ screen: mode })}
            onCrisisClick={() => setAppState({ screen: "crisis" })}
          />
        )}

        {appState.screen === "bodymap" && <BodyMap onSubmit={handleBodyMapSubmit} onBack={reset} />}

        {appState.screen === "crisis" && <CrisisSupport onReset={reset} />}

        {appState.screen === "medicine" && (
          <div className="mx-auto max-w-xl space-y-5 animate-fade-in">
            <button type="button" onClick={reset} className="btn btn-secondary">
              <ArrowLeftIcon /> Back
            </button>
            <div className="space-y-2">
              <p className="eyebrow">NAFDAC check</p>
              <h1 className="text-3xl sm:text-4xl font-bold">Is this medicine genuine?</h1>
              <p className="text-lg text-muted">
                Fake medicines are common. NAFDAC can tell you if yours is real. This app does not decide: it only
                helps you ask NAFDAC.
              </p>
            </div>
            <div className="card p-5 sm:p-6">
              <NafdacCheck />
            </div>
          </div>
        )}

        {appState.screen === "emergency" && (
          <div className="mx-auto max-w-xl space-y-4 animate-fade-in">
            <EmergencyBanner message={appState.message} />
            {appState.local && (
              <p className="text-sm text-muted">
                This was decided by fixed safety rules on your phone{isOffline ? ", with no internet needed" : ""}. It is
                guidance, not a diagnosis.
              </p>
            )}
            <EmergencyActions selectedState={userState} onStateChange={setUserState}>
              <EmergencyExplanation state={explain} />
            </EmergencyActions>
            <button type="button" onClick={reset} className="btn btn-secondary w-full">
              Start a new check
            </button>
          </div>
        )}

        {appState.screen === "result" && appState.result.urgencyLevel === "RED" && (
          <div className="mx-auto max-w-xl">
            <ResultCard
              result={appState.result}
              history={history}
              onReset={reset}
              onContinue={() => setAppState({ screen: "chat" })}
              selectedState={userState}
              onStateChange={setUserState}
            />
          </div>
        )}

        {appState.screen === "result" && appState.result.urgencyLevel !== "RED" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-7">
              <ResultCard
                result={appState.result}
                history={history}
                onReset={reset}
                onContinue={() => setAppState({ screen: "chat" })}
                selectedState={userState}
                onStateChange={setUserState}
              />
            </div>
            <div className="lg:col-span-5 lg:sticky lg:top-20">{tools}</div>
          </div>
        )}

        {appState.screen === "offlineResult" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-7">
              <OfflineResultCard result={appState.result} reason={appState.reason} onReset={reset} />
            </div>
            <div className="lg:col-span-5 lg:sticky lg:top-20">{tools}</div>
          </div>
        )}

        {appState.screen === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <section
              aria-label="Symptom conversation"
              className="lg:col-span-7 card overflow-hidden flex flex-col h-[72dvh] min-h-[420px] lg:h-[640px]"
            >
              <ChatWindow history={history} loading={loading} />
              {chatNeedsSignal && (
                <div className="px-4 pb-3">
                  <button type="button" onClick={() => setAppState({ screen: "bodymap" })} className="btn btn-secondary w-full">
                    Use the body map instead
                  </button>
                </div>
              )}
              <ChatInput onSend={handleSend} disabled={loading} />
            </section>
            <div className="lg:col-span-5 lg:sticky lg:top-20">{tools}</div>
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-6xl w-full px-4 sm:px-6 pb-8 text-sm text-muted">
        Guidance only, not a diagnosis. In an emergency call 112.
      </footer>
    </div>
  );
}
