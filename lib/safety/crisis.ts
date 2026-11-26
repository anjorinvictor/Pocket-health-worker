/**
 * Pocket Health Worker — Self-Harm & Mental Crisis Filtering
 *
 * Provides a deterministic pre-AI safety barrier to detect expressions of self-harm,
 * suicidal ideation, or severe mental distress. Part of our core medical tech safety
 * architecture (SDG 3), redirecting in-crisis users to supportive resources immediately
 * without attempting standard medical triage.
 *
 * Matching is intentionally conservative and high-precision: only clear expressions of
 * intent to die or self-harm trigger the crisis flow, so we never block someone in
 * physical pain from getting medical triage. Phrases cover both standard English and
 * common Nigerian English / Pidgin ("wan die", "kee myself", "i don tire for this life").
 */

import { normalizeText } from "./normalize";

const NEGATIONS = [
  "don't want to die",
  "do not want to die",
  "dont want to die",
  "not suicidal",
  "don't want to hurt myself",
  "don't want to harm myself",
  "don't want to kill myself",
  "do not want to kill myself",
  // Pidgin / Nigerian English negations ("no wan" = "don't want to")
  "no wan die",
  "i no wan die",
  "no wan kill myself",
  "no wan kee myself",
  "no wan harm myself",
  "no wan hurt myself",
];

const CRISIS_PHRASES = [
  // Standard English
  "kill myself",
  "killing myself",
  "kill me",
  "end my life",
  "ending my life",
  "end my own life",
  "take my life",
  "take my own life",
  "end it all",
  "commit suicide",
  "committing suicide",
  "want to die",
  "wanna die",
  "want to be dead",
  "wish i was dead",
  "wish i were dead",
  "better off dead",
  "no reason to live",
  "nothing to live for",
  "no point living",
  "no point in living",
  "give up on life",
  "tired of living",
  "tired of life",
  "can't go on",
  "harm myself",
  "hurt myself",
  "overdose myself",
  "self-harm",
  "self harm",
  "i'm suicidal",
  "im suicidal",
  "feel suicidal",
  "feeling suicidal",
  // Nigerian English / Pidgin
  "wan die",
  "i wan die",
  "i go die by myself",
  "wan kill myself",
  "i wan kill myself",
  "i go kill myself",
  "kee myself",
  "wan kee myself",
  "i wan kee myself",
  "i go kee myself",
  "make i die",
  "make i just die",
  "i for just die",
  "i don tire for this life",
  "i don tire for life",
  "tired of this life",
];

/**
 * Deterministically checks user text for crisis signals. Employs normalized,
 * case-insensitive substring matching with negation guards. Runs BEFORE the AI.
 * @param text The latest input message typed by the user.
 * @returns Boolean representing if self-harm signatures were detected.
 */
export function isCrisis(text: string): boolean {
  const normalized = normalizeText(text);
  if (NEGATIONS.some((n) => normalized.includes(n))) return false;
  return CRISIS_PHRASES.some((p) => normalized.includes(p));
}
