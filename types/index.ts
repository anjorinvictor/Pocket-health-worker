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

export type TriageResponse =
  | { kind: "followup"; question: string }
  | { kind: "result"; result: TriageResult }
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
  matchKeywords: string[];
  message: string;
}
