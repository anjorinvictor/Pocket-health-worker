/**
 * Pocket Health Worker — Triage API Route
 *
 * Orchestrates one stateless symptom-triage request in a safety-first order:
 *  1. Crisis (self-harm) check → routes to support, never medical triage.
 *  2. Deterministic red-flag check across the whole conversation → forces an
 *     emergency response for danger signs, independent of the AI.
 *  3. Gemini reasoning (JSON mode + 429 retry) for non-emergency cases.
 *
 * Advances UN SDG 3 (Good Health & Well-being) by giving people without easy
 * access to a doctor a fast, conservative "what should I do next?" assessment.
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { isCrisis } from "@/lib/safety/crisis";
import { checkRedFlags } from "@/lib/safety/redFlags";
import { SYSTEM_PROMPT } from "@/lib/triage/prompts";
import { parseGeminiResponse } from "@/lib/triage/schema";
import { mergeUrgency } from "@/lib/triage/urgency";
import { shouldForceResult } from "@/lib/triage/flow";
import facilityGuidance from "@/data/facility-guidance.json";
import type { ChatTurn, TriageResult, TriageResponse } from "@/types";

const GEMINI_MODEL = "gemini-2.5-flash";

const FALLBACK_RESULT: TriageResult = {
  assessment:
    "I was unable to complete an assessment at this time. If you are worried about your health, please seek care from a health worker.",
  urgencyLevel: "YELLOW",
  reasoning: "Unable to process your symptoms properly — defaulting to caution.",
  recommendedAction:
    "Visit a Primary Health Centre or clinic as a precaution. Do not delay if symptoms feel serious.",
  disclaimer:
    "This is informational guidance only, not a diagnosis or a substitute for professional medical care.",
};

/**
 * Handles communication with the Google Gemini API, wrapping requests with 
 * exponential backoff retry logic to handle rate limiting (429 errors). Enforces 
 * a structured JSON response schema to guarantee high stability.
 * @param client Instantiated GoogleGenAI client SDK.
 * @param history The active chat history turns.
 * @param forceResult If true, instructs the AI to immediately render a result instead of a followup.
 * @returns Parsed JSON text string representing the AI output.
 */
async function callGeminiWithRetry(
  client: GoogleGenAI,
  history: ChatTurn[],
  forceResult: boolean,
  dataSaver: boolean
): Promise<string> {
  const contents = history.map((turn) => ({
    role: turn.role === "user" ? "user" : "model",
    parts: [{ text: turn.content }],
  }));

  let systemInstruction = forceResult
    ? SYSTEM_PROMPT +
      "\n\nIMPORTANT: You have now asked enough follow-up questions. You MUST provide a final assessment JSON (not a followup) regardless of any remaining uncertainty. Default to a higher urgency level if unsure."
    : SYSTEM_PROMPT;

  if (dataSaver) {
    systemInstruction +=
      "\n\nIMPORTANT DATA SAVER OPTIMIZATION: Be highly concise, direct, and brief. Omit descriptive details or elaborate prose to minimize the output text length.";
  }

  const maxRetries = 3;
  let delay = 1000;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: dataSaver ? 0.15 : 0.3,
        },
      });

      const text = response.text ?? "";
      return text;
    } catch (err: unknown) {
      const isRateLimit =
        err instanceof Error &&
        (err.message.includes("429") || err.message.toLowerCase().includes("rate limit"));

      if (isRateLimit && attempt < maxRetries - 1) {
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
        continue;
      }
      throw err;
    }
  }

  throw new Error("Max retries exceeded");
}

/**
 * Primary POST endpoint for the symptom-triage agent.
 * Executes safety checks, processes chat history for red flags, and calls Gemini if safe.
 * @param req Incoming NextRequest containing conversation history and follow-up counter.
 * @returns JSON response matching TriageResponse types, wrapping followup, result, emergency, or crisis states.
 */
export async function POST(req: NextRequest): Promise<NextResponse<TriageResponse>> {
  try {
    const body = await req.json();
    const history: ChatTurn[] = body.history ?? [];
    const followupCount: number = body.followupCount ?? 0;
    const dataSaver: boolean = body.dataSaver ?? false;

    if (!Array.isArray(history) || history.length === 0) {
      return NextResponse.json(
        { kind: "followup", question: "Please describe how you're feeling." },
        { status: 200 }
      );
    }

    const latestUserMessage = [...history].reverse().find((t) => t.role === "user")?.content ?? "";

    if (isCrisis(latestUserMessage)) {
      return NextResponse.json({ kind: "crisis" });
    }

    const allUserText = history
      .filter((t) => t.role === "user")
      .map((t) => t.content)
      .join(" ");
    const redFlag = checkRedFlags(allUserText);
    if (redFlag) {
      return NextResponse.json({ kind: "emergency", matched: redFlag.label });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set");
      return NextResponse.json({ kind: "result", result: FALLBACK_RESULT });
    }

    const client = new GoogleGenAI({ apiKey });
    const forceResult = shouldForceResult({ stage: "followup", followupCount });

    const rawText = await callGeminiWithRetry(client, history, forceResult, dataSaver);
    const parsed = parseGeminiResponse(rawText);

    if (parsed.type === "crisis") {
      return NextResponse.json({ kind: "crisis" });
    }

    if (parsed.type === "followup") {
      return NextResponse.json({ kind: "followup", question: parsed.question });
    }

    const result = parsed.data;
    const finalUrgency = mergeUrgency(result.urgencyLevel, Boolean(redFlag));
    result.urgencyLevel = finalUrgency;

    const guidance = facilityGuidance[finalUrgency];
    result.recommendedAction =
      `${guidance.headline}\n\n${guidance.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n${guidance.escalateIf}`;

    return NextResponse.json({ kind: "result", result });
  } catch (err) {
    console.error("Triage route error:", err);
    return NextResponse.json({ kind: "result", result: FALLBACK_RESULT });
  }
}
