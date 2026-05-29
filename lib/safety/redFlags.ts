/**
 * Pocket Health Worker — Red-Flag Safety Checks
 *
 * Provides a deterministic, dictionary-based danger-sign detector that processes symptom 
 * input against clinical emergency indicators. Part of the core medical safety guidelines (SDG 3),
 * guaranteeing that life-threatening symptoms trigger an immediate RED escalation before AI analysis.
 */

import redFlagsData from "@/data/red-flags.json";
import type { RedFlag } from "@/types";

const RED_FLAGS: RedFlag[] = redFlagsData as RedFlag[];

/**
 * Scans user symptom text for well-known emergency danger signs (e.g. trouble
 * breathing, chest pain, stroke signs). Runs BEFORE the AI so life-threatening
 * symptoms always trigger an immediate escalation, independent of the model's
 * judgment — a core safety guarantee of Pocket Health Worker.
 * @param userText Combined symptom description from the user's conversation history.
 * @returns The first matching red flag object, or null if none are detected.
 */
export function checkRedFlags(userText: string): RedFlag | null {
  const lower = userText.toLowerCase();
  for (const flag of RED_FLAGS) {
    for (const keyword of flag.matchKeywords) {
      if (lower.includes(keyword.toLowerCase())) {
        return flag;
      }
    }
  }
  return null;
}

