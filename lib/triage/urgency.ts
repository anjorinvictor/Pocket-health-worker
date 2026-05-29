/**
 * Pocket Health Worker — Urgency Classification Guidelines
 *
 * Defines the numerical hierarchy of triage urgency levels (GREEN, YELLOW, RED)
 * and implements a safety-conservative merge policy, ensuring that matched red flags 
 * always override AI findings and dictate immediate emergency care pathways (SDG 3).
 */

import type { UrgencyLevel } from "@/types";

export const URGENCY_ORDER: Record<UrgencyLevel, number> = {
  GREEN: 0,
  YELLOW: 1,
  RED: 2,
};

/**
 * Merges the AI-determined urgency level with the history danger-sign result.
 * If any deterministic red flags are matched, the final level is escalated to RED,
 * ensuring clinical safety boundaries are never violated.
 * @param aiLevel UrgencyLevel calculated by the Gemini prompt.
 * @param redFlagMatched Boolean flag indicating if clinical red flags were detected in history.
 * @returns Combined, safety-maximized UrgencyLevel.
 */
export function mergeUrgency(
  aiLevel: UrgencyLevel,
  redFlagMatched: boolean
): UrgencyLevel {
  if (redFlagMatched) return "RED";
  return aiLevel;
}

/**
 * Compares two urgency levels and returns the highest level, representing a 
 * highly conservative clinical escalation policy.
 * @param a UrgencyLevel A.
 * @param b UrgencyLevel B.
 * @returns The higher of the two UrgencyLevels.
 */
export function raiseUrgency(a: UrgencyLevel, b: UrgencyLevel): UrgencyLevel {
  return URGENCY_ORDER[a] >= URGENCY_ORDER[b] ? a : b;
}

