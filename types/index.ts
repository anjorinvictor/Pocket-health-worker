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
