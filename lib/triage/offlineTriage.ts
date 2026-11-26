/**
 * Pocket Health Worker — Deterministic Triage Engine (rules)
 *
 * A conservative, rules-based triage system. It runs:
 *  - in the browser when there is no signal (offline mode),
 *  - in the browser when Data Saver is on and the answer would be an emergency anyway,
 *  - on the server as a SAFETY FLOOR under every AI body-map result — the AI may raise
 *    urgency above this, never lower it,
 *  - as the fallback whenever the AI is unreachable or fails.
 *
 * It may only err toward sending the person to care. Never false reassurance.
 */

import { checkRedFlags } from "@/lib/safety/redFlags";
import { CONDITION, INFANT, PREGNANT } from "@/lib/triage/options";
import type { RulesResult, StructuredInput } from "@/types";

export type OfflineTriageInput = StructuredInput;
export type OfflineTriageResult = RulesResult;

/* ── Region sets ───────────────────────────────────────────── */
const HIGH_RISK_REGIONS = new Set(["head", "chest", "abdomen", "neck"]);

const LOW_RISK_REGIONS = new Set([
  "left_arm", "right_arm", "left_hand", "right_hand",
  "left_leg", "right_leg", "left_foot", "right_foot",
  "general", "upper_back", "lower_back",
]);

/* ── Vulnerable groups ─────────────────────────────────────── */
const VULNERABLE_AGES = new Set([INFANT, "Toddler (1-3)", "Senior (Over 60)"]);
const ADULT_AGES = new Set(["Adult (18-40)", "Middle-aged (41-60)"]);

const isVulnerableAge = (age: string) => VULNERABLE_AGES.has(age);
const isInfant = (age: string) => age === INFANT;
const isPregnant = (sex: string) => sex === PREGNANT;
const isImmunocompromised = (c: string[]) => c.includes(CONDITION.immune);
const hasConcerningComorbidity = (c: string[]) => c.length > 0;

/* ── Danger-sign vocabularies (lower-case substrings) ──────── */
const INFANT_DANGER_SIGNS = [
  "sunken fontanelle", "not feeding", "refusal to feed", "lethargy", "lethargic",
  "inconsolable crying", "fever", "trouble breathing", "difficulty breathing",
  "breathing difficulty", "grunting", "blue lips", "won't wake", "stiff neck",
  "non-blanching rash", "vomits everything",
];

/** Pregnancy danger signs (WHO/FMOH antenatal danger signs, simplified). */
const PREGNANCY_DANGER_SIGNS = [
  "bleed", "blood", "vision issues", "blurring", "blurred", "severe headache",
  "convuls", "seizure", "fits", "water broke", "baby not moving", "swollen face",
  "breathing difficulty", "high fever",
];

const textOf = (symptoms: string[], additionalText: string) =>
  [...symptoms, additionalText].join(" ").toLowerCase();

export interface RulesOptions {
  /**
   * true (default, offline / fallback): "Severe" in a critical area or a vulnerable person is
   * an emergency, because there is no AI to ask follow-up questions.
   * false (online floor, owner decision 2026-11-26): severity alone is at least YELLOW and the AI
   * decides whether it is an emergency. Danger signs are RED in both modes.
   */
  severityEscalates?: boolean;
}

