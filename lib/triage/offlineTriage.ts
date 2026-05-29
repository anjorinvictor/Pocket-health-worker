/**
 * Pocket Health Worker — Offline Deterministic Triage Engine
 *
 * A conservative, rules-based triage system that runs entirely in the browser
 * when the device has no internet connection. Uses structured Body Map inputs.
 * 
 * CORE ARCHITECTURE & HACKATHON ALIGNMENT:
 * - UN SDG 3: Delivers critical healthcare assessments in zero-connectivity environments.
 * - Safety-First: May only err toward sending the user to care. Never provides false reassurance.
 * - Offline-First / Deterministic: Bypasses the LLM entirely, relying on hardcoded pediatric and adult safety guardrails.
 */

import { checkRedFlags } from "@/lib/safety/redFlags";
import type { UrgencyLevel } from "@/types";

export interface OfflineTriageInput {
  region: string;
  symptoms: string[];
  severity: "Mild" | "Moderate" | "Severe";
  duration: "Today" | "Few days" | "Over a week";
  ageGroup: string;
  biologicalSex: string;
  comorbidities: string[];
  additionalText: string;
}

export interface OfflineTriageResult {
  urgencyLevel: UrgencyLevel;
  headline: string;
  details: string;
  warningSignsToWatch: string[];
  showEmergencyBridge: boolean;
}

/* ── High-risk region sets ─────────────────────────────────── */
const HIGH_RISK_REGIONS = new Set([
  "head", "chest", "abdomen", "neck",
]);

const LOW_RISK_REGIONS = new Set([
  "left_arm", "right_arm", "left_hand", "right_hand",
  "left_leg", "right_leg", "left_foot", "right_foot",
  "general", "upper_back", "lower_back",
]);

/* ── Vulnerable groups ─────────────────────────────────────── */
function isVulnerableAge(ageGroup: string): boolean {
  return [
    "Infant (0-1)",
    "Toddler (1-3)",
    "Senior (Over 60)",
  ].includes(ageGroup);
}

function isInfant(ageGroup: string): boolean {
  return ageGroup === "Infant (0-1)";
}

function isPregnant(sex: string): boolean {
  return sex === "Female (Pregnant)";
}

function isImmunocompromised(comorbidities: string[]): boolean {
  const flags = ["HIV/AIDS", "Cancer", "Autoimmune disease", "Immunosuppressant therapy"];
  return comorbidities.some((c) => flags.includes(c));
}

function hasConcerningComorbidity(comorbidities: string[]): boolean {
  const flags = [
    "Diabetes", "HIV/AIDS", "Cancer", "Heart disease",
    "Autoimmune disease", "Immunosuppressant therapy",
    "Sickle cell disease", "Hypertension", "Asthma/COPD",
  ];
  return comorbidities.some((c) => flags.includes(c));
}

/* ── Infant danger-sign symptoms ───────────────────────────── */
const INFANT_DANGER_SYMPTOMS = [
  "sunken fontanelle",
  "not feeding",
  "refusal to feed",
  "lethargy",
  "lethargic",
  "inconsolable crying",
  "fever",
  "high fever",
  "trouble breathing",
  "difficulty breathing",
  "grunting",
  "blue lips",
  "won't wake",
];

function infantHasDangerSign(symptoms: string[], additionalText: string): boolean {
  const allText = [...symptoms, additionalText].join(" ").toLowerCase();
  return INFANT_DANGER_SYMPTOMS.some((sign) => allText.includes(sign));
}

