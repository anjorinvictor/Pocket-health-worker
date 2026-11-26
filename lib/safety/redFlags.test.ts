/**
 * Safety tests — deterministic red-flag (emergency danger sign) detector.
 *
 * Locks in that classic emergencies escalate, that common Nigerian English / Pidgin
 * phrasings now also escalate, and that ordinary mild complaints do NOT false-trigger.
 */

import { describe, it, expect } from "vitest";
import { checkRedFlags } from "./redFlags";

describe("checkRedFlags — standard English danger signs", () => {
  const cases: Array<[string, string]> = [
    ["I have severe chest pain", "chest_pain"],
    ["I can't breathe", "breathing"],
    ["my father has slurred speech and face drooping", "stroke"],
    ["she is vomiting blood", "coughing_blood"],
    ["he had a seizure this morning", "seizure"],
    ["the wound won't stop bleeding", "bleeding"],
    ["my throat is closing and my face is swelling", "allergic"],
  ];
  for (const [text, id] of cases) {
    it(`flags "${text}" → ${id}`, () => {
      expect(checkRedFlags(text)?.id).toBe(id);
    });
  }
});

describe("checkRedFlags — Nigerian English / Pidgin danger signs", () => {
  const cases: Array<[string, string]> = [
    ["my chest dey pain me", "chest_pain"],
    ["i no fit breathe", "breathing"],
    ["the baby no dey breastfeed", "infant"],
    ["she don faint", "unconscious"],
    ["him body dey jerk", "seizure"],
    ["blood no dey stop", "bleeding"],
    ["she swallow poison", "poisoning"],
  ];
  for (const [text, id] of cases) {
    it(`flags "${text}" → ${id}`, () => {
      expect(checkRedFlags(text)?.id).toBe(id);
    });
  }
});

describe("checkRedFlags — smart apostrophes are normalized", () => {
  it("matches “can’t breathe” with a curly apostrophe", () => {
    expect(checkRedFlags("I can’t breathe")?.id).toBe("breathing");
  });
});

describe("checkRedFlags — mild complaints must NOT escalate", () => {
  const negatives = [
    "I have a mild headache",
    "small body pain since morning",
    "I have a runny nose and mild cough",
    "slight stomach discomfort after eating",
  ];
  for (const text of negatives) {
    it(`does not flag: "${text}"`, () => {
      expect(checkRedFlags(text)).toBeNull();
    });
  }
});
