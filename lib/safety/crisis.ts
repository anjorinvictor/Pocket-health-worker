/**
 * Pocket Health Worker — Self-Harm & Mental Crisis Filtering
 *
 * Provides a deterministic pre-AI safety barrier to detect expressions of self-harm,
 * suicidal ideation, or severe mental distress. Part of our core medical tech safety
 * architecture (SDG 3), redirecting in-crisis users to supportive resources immediately
 * without attempting standard medical triage.
 */

const NEGATIONS = [
  "don't want to die",
  "do not want to die",
  "dont want to die",
  "not suicidal",
  "don't want to hurt myself",
  "don't want to harm myself"
];

const CRISIS_PHRASES = [
  "kill myself",
  "killing myself",
  "kill me",
  "end my life",
  "ending my life",
  "take my life",
  "end it all",
  "want to die",
  "wanna die",
  "want to be dead",
  "wish i was dead",
  "wish i were dead",
  "better off dead",
  "no reason to live",
  "nothing to live for",
  "can't go on",
  "harm myself",
  "hurt myself",
  "self-harm",
  "self harm",
  "i'm suicidal",
  "im suicidal",
  "feel suicidal",
  "feeling suicidal"
];

/**
 * Deterministically checks user text for crisis signals. Employs case-insensitive
 * substring matching with negation guards. Runs BEFORE the AI.
 * @param text The latest input message typed by the user.
 * @returns Boolean representing if self-harm signatures were detected.
 */
export function isCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  if (NEGATIONS.some((n) => lower.includes(n))) return false;
  return CRISIS_PHRASES.some((p) => lower.includes(p));
}
