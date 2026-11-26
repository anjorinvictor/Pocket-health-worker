/**
 * Safety tests — grounding check (Non-negotiable 3: never invent patient history).
 */

import { describe, it, expect } from "vitest";
import { findInventedConditions } from "./grounding";

const INFANT_INPUT = `[Body Map Clinical Triage]
Location: Head & Face (FRONT view).
Symptom Indicators: Headache.
Intensity Level: Severe.
Duration Timeframe: Today.
Age Demographic: Infant (0-1).
Biological Sex & Pregnancy: Female (Not Pregnant).
Pre-existing Conditions: None reported.
Patient Disclosures: None provided.`;

describe("findInventedConditions", () => {
  it("catches the reported bug: infant 'has a pre-existing condition of diabetes'", () => {
    const ai = "The infant has a pre-existing condition of diabetes and a severe headache.";
    expect(findInventedConditions(ai, INFANT_INPUT)).toEqual(["diabetes"]);
  });

  it("allows a condition the user actually selected", () => {
    const ai = "Because the patient has diabetes, infections can progress faster.";
    expect(findInventedConditions(ai, "Pre-existing Conditions: Diabetes.")).toEqual([]);
  });

  it("allows hedged possibilities", () => {
    const ai = "Frequent thirst may suggest diabetes; a health worker can check for it.";
    expect(findInventedConditions(ai, "I am always thirsty")).toEqual([]);
  });

  it("does not let a hedge in a previous sentence hide an assertion", () => {
    const ai = "This may be serious. The baby has asthma.";
    expect(findInventedConditions(ai, INFANT_INPUT)).toEqual(["asthma"]);
  });

  it("does not match 'hiv' inside 'shivering'", () => {
    const ai = "The patient has shivering and chills.";
    expect(findInventedConditions(ai, "Chills / Shivering")).toEqual([]);
  });

  it("'Female (Not Pregnant)' does not count as mentioning pregnancy", () => {
    const ai = "She is pregnant and has a history of pregnancy complications.";
    expect(findInventedConditions(ai, INFANT_INPUT)).toEqual(["pregnancy"]);
  });

  it("returns nothing for a clean, grounded assessment", () => {
    const ai = "A severe headache in an infant needs urgent assessment by a health worker.";
    expect(findInventedConditions(ai, INFANT_INPUT)).toEqual([]);
  });
});
