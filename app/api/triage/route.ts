/**
 * Pocket Health Worker — Triage API Route
 *
 * One stateless triage request. Order of authority (highest first):
 *  1. Crisis check (self-harm)            → crisis screen, no AI.
 *  2. Red-flag phrases in anything typed  → emergency screen, no AI.
 *  3. Deterministic body-map rules        → a FLOOR: RED goes straight to emergency;
 *                                           otherwise the AI may raise urgency, never lower it.
 *  4. Gemini                              → wording, follow-up questions, possible higher urgency.
 *  5. Grounding check                     → reject answers that invent patient history.
 * If the AI is unavailable or fails, body-map requests get the deterministic result instead
 * of a generic answer. Nothing is stored.
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { isCrisis } from "@/lib/safety/crisis";
import { checkRedFlags } from "@/lib/safety/redFlags";
import { SYSTEM_PROMPT, SYSTEM_PROMPT_COMPACT, groundingCorrection } from "@/lib/triage/prompts";
import { parseGeminiResponse } from "@/lib/triage/schema";
import { raiseUrgency } from "@/lib/triage/urgency";
import { shouldForceResult } from "@/lib/triage/flow";
import { runOfflineTriage } from "@/lib/triage/offlineTriage";
import { findInventedConditions } from "@/lib/triage/grounding";
import { DURATIONS, SEVERITIES } from "@/lib/triage/options";
import { track } from "@/lib/telemetry";
import facilityGuidance from "@/data/facility-guidance.json";
import type { ChatTurn, StructuredInput, TriageResult, TriageResponse } from "@/types";

const GEMINI_MODEL = "gemini-2.5-flash";
const MAX_TURNS = 12;
const MAX_TURN_CHARS = 2000;

const FALLBACK_RESULT: TriageResult = {
  assessment:
    "I could not complete a full assessment just now. If you are worried about your health, please see a health worker.",
  urgencyLevel: "YELLOW",
  reasoning: "The assessment service did not respond properly, so we are defaulting to caution.",
  recommendedAction:
    "Visit a Primary Health Centre or clinic as a precaution. Do not delay if symptoms feel serious.",
  disclaimer:
    "This is informational guidance only, not a diagnosis or a substitute for professional medical care.",
};

function isStructuredInput(x: unknown): x is StructuredInput {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  const strArr = (v: unknown) => Array.isArray(v) && v.every((s) => typeof s === "string");
  return (
    typeof o.region === "string" &&
    strArr(o.symptoms) &&
    (SEVERITIES as readonly string[]).includes(o.severity as string) &&
    (DURATIONS as readonly string[]).includes(o.duration as string) &&
    typeof o.ageGroup === "string" &&
    typeof o.biologicalSex === "string" &&
    strArr(o.comorbidities) &&
    typeof o.additionalText === "string"
  );
}

function sanitizeHistory(raw: unknown): ChatTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (t): t is ChatTurn =>
        !!t && typeof t === "object" && (t.role === "user" || t.role === "assistant") && typeof t.content === "string"
    )
    .slice(-MAX_TURNS)
    .map((t) => ({ role: t.role, content: t.content.slice(0, MAX_TURN_CHARS) }));
}

/** Calls Gemini with retry on rate limits. Returns the raw JSON text. */
async function callGemini(
  client: GoogleGenAI,
  history: ChatTurn[],
  opts: { forceResult: boolean; dataSaver: boolean; correction?: string }
): Promise<string> {
  const contents = history.map((turn) => ({
    role: turn.role === "user" ? "user" : "model",
    parts: [{ text: turn.content }],
  }));

  let systemInstruction = opts.dataSaver ? SYSTEM_PROMPT_COMPACT : SYSTEM_PROMPT;
  if (opts.forceResult) {
    systemInstruction +=
      "\n\nYou have asked enough follow-up questions. Give the final assessment JSON now (not a followup). If unsure, choose the higher urgency.";
  }
  if (opts.correction) systemInstruction += `\n\n${opts.correction}`;

  let delay = 1000;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: opts.dataSaver ? 0.15 : 0.3,
          // Data Saver: no hidden "thinking" tokens and a hard cap on answer length.
          ...(opts.dataSaver ? { maxOutputTokens: 600, thinkingConfig: { thinkingBudget: 0 } } : {}),
        },
      });
      return response.text ?? "";
    } catch (err: unknown) {
      const isRateLimit =
        err instanceof Error && (err.message.includes("429") || err.message.toLowerCase().includes("rate limit"));
      if (isRateLimit && attempt < 2) {
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries exceeded");
}

export async function POST(req: NextRequest): Promise<NextResponse<TriageResponse>> {
  let structured: StructuredInput | null = null;
  try {
    const body = await req.json();
    const history = sanitizeHistory(body.history);
    const followupCount = typeof body.followupCount === "number" ? body.followupCount : 0;
    const dataSaver = body.dataSaver === true;
    structured = isStructuredInput(body.structured) ? body.structured : null;

    if (history.length === 0) {
      return NextResponse.json({ kind: "followup", question: "Please describe how you're feeling." });
    }

    const userTurns = history.filter((t) => t.role === "user").map((t) => t.content);
    const latestUserMessage = userTurns[userTurns.length - 1] ?? "";

    // 1. Crisis.
    if (isCrisis(latestUserMessage) || (structured && isCrisis(structured.additionalText))) {
      track({ name: "crisis_intercepted", mode: "online" });
      return NextResponse.json({ kind: "crisis" });
    }

    // 2. Red-flag phrases anywhere in what the person entered.
    const allUserText = userTurns.join(" ");
    const redFlag = checkRedFlags(allUserText);
    if (redFlag) {
      track({ name: "red_flag_detected", flag: redFlag.label, mode: "online" });
      return NextResponse.json({ kind: "emergency", matched: redFlag.label });
    }

    // 3. Deterministic floor from body-map answers.
    const floor = structured ? runOfflineTriage(structured) : null;
    if (floor?.urgencyLevel === "RED") {
      track({ name: "red_flag_detected", flag: "rules_floor", mode: "online" });
      return NextResponse.json({ kind: "emergency", matched: floor.details.split(". ")[0] });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set");
      return floor
        ? NextResponse.json({ kind: "rules", result: floor })
        : NextResponse.json({ kind: "result", result: FALLBACK_RESULT });
    }

    // 4. Gemini.
    const client = new GoogleGenAI({ apiKey });
    const forceResult = shouldForceResult({ stage: "followup", followupCount });
    let parsed = parseGeminiResponse(await callGemini(client, history, { forceResult, dataSaver }));

    // 5. Grounding: never let the AI assert history the person did not give. One retry.
    if (parsed.type === "result") {
      const invented = findInventedConditions(`${parsed.data.assessment} ${parsed.data.reasoning}`, allUserText);
      if (invented.length > 0) {
        console.warn("Grounding check rejected AI answer (invented):", invented.join(", "));
        parsed = parseGeminiResponse(
          await callGemini(client, history, { forceResult: true, dataSaver, correction: groundingCorrection(invented) })
        );
        if (
          parsed.type === "result" &&
          findInventedConditions(`${parsed.data.assessment} ${parsed.data.reasoning}`, allUserText).length > 0
        ) {
          return floor
            ? NextResponse.json({ kind: "rules", result: floor })
            : NextResponse.json({
                kind: "result",
                result: { ...FALLBACK_RESULT, urgencyLevel: raiseUrgency(parsed.data.urgencyLevel, "YELLOW") },
              });
        }
      }
    }

    if (parsed.type === "crisis") return NextResponse.json({ kind: "crisis" });
    if (parsed.type === "followup") return NextResponse.json({ kind: "followup", question: parsed.question });

    const result = parsed.data;
    // The AI may raise urgency above the deterministic floor, never lower it.
    const finalUrgency = floor ? raiseUrgency(result.urgencyLevel, floor.urgencyLevel) : result.urgencyLevel;
    result.urgencyLevel = finalUrgency;
    if (dataSaver && result.generalCauses) result.generalCauses = result.generalCauses.slice(0, 3);

    const guidance = facilityGuidance[finalUrgency];
    result.recommendedAction = `${guidance.headline}\n\n${guidance.steps
      .map((s, i) => `${i + 1}. ${s}`)
      .join("\n")}\n\n${guidance.escalateIf}`;

    track({ name: "triage_completed", urgency: finalUrgency, mode: "online" });
    return NextResponse.json({ kind: "result", result });
  } catch (err) {
    console.error("Triage route error:", err);
    track({ name: "triage_error", stage: "route" });
    // Body-map request: give the deterministic answer, never a generic one.
    if (structured) return NextResponse.json({ kind: "rules", result: runOfflineTriage(structured) });
    return NextResponse.json({ kind: "result", result: FALLBACK_RESULT });
  }
}
