/**
 * Pocket Health Worker — Anonymous, Privacy-Preserving Telemetry
 *
 * A tiny, dependency-free event hook so the team can measure safety and reliability
 * (how often red flags fire, online vs offline usage, error rates) WITHOUT breaking the
 * app's privacy promise.
 *
 * Hard rules:
 *  - NEVER pass user symptom text, chat content, free-text, or any PII into an event.
 *    Only categorical signals (urgency level, red-flag *label*, online/offline, error
 *    stage) are allowed — see the TelemetryEvent union below.
 *  - Off by default. It only emits when explicitly enabled via env, and it can never
 *    throw into the request/UI path.
 *
 * Enable by setting (e.g. on your host):
 *   - Server:  TELEMETRY_ENABLED=1
 *   - Client:  NEXT_PUBLIC_TELEMETRY_ENABLED=1
 *
 * To ship real analytics, replace the `sink()` body with a call into your collector
 * (Sentry, PostHog, a /api/events route, etc.). The event shape is intentionally PII-free.
 */

import type { UrgencyLevel } from "@/types";

type Surface = "online" | "offline";

export type TelemetryEvent =
  | { name: "triage_completed"; urgency: UrgencyLevel; mode: Surface }
  | { name: "red_flag_detected"; flag: string; mode: Surface }
  | { name: "crisis_intercepted"; mode: Surface }
  | { name: "triage_error"; stage: string };

function isEnabled(): boolean {
  const flag =
    typeof window === "undefined"
      ? process.env.TELEMETRY_ENABLED
      : process.env.NEXT_PUBLIC_TELEMETRY_ENABLED;
  return flag === "1" || flag === "true";
}

function sink(payload: Record<string, unknown>): void {
  // Default sink: structured log only. Swap for Sentry/PostHog/your collector.
  // Keep this PII-free — do not extend `payload` with user content upstream.
  console.info("[telemetry]", JSON.stringify(payload));
}

/**
 * Records an anonymous, categorical event. Safe to call from server or client.
 * Never throws and is a no-op unless telemetry is explicitly enabled via env.
 */
export function track(event: TelemetryEvent): void {
  try {
    if (!isEnabled()) return;
    sink({
      ...event,
      surface: typeof window === "undefined" ? "server" : "client",
      ts: new Date().toISOString(),
    });
  } catch {
    // Telemetry must never affect the user-facing flow.
  }
}