/* ── Main offline triage function ──────────────────────────── */
export function runOfflineTriage(input: OfflineTriageInput): OfflineTriageResult {
  const {
    region, symptoms, severity, duration,
    ageGroup, biologicalSex, comorbidities, additionalText,
  } = input;

  // Step 0: Run red-flag keyword check on all text content
  const allText = [...symptoms, additionalText].join(" ");
  const redFlag = checkRedFlags(allText);
  if (redFlag) {
    return {
      urgencyLevel: "RED",
      headline: "This may be an emergency — get help now.",
      details: `${redFlag.message} Go to the nearest General Hospital Emergency Department immediately. Do not wait.`,
      warningSignsToWatch: [],
      showEmergencyBridge: true,
    };
  }

  // ─── STEP 1: RED checks ───────────────────────────────────
  
  // 1a. Severe severity in a high-risk region
  if (severity === "Severe" && HIGH_RISK_REGIONS.has(region)) {
    return makeRED("Severe symptoms in a critical area require urgent medical evaluation.");
  }

  // 1b. Any severe symptom in a vulnerable group
  if (severity === "Severe" && (isVulnerableAge(ageGroup) || isPregnant(biologicalSex) || isImmunocompromised(comorbidities))) {
    return makeRED("Severe symptoms in a vulnerable individual require urgent medical evaluation.");
  }

  // 1c. Infant with fever or danger signs
  if (isInfant(ageGroup) && infantHasDangerSign(symptoms, additionalText)) {
    return makeRED("An infant showing these signs needs immediate medical attention. Do not delay.");
  }

  // ─── STEP 2: YELLOW checks (DEFAULT for non-GREEN) ────────

  // 2a. Moderate or severe severity → YELLOW
  if (severity === "Moderate" || severity === "Severe") {
    return makeYELLOW(region);
  }

  // 2b. Duration over a week → YELLOW
  if (duration === "Over a week") {
    return makeYELLOW(region);
  }

  // 2c. High-risk region even if mild → YELLOW
  if (HIGH_RISK_REGIONS.has(region)) {
    return makeYELLOW(region);
  }

  // 2d. Vulnerable group with any real symptom → YELLOW
  if (isVulnerableAge(ageGroup) || isPregnant(biologicalSex)) {
    return makeYELLOW(region);
  }

  // 2e. Concerning comorbidity → YELLOW
  if (hasConcerningComorbidity(comorbidities)) {
    return makeYELLOW(region);
  }

  // ─── STEP 3: GREEN (tightly gated) ────────────────────────
  // Only if ALL: mild severity, short duration, low-risk region,
  // not vulnerable, no concerning comorbidity
  if (
    severity === "Mild" &&
    (duration === "Today" || duration === "Few days") &&
    LOW_RISK_REGIONS.has(region) &&
    !isVulnerableAge(ageGroup) &&
    !isPregnant(biologicalSex) &&
    !hasConcerningComorbidity(comorbidities)
  ) {
    return {
      urgencyLevel: "GREEN",
      headline: "You can likely monitor this at home for now.",
      details:
        "Rest and take fluids as appropriate. Keep the area comfortable and avoid overexertion. Do NOT take any specific medications unless advised by a health worker.",
      warningSignsToWatch: [
        "Symptoms get worse or spread",
        "New symptoms appear (fever, swelling, breathing trouble)",
        "Symptoms last longer than expected",
        "You feel worried — trust your instincts",
      ],
      showEmergencyBridge: false,
    };
  }

  // ─── STEP 4: FALLBACK → YELLOW (safety default) ───────────
  return makeYELLOW(region);
}

/* ── Helper builders ───────────────────────────────────────── */

function makeRED(reason: string): OfflineTriageResult {
  return {
    urgencyLevel: "RED",
    headline: "This may be an emergency — get help now.",
    details: `${reason} Go to the nearest General Hospital Emergency Department immediately. Do not wait to see if it improves on its own.`,
    warningSignsToWatch: [],
    showEmergencyBridge: true,
  };
}

function makeYELLOW(region: string): OfflineTriageResult {
  const regionNote = HIGH_RISK_REGIONS.has(region)
    ? "Symptoms in this area can sometimes indicate something serious."
    : "While this may not be an emergency, a health professional should assess it.";

  return {
    urgencyLevel: "YELLOW",
    headline: "It's best to see a health worker soon.",
    details: `Visit a Primary Health Centre (PHC), clinic, or pharmacy within the next 1–2 days. ${regionNote} Write down your symptoms, when they started, and anything that makes them better or worse.`,
    warningSignsToWatch: [
      "Condition worsens quickly",
      "Fever develops or spikes",
      "New pain, swelling, or difficulty breathing appears",
      "You or the patient becomes confused or very drowsy",
      "Any emergency danger sign appears — go to hospital immediately",
    ],
    showEmergencyBridge: false,
  };
}
