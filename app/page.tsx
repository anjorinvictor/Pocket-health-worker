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

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { ChatTurn, HandoverInfo, RulesResult, StructuredInput, TriageResponse, TriageResult } from "@/types";
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
import NurseCard from "@/components/NurseCard";
import Logo from "@/components/Logo";
import ResponderAlert from "@/components/ResponderAlert";
import LanguageToggle from "@/components/LanguageToggle";
import { LangProvider, makeI18n, type Lang } from "@/lib/i18n";
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
  /** message: the danger sign (English, translated on screen); sign: its id, for first aid. */
  | { screen: "emergency"; message: string; local: boolean; sign?: string };

/** Weak signal must not leave a scared parent waiting forever. */
const REQUEST_TIMEOUT_MS = 25000;

function subscribeNever() {
  return () => {};
}

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
  const [installed, setInstalled] = useState(false);
  const [explain, setExplain] = useState<ExplainState>({ status: "none" });
  /** Language, in memory only (nothing stored). */
  const [lang, setLang] = useState<Lang>("en");
  const i18n = useMemo(() => makeI18n(lang), [lang]);
  const { t } = i18n;
  /** Body-map answers of the current check, for the nurse card. Memory only. */
  const [structuredInput, setStructuredInput] = useState<StructuredInput | null>(null);
  /** Ignores an explanation that arrives after the person has started over. */
  const explainRun = useRef(0);

  const isOffline = useSyncExternalStore(
    subscribeOnline,
    () => !navigator.onLine,
    () => false
  );
  /** Pitch demo only: "?demo=1" shows the clinic-alert prototype. Never shown otherwise. */
  const demoMode = useSyncExternalStore(
    subscribeNever,
    () => new URLSearchParams(window.location.search).has("demo"),
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
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Each new screen starts at the top (phones keep the old scroll position otherwise).
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [appState.screen]);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
      setInstalled(true);
    }
  };

  const reset = useCallback(() => {
    setAppState({ screen: "welcome" });
    setHistory([]);
    setLoading(false);
    setFollowupCount(0);
    setChatNeedsSignal(false);
    setStructuredInput(null);
    setExplain({ status: "none" });
    explainRun.current += 1;
  }, []);

  /**
   * Emergency screen first (instant, no network). Then, if online and Data Saver is off, ask
   * the AI to explain what is most likely going on; urgency stays RED whatever it says.
   */
  const goEmergency = useCallback(
    (
      message: string,
      local: boolean,
      sign: string | undefined,
      explainPayload?: { history: ChatTurn[]; structured?: StructuredInput }
    ) => {
      setAppState({ screen: "emergency", message, local, sign });
      const run = ++explainRun.current;
      if (!explainPayload || dataSaver || !navigator.onLine) {
        setExplain({ status: "none" });
        return;
      }
      setExplain({ status: "loading" });
      postTriage({ ...explainPayload, followupCount: 0, dataSaver: false, explain: true, lang })
        .then((data) => {
          if (run !== explainRun.current) return;
          setExplain(data.kind === "result" ? { status: "done", result: data.result } : { status: "failed" });
        })
        .catch(() => {
          if (run === explainRun.current) setExplain({ status: "failed" });
        });
    },
    [dataSaver, lang]
  );

  const showRules = useCallback((result: RulesResult, reason: RulesReason) => {
    if (result.urgencyLevel === "RED") {
      setAppState({ screen: "emergency", message: result.details.split(". ")[0] + ".", local: true, sign: result.sign });
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
      setStructuredInput(structured);

      if (offlineNow) {
        track({ name: "triage_completed", urgency: offlineRules.urgencyLevel, mode: "offline" });
        showRules(offlineRules, "offline");
        return;
      }
      if (onlineFloor.urgencyLevel === "RED") {
        track({ name: "triage_completed", urgency: "RED", mode: "online" });
        setHistory(newHistory);
        goEmergency(onlineFloor.details.split(". ")[0] + ".", true, onlineFloor.sign, { history: newHistory, structured });
        return;
      }

      setLoading(true);
      setAppState({ screen: "chat" });
      setHistory(newHistory);

      try {
        const data = await postTriage({ history: newHistory, followupCount: 0, dataSaver, structured, lang });
        switch (data.kind) {
          case "crisis":
            setAppState({ screen: "crisis" });
            break;
          case "emergency":
            goEmergency(data.matched, false, data.flag, { history: newHistory, structured });
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
    [dataSaver, isOffline, showRules, goEmergency, lang]
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
        goEmergency(redFlag.message, true, redFlag.id, isOffline ? undefined : { history: newHistory });
        return;
      }

      if (isOffline || !navigator.onLine) {
        setHistory((prev) => [
          ...prev,
          { role: "assistant", content: t("chatOffline") },
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
          lang,
        });
        switch (data.kind) {
          case "crisis":
            setAppState({ screen: "crisis" });
            break;
          case "emergency":
            goEmergency(data.matched, false, data.flag, { history: newHistory });
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
          { role: "assistant", content: t("chatWeak") },
        ]);
        setChatNeedsSignal(true);
      } finally {
        setLoading(false);
      }
    },
    [history, followupCount, dataSaver, isOffline, showRules, goEmergency, lang, t]
  );

  const userTurns = history.filter((h) => h.role === "user").map((h) => h.content);
  const handover: HandoverInfo = {
    structured: structuredInput,
    // After the body map the first turn is its summary (already shown from structuredInput).
    messages: structuredInput ? userTurns.slice(1) : userTurns,
  };

  const tools = (
    <ClinicalSidebar
      dataSaver={dataSaver}
      onToggleDataSaver={setDataSaver}
      selectedState={userState}
      onStateChange={setUserState}
    />
  );

  return (
    <LangProvider value={i18n}>
    <div className="min-h-dvh flex flex-col bg-cream text-ink">
      {/* Header */}
      <header className="on-dark sticky top-0 z-40 bg-espresso text-cream">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-2.5 min-h-12 cursor-pointer text-left"
            aria-label={t("brandAria")}
          >
            <Logo className="w-10 h-10 shrink-0" />
            <span className="font-serif text-lg font-bold leading-tight hidden min-[380px]:block">Pocket Health Worker</span>
          </button>
          <div className="flex items-center gap-2">
            <LanguageToggle onChange={setLang} />
            <DataSaverToggle on={dataSaver} onChange={setDataSaver} variant="header" />
            {appState.screen !== "welcome" && (
              <button type="button" onClick={reset} className="btn btn-on-dark px-3">
                <HomeIcon />
                <span className="hidden sm:inline">{t("startOver")}</span>
                <span className="sr-only sm:hidden">{t("startOver")}</span>
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
              <span className="font-bold">{t("offlineTitle")}</span> {t("offlineBody")}
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 w-full mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        {appState.screen === "welcome" && (
          <WelcomeScreen
            onSelectMode={(mode) => setAppState({ screen: mode })}
            onCrisisClick={() => setAppState({ screen: "crisis" })}
            onLangChange={setLang}
            canInstall={!!installPrompt}
            installed={installed}
            onInstall={handleInstallClick}
          />
        )}

        {appState.screen === "bodymap" && <BodyMap onSubmit={handleBodyMapSubmit} onBack={reset} />}

        {appState.screen === "crisis" && <CrisisSupport onReset={reset} />}

        {appState.screen === "medicine" && (
          <div className="mx-auto max-w-xl space-y-5 stagger">
            <button type="button" onClick={reset} className="btn btn-secondary">
              <ArrowLeftIcon /> {t("back")}
            </button>
            <div className="space-y-2">
              <p className="eyebrow">{t("medEyebrow")}</p>
              <h1 className="text-3xl sm:text-4xl font-bold">{t("medTitle")}</h1>
              <p className="text-lg text-muted">{t("medIntro")}</p>
            </div>
            <div className="card p-5 sm:p-6">
              <NafdacCheck />
            </div>
          </div>
        )}

        {appState.screen === "emergency" && (
          <div className="mx-auto max-w-xl space-y-4 stagger">
            <EmergencyBanner message={appState.message} />
            {appState.local && (
              <p className="text-sm text-muted">{isOffline ? t("emergencyLocalOffline") : t("emergencyLocal")}</p>
            )}
            <EmergencyActions selectedState={userState} onStateChange={setUserState} sign={appState.sign}>
              <EmergencyExplanation state={explain} />
            </EmergencyActions>
            {demoMode && <ResponderAlert finding={appState.message} sign={appState.sign} info={handover} />}
            <NurseCard
              info={handover}
              urgency="RED"
              finding={appState.message}
              likelyCondition={explain.status === "done" ? explain.result.likelyCondition : undefined}
            />
            <button type="button" onClick={reset} className="btn btn-secondary w-full">
              {t("startNewCheck")}
            </button>
          </div>
        )}

        {appState.screen === "result" && appState.result.urgencyLevel === "RED" && (
          <div className="mx-auto max-w-xl">
            <ResultCard
              result={appState.result}
              history={history}
              handover={handover}
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
                handover={handover}
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
              <OfflineResultCard result={appState.result} reason={appState.reason} handover={handover} onReset={reset} />
            </div>
            <div className="lg:col-span-5 lg:sticky lg:top-20">{tools}</div>
          </div>
        )}

        {appState.screen === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <section
              aria-label={t("chatAria")}
              className="lg:col-span-7 card overflow-hidden flex flex-col h-[72dvh] min-h-[420px] lg:h-[640px]"
            >
              <ChatWindow history={history} loading={loading} />
              {chatNeedsSignal && (
                <div className="px-4 pb-3">
                  <button type="button" onClick={() => setAppState({ screen: "bodymap" })} className="btn btn-secondary w-full">
                    {t("useBodyMap")}
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
        {t("footer")}
      </footer>
    </div>
    </LangProvider>
  );
}
