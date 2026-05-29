/**
 * Pocket Health Worker — Main Client Coordinator (Premium Redesign)
 *
 * Implements the flagship responsive Dual-Pane Medical Cockpit. Renders local utility widgets 
 * (NAFDAC Anti-Counterfeit, low-bandwidth saver, PHC directory) in the sidebar on laptop viewports,
 * while managing active symptom collection threads and diagnostic dashboard states.
 * Adapts instantly to standard stacked layouts on mobile viewports with zero emojis (UN SDG 3).
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import type { ChatTurn, TriageResponse, TriageResult } from "@/types";
import WelcomeScreen from "@/components/WelcomeScreen";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import ResultCard from "@/components/ResultCard";
import OfflineResultCard from "@/components/OfflineResultCard";
import CrisisSupport from "@/components/CrisisSupport";
import EmergencyBanner from "@/components/EmergencyBanner";
import ClinicalSidebar from "@/components/ClinicalSidebar";
import BodyMap from "@/components/BodyMap";
import type { BodyMapStructuredData } from "@/components/BodyMap";
import { isCrisis } from "@/lib/safety/crisis";
import { checkRedFlags } from "@/lib/safety/redFlags";
import { runOfflineTriage } from "@/lib/triage/offlineTriage";
import type { OfflineTriageResult } from "@/lib/triage/offlineTriage";

type AppState =
  | { screen: "welcome" }
  | { screen: "chat" }
  | { screen: "bodymap" }
  | { screen: "result"; result: TriageResult }
  | { screen: "offlineResult"; result: OfflineTriageResult }
  | { screen: "crisis" }
  | { screen: "emergency"; message: string };

export default function Home() {
  const [appState, setAppState] = useState<AppState>({ screen: "welcome" });
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [followupCount, setFollowupCount] = useState(0);
  const [dataSaver, setDataSaver] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Initial check
    setIsOffline(!navigator.onLine);

    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('SW registered: ', registration.scope);
      }).catch((err) => {
        console.log('SW registration failed: ', err);
      });
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    // PWA Install Prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  /**
   * Resets all chat turns and state counters back to the initial Welcome Screen.
   */
  const reset = useCallback(() => {
    setAppState({ screen: "welcome" });
    setHistory([]);
    setLoading(false);
    setFollowupCount(0);
  }, []);

  /**
   * Begins the triage check by shifting the view state from Welcome to Chat.
   */
  const handleStart = useCallback(() => {
    setAppState({ screen: "chat" });
  }, []);

  /**
   * Compiles selections from the interactive Body Map and forwards them to the API handler,
   * transitioning to the Chat Screen to display active triage assessments.
   */
  const handleBodyMapSubmit = useCallback(
    async (formattedText: string, ageGroup: string, structuredData: BodyMapStructuredData) => {
      setLoading(true);

      // OFFLINE: Run local deterministic triage engine
      if (isOffline || !navigator.onLine) {
        // Still run crisis check on free-text
        if (isCrisis(structuredData.additionalText)) {
          setAppState({ screen: "crisis" });
          setLoading(false);
          return;
        }

        // Run the offline triage engine with structured data
        const offlineResult = runOfflineTriage({
          region: structuredData.region,
          symptoms: structuredData.symptoms,
          severity: structuredData.severity,
          duration: structuredData.duration,
          ageGroup: structuredData.ageGroup,
          biologicalSex: structuredData.biologicalSex,
          comorbidities: structuredData.comorbidities,
          additionalText: structuredData.additionalText,
        });

        setAppState({ screen: "offlineResult", result: offlineResult });
        setLoading(false);
        return;
      }

      // ONLINE: Use AI triage as normal
      setAppState({ screen: "chat" });
      const userTurn: ChatTurn = { role: "user", content: formattedText };
      const newHistory = [userTurn];
      setHistory(newHistory);

      try {
        const res = await fetch("/api/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ history: newHistory, followupCount: 0, dataSaver }),
        });

        if (!res.ok) throw new Error(`Server error ${res.status}`);

        const data: TriageResponse = await res.json();

        switch (data.kind) {
          case "crisis":
            setAppState({ screen: "crisis" });
            break;

          case "emergency":
            setAppState({ screen: "emergency", message: data.matched });
            break;

          case "followup": {
            const assistantTurn: ChatTurn = { role: "assistant", content: data.question };
            setHistory((prev) => [...prev, assistantTurn]);
            setFollowupCount(1);
            break;
          }

          case "result":
            setAppState({ screen: "result", result: data.result });
            break;
        }
      } catch {
        const errorTurn: ChatTurn = {
          role: "assistant",
          content:
            "Sorry, something went wrong. If you're worried about your health, please visit a nearby clinic or health worker.",
        };
        setHistory((prev) => [...prev, errorTurn]);
      } finally {
        setLoading(false);
      }
    },
    [dataSaver, isOffline]
  );

  /**
   * Handles user message submissions, fetching stateless results from the server API.
   * Runs local safety checkers on inputs and formats the response state.
   */
  const handleSend = useCallback(
    async (text: string) => {
      const userTurn: ChatTurn = { role: "user", content: text };
      const newHistory = [...history, userTurn];
      setHistory(newHistory);
      setLoading(true);

      // Local offline check BEFORE hitting API
      if (isOffline || !navigator.onLine) {
        const allText = newHistory.map(t => t.content).join(" ");
        if (isCrisis(text)) {
          setAppState({ screen: "crisis" });
          setLoading(false);
          return;
        }
        const redFlag = checkRedFlags(allText);
        if (redFlag) {
          setAppState({ screen: "emergency", message: redFlag.label });
          setLoading(false);
          return;
        }
        
        const errorTurn: ChatTurn = {
          role: "assistant",
          content: "You're currently offline. I cannot provide full AI triage analysis without an internet connection, but please review the Clinical Sidebar to find your nearest health facility.",
        };
        setHistory((prev) => [...prev, errorTurn]);
        setLoading(false);
        return;
      }

      try {
        const historyToUpload = dataSaver && newHistory.length > 3
          ? newHistory.slice(-3)
          : newHistory;

        const res = await fetch("/api/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ history: historyToUpload, followupCount, dataSaver }),
        });

        if (!res.ok) throw new Error(`Server error ${res.status}`);

        const data: TriageResponse = await res.json();

        switch (data.kind) {
          case "crisis":
            setAppState({ screen: "crisis" });
            break;

          case "emergency":
            setAppState({ screen: "emergency", message: data.matched });
            break;

          case "followup": {
            const assistantTurn: ChatTurn = { role: "assistant", content: data.question };
            setHistory((prev) => [...prev, assistantTurn]);
            setFollowupCount((c) => c + 1);
            break;
          }

          case "result":
            setAppState({ screen: "result", result: data.result });
            break;
        }
      } catch {
        const errorTurn: ChatTurn = {
          role: "assistant",
          content:
            "Sorry, something went wrong. If you're worried about your health, please visit a nearby clinic or health worker.",
        };
        setHistory((prev) => [...prev, errorTurn]);
      } finally {
        setLoading(false);
      }
    },
    [history, followupCount, dataSaver, isOffline]
  );

  return (
    <div className="flex-grow flex flex-col bg-gradient-to-tr from-[#faf9f6] via-slate-50 to-teal-50/15 min-h-screen text-slate-800">
      {/* Luxury Clinical Header Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-100/60 px-6 py-4 flex items-center justify-between shadow-sm shadow-slate-100/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-emerald-600/10">
            PH
          </div>
          <div>
            <h1 className="text-xs font-black text-slate-800 tracking-wider uppercase leading-none">
              Pocket Health Worker
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Stateless Safety Triage</span>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm animate-pulse"
            >
              Install App
            </button>
          )}
          {appState.screen !== "welcome" && (
            <button
              onClick={reset}
              className="px-3.5 py-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Return to Home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Home
            </button>
          )}
        </div>
      </header>

      {/* Honest Offline Banner */}
      {isOffline && (
        <div className="w-full bg-slate-800 text-white text-xs font-medium px-4 py-3 flex items-center justify-center gap-2 z-40 relative">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-slate-400">
            <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v9a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM6.166 5.106a.75.75 0 0 1 0 1.06 8.25 8.25 0 1 0 11.668 0 .75.75 0 1 1 1.06-1.06c3.808 3.807 3.808 9.98 0 13.788-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
          You're offline. Full AI triage needs an internet connection — but you can still find your nearest clinic below, and this app will still flag emergency danger signs.
        </div>
      )}

      {/* Main Responsive Split Cockpit Body */}
      <main className="flex-grow flex flex-col w-full max-w-6xl mx-auto px-6 py-6 md:py-8">
        {appState.screen === "welcome" && (
          <WelcomeScreen
            onSelectMode={(mode) => setAppState({ screen: mode })}
            onCrisisClick={() => setAppState({ screen: "crisis" })}
          />
        )}

        {appState.screen === "bodymap" && (
          <BodyMap onSubmit={handleBodyMapSubmit} onBack={reset} />
        )}

        {appState.screen === "crisis" && (
          <div className="flex-1 flex flex-col justify-center py-4">
            <CrisisSupport onReset={reset} />
          </div>
        )}

        {appState.screen === "emergency" && (
          <div className="flex-1 overflow-y-auto py-4">
            <div className="max-w-lg mx-auto px-4 py-6 space-y-4 animate-scale-up">
              <EmergencyBanner message={appState.message} />
              
              <button
                onClick={reset}
                className="w-full py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-600 font-semibold text-sm hover:bg-slate-50 active:scale-[0.99] transform transition-all duration-200 cursor-pointer shadow-sm text-center"
              >
                Return to Home Screen
              </button>
            </div>
          </div>
        )}

        {appState.screen === "result" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
            <div className="lg:col-span-8">
              <ResultCard
                result={appState.result}
                history={history}
                onReset={reset}
                onContinue={() => setAppState({ screen: "chat" })}
              />
            </div>
            <div className="lg:col-span-4 hidden lg:block sticky top-24">
              <ClinicalSidebar dataSaver={dataSaver} onToggleDataSaver={setDataSaver} />
            </div>
          </div>
        )}

        {appState.screen === "offlineResult" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
            <div className="lg:col-span-8">
              <OfflineResultCard
                result={appState.result}
                onReset={reset}
              />
            </div>
            <div className="lg:col-span-4 hidden lg:block sticky top-24">
              <ClinicalSidebar dataSaver={dataSaver} onToggleDataSaver={setDataSaver} />
            </div>
          </div>
        )}

        {appState.screen === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
            {/* Left side: local clinical helpers */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <ClinicalSidebar dataSaver={dataSaver} onToggleDataSaver={setDataSaver} />
            </div>
            
            {/* Right side: chat window */}
            <div className="lg:col-span-8 flex flex-col bg-white border border-slate-100 shadow-xl shadow-slate-200/30 rounded-3xl overflow-hidden h-[650px] animate-scale-up">
              <ChatWindow history={history} loading={loading} />
              <ChatInput onSend={handleSend} disabled={loading} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