/* ── Main entry point ──────────────────────────────────────── */
export function runOfflineTriage(input: OfflineTriageInput, opts: RulesOptions = {}): OfflineTriageResult {
  const severityEscalates = opts.severityEscalates ?? true;
  const { region, symptoms, severity, duration, ageGroup, biologicalSex, comorbidities, additionalText } = input;
  const allText = textOf(symptoms, additionalText);

  // 0. Hard red-flag phrases in anything the person entered.
  const redFlag = checkRedFlags([...symptoms, additionalText].join(" "));
  if (redFlag) {
    return makeRED(redFlag.message);
  }

  // 1a. Infant with fever or any danger sign.
  if (isInfant(ageGroup) && INFANT_DANGER_SIGNS.some((s) => allText.includes(s))) {
    return makeRED("A baby under one year with these signs needs a health worker immediately.");
  }

  // 1b. Pregnancy danger signs.
  if (isPregnant(biologicalSex) && PREGNANCY_DANGER_SIGNS.some((s) => allText.includes(s))) {
    return makeRED("These are danger signs in pregnancy and need urgent care for mother and baby.");
  }

  // 1c. Severe symptoms in a critical area.
  if (severity === "Severe" && HIGH_RISK_REGIONS.has(region) && severityEscalates) {
    return makeRED("Severe symptoms in this part of the body need urgent medical evaluation.");
  }

  // 1d. Severe symptoms in a vulnerable person.
  if (
    severity === "Severe" &&
    severityEscalates &&
    (isVulnerableAge(ageGroup) || isPregnant(biologicalSex) || isImmunocompromised(comorbidities))
  ) {
    return makeRED("Severe symptoms in a baby, older person, pregnant woman or someone with a weak immune system need urgent evaluation.");
  }

  // 2. Simple headache in a healthy adult (owner-approved home-care rule, 2026-11-26).
  //    Headache must be the ONLY symptom; any other head symptom keeps it at YELLOW+.
  if (
    region === "head" &&
    symptoms.length === 1 &&
    symptoms[0] === "Headache" &&
    severity === "Mild" &&
    (duration === "Today" || duration === "Few days") &&
    ADULT_AGES.has(ageGroup) &&
    !isPregnant(biologicalSex) &&
    !hasConcerningComorbidity(comorbidities)
  ) {
    return makeGREEN([
      "Headache becomes severe or is the worst you have ever had",
      "Fever, stiff neck, confusion, or vomiting appears",
      "Blurred vision, weakness, or trouble speaking",
      "It lasts more than 3 days or keeps coming back",
    ]);
  }

  // 3. YELLOW checks.
  if (severity === "Moderate" || severity === "Severe") return makeYELLOW(region);
  if (duration === "Over a week") return makeYELLOW(region);
  if (HIGH_RISK_REGIONS.has(region)) return makeYELLOW(region);
  if (isVulnerableAge(ageGroup) || isPregnant(biologicalSex)) return makeYELLOW(region);
  if (hasConcerningComorbidity(comorbidities)) return makeYELLOW(region);

  // 4. GREEN — tightly gated.
  if (severity === "Mild" && LOW_RISK_REGIONS.has(region)) {
    return makeGREEN([
      "Symptoms get worse or spread",
      "New symptoms appear (fever, swelling, breathing trouble)",
      "Symptoms last longer than expected",
      "You feel worried — trust your instincts",
    ]);
  }

  // 5. Safety default.
  return makeYELLOW(region);
}

/* ── Result builders ───────────────────────────────────────── */

function makeRED(reason: string): OfflineTriageResult {
  return {
    urgencyLevel: "RED",
    headline: "This may be an emergency. Get help now.",
    details: `${reason} Go to the nearest hospital emergency department now. Do not wait to see if it gets better.`,
    warningSignsToWatch: [],
    showEmergencyBridge: true,
  };
}

function makeYELLOW(region: string): OfflineTriageResult {
  const regionNote = HIGH_RISK_REGIONS.has(region)
    ? "Symptoms in this part of the body can sometimes be serious."
    : "It may not be an emergency, but a health worker should check it.";
  return {
    urgencyLevel: "YELLOW",
    headline: "See a health worker within 1–2 days.",
    details: `Visit a Primary Health Centre (PHC), clinic or hospital within the next 1–2 days. ${regionNote} Write down your symptoms, when they started, and what makes them better or worse.`,
    warningSignsToWatch: [
      "It gets worse quickly",
      "A fever starts or rises",
      "New pain, swelling, or difficulty breathing",
      "Confusion or unusual sleepiness",
      "Any danger sign — go to hospital immediately",
    ],
    showEmergencyBridge: false,
  };
}

function makeGREEN(watchFor: string[]): OfflineTriageResult {
  return {
    urgencyLevel: "GREEN",
    headline: "You can likely look after this at home for now.",
    details:
      "Rest, drink plenty of water, and keep an eye on how you feel. Do not start any medicine unless a health worker or pharmacist advises it.",
    warningSignsToWatch: watchFor,
    showEmergencyBridge: false,
  };
}
