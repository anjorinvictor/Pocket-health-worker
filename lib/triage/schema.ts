/**
 * Pocket Health Worker — Data Schemas & Validation
 *
 * Defines the structured JSON responses expected from the AI agent and implements runtime 
 * parsing and validation validators to protect against malformed JSON or prompt injections, 
 * guaranteeing type safety and client resilience (SDG 3).
 */

import type { TriageResult, UrgencyLevel } from "@/types";

const URGENCY_LEVELS: UrgencyLevel[] = ["GREEN", "YELLOW", "RED"];

/**
 * Validates a parsed JSON object against the structural requirements of TriageResult.
 * Throws a detailed error if any vital field is missing, empty, or has an incorrect type.
 * @param json Deserialized object to validate.
 * @returns A validated, fully typed TriageResult.
 */
export function validateTriageResult(json: unknown): TriageResult {
  if (!json || typeof json !== "object") {
    throw new Error("Invalid triage result: expected an object");
  }

  const obj = json as Record<string, unknown>;

  if (typeof obj.assessment !== "string" || !obj.assessment.trim()) {
    throw new Error("Invalid triage result: missing or empty 'assessment'");
  }
  if (!URGENCY_LEVELS.includes(obj.urgencyLevel as UrgencyLevel)) {
    throw new Error(
      `Invalid triage result: urgencyLevel must be GREEN, YELLOW, or RED, got '${obj.urgencyLevel}'`
    );
  }
  if (typeof obj.reasoning !== "string" || !obj.reasoning.trim()) {
    throw new Error("Invalid triage result: missing or empty 'reasoning'");
  }
  if (typeof obj.recommendedAction !== "string" || !obj.recommendedAction.trim()) {
    throw new Error("Invalid triage result: missing or empty 'recommendedAction'");
  }
  if (typeof obj.disclaimer !== "string" || !obj.disclaimer.trim()) {
    throw new Error("Invalid triage result: missing or empty 'disclaimer'");
  }

  const result: TriageResult = {
    assessment: obj.assessment,
    urgencyLevel: obj.urgencyLevel as UrgencyLevel,
    reasoning: obj.reasoning,
    recommendedAction: obj.recommendedAction,
    disclaimer: obj.disclaimer,
  };

  if (obj.generalCauses !== undefined) {
    if (
      !Array.isArray(obj.generalCauses) ||
      !obj.generalCauses.every((c) => typeof c === "string")
    ) {
      throw new Error("Invalid triage result: 'generalCauses' must be an array of strings");
    }
    result.generalCauses = obj.generalCauses as string[];
  }

  return result;
}

/**
 * Sanitizes the raw LLM string by trimming whitespace, stripping Markdown JSON code block wrappers,
 * and carving out the root JSON object starting with '{' and ending with '}'.
 * @param raw Raw text response from the Gemini generation stream.
 * @returns Cleaned JSON string ready for parsing.
 */
export function cleanJson(raw: string): string {
  let s = raw.trim();
  // strip ```json ... ``` or ``` ... ``` fences
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  // fallback: if surrounding prose remains, extract the outermost JSON object
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) s = s.slice(first, last + 1);
  return s;
}

/**
 * Orchestrates the cleanup, deserialization, and structural validation of raw Gemini generation streams,
 * separating completed assessments from intermediate clarifying questions.
 * @param raw Raw string from the AI stream.
 * @returns Structured result block containing the validated data or the parsed followup question.
 */
export function parseGeminiResponse(raw: string):
  | { type: "result"; data: TriageResult }
  | { type: "followup"; question: string }
  | { type: "crisis" } {
  let parsed: unknown;
  try {
    const cleaned = cleanJson(raw);
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Gemini returned non-JSON output");
  }

  const obj = parsed as Record<string, unknown>;

  if (obj.crisis === true) {
    return { type: "crisis" };
  }

  if (typeof obj.followup === "string" && obj.followup.trim()) {
    return { type: "followup", question: obj.followup };
  }

  const result = validateTriageResult(parsed);
  return { type: "result", data: result };
}

