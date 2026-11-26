/**
 * Pocket Health Worker — Red-Flag Safety Checks
 *
 * Deterministic, dictionary-based danger-sign detector. Runs BEFORE the AI (online) and
 * inside the offline engine, so life-threatening symptoms always escalate to RED
 * regardless of what the model says.
 *
 * Two kinds of rule live in data/red-flags.json:
 *  - matchKeywords: any single phrase triggers the flag ("chest pain").
 *  - matchAll: every term in a group must appear somewhere in the text
 *    (["baby", "fever"] catches "my 8 month old baby has high fever").
 */

import redFlagsData from "@/data/red-flags.json";
import type { RedFlag } from "@/types";
import { normalizeText } from "./normalize";

const RED_FLAGS: RedFlag[] = redFlagsData as RedFlag[];

/**
 * Scans user symptom text for emergency danger signs.
 * @param userText Combined symptom description from the user's conversation history.
 * @returns The first matching red flag, or null if none are detected.
 */
export function checkRedFlags(userText: string): RedFlag | null {
  const normalized = normalizeText(userText);
  // "Female (Not Pregnant)" contains the word "pregnant"; remove negated pregnancy so
  // combination rules like ["pregnant", "bleed"] only fire for actual pregnancy.
  const forCombos = normalized.replace(/\b(not|non)[\s-]pregnant\b/g, " ");
  for (const flag of RED_FLAGS) {
    if (flag.matchKeywords.some((k) => normalized.includes(normalizeText(k)))) {
      return flag;
    }
    if (flag.matchAll?.some((group) => group.every((t) => forCombos.includes(normalizeText(t))))) {
      return flag;
    }
  }
  return null;
}
