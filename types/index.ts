/**
 * Pocket Health Worker — Core Type Definitions
 *
 * Establishes the TypeScript interfaces and types that enforce strict data boundaries
 * across the application. Ensures that AI payloads, triage urgency levels, and chat
 * history conform to expected shapes, guaranteeing runtime stability and clinical safety (SDG 3).
 */

export type Role = "user" | "assistant";

export interface ChatTurn {
  role: Role;
  content: string;
}

export type UrgencyLevel = "GREEN" | "YELLOW" | "RED";

export interface TriageResult {
  assessment: string;
  urgencyLevel: UrgencyLevel;
  reasoning: string;
  recommendedAction: string;
  generalCauses?: string[];
  disclaimer: string;
}

/**
 * Structured answers from the body map. The same shape feeds the offline engine on the
 * phone and the deterministic safety floor on the server, so both paths agree.
 */
export interface StructuredInput {
  region: string;
  symptoms: string[];
  severity: "Mild" | "Moderate" | "Severe";
  duration: "Today" | "Few days" | "Over a week";
  ageGroup: string;
  biologicalSex: string;
  comorbidities: string[];
  additionalText: string;
}

/** Result of the deterministic rules engine (used offline, in Data Saver, and as AI fallback). */
export interface RulesResult {
  urgencyLevel: UrgencyLevel;
  headline: string;
  details: string;
  warningSignsToWatch: string[];
  showEmergencyBridge: boolean;
}

export type TriageResponse =
  | { kind: "followup"; question: string }
  | { kind: "result"; result: TriageResult }
  /** AI unavailable: the server ran the deterministic rules instead. */
  | { kind: "rules"; result: RulesResult }
  | { kind: "crisis" }
  | { kind: "emergency"; matched: string };

export interface FacilityGuidance {
  headline: string;
  steps: string[];
  escalateIf: string;
}

export interface RedFlag {
  id: string;
  label: string;
  /** Any one of these phrases (normalized substring) triggers the flag. */
  matchKeywords: string[];
  /** Each inner list triggers the flag when ALL its terms appear, e.g. ["baby", "fever"]. */
  matchAll?: string[][];
  message: string;
}
