/**
 * Safety tests — offline deterministic triage engine.
 *
 * The offline engine is the ONLY safety net when there is no network, so its
 * conservative behavior is pinned here: it must escalate danger, never give false
 * reassurance, and only return GREEN under tightly gated benign conditions. The three
 * demo scenarios from the buildathon brief are included explicitly.
 */

import { describe, it, expect } from "vitest";
import { runOfflineTriage } from "./offlineTriage";
import type { OfflineTriageInput } from "./offlineTriage";

function input(overrides: Partial<OfflineTriageInput> = {}): OfflineTriageInput {
  return {
    region: "general",
    symptoms: [],
    severity: "Mild",
    duration: "Today",
    ageGroup: "Adult (18-40)",
    biologicalSex: "Male",
    comorbidities: [],
    additionalText: "",
    ...overrides,
  };
}

describe("offline engine — demo scenario (a): infant danger sign → RED", () => {
  it("Infant + fever + sunken fontanelle → RED with emergency bridge", () => {
    const r = runOfflineTriage(
      input({
        region: "head",
        symptoms: ["Fever", "Sunken fontanelle (infant)"],
        severity: "Moderate",
        ageGroup: "Infant (0-1)",
      })
    );
    expect(r.urgencyLevel).toBe("RED");
    expect(r.showEmergencyBridge).toBe(true);
  });
});

describe("offline engine — demo scenario (b): chest / breathing → RED", () => {
  it("chest pain → RED with emergency bridge", () => {
    const r = runOfflineTriage(input({ region: "chest", symptoms: ["Chest pain / Tightness"], severity: "Moderate" }));
    expect(r.urgencyLevel).toBe("RED");
    expect(r.showEmergencyBridge).toBe(true);
  });
  it("breathing difficulty → RED", () => {
    const r = runOfflineTriage(input({ region: "chest", symptoms: ["Breathing difficulty / Shortness of breath"] }));
    expect(r.urgencyLevel).toBe("RED");
  });
});

describe("offline engine — demo scenario (c): mild benign adult → GREEN", () => {
  it("general mild body ache, 1 day, healthy adult → GREEN", () => {
    const r = runOfflineTriage(input({ region: "general", symptoms: ["Body aches / Muscle pain"] }));
    expect(r.urgencyLevel).toBe("GREEN");
    expect(r.showEmergencyBridge).toBe(false);
  });
  it("low-risk limb, mild, healthy adult → GREEN", () => {
    const r = runOfflineTriage(input({ region: "left_hand", symptoms: ["Finger pain / Stiffness"] }));
    expect(r.urgencyLevel).toBe("GREEN");
  });
});

describe("offline engine — conservative rounding (documents intended behavior)", () => {
  it("mild headache plus another head symptom still rounds UP to YELLOW", () => {
    const r = runOfflineTriage(input({ region: "head", symptoms: ["Headache", "Dizziness / Lightheadedness"] }));
    expect(r.urgencyLevel).toBe("YELLOW");
  });
  it("mild headache in a child is not home care", () => {
    const r = runOfflineTriage(input({ region: "head", symptoms: ["Headache"], ageGroup: "Child (4-11)" }));
    expect(r.urgencyLevel).toBe("YELLOW");
  });
  it("pregnant + mild → YELLOW (not GREEN)", () => {
    const r = runOfflineTriage(input({ region: "left_hand", symptoms: ["Finger pain"], biologicalSex: "Female (Pregnant)" }));
    expect(r.urgencyLevel).toBe("YELLOW");
  });
  it("concerning comorbidity + mild → YELLOW (not GREEN)", () => {
    const r = runOfflineTriage(input({ region: "left_hand", symptoms: ["Finger pain"], comorbidities: ["Diabetes"] }));
    expect(r.urgencyLevel).toBe("YELLOW");
  });
  it("severe symptom in a vulnerable senior → RED", () => {
    const r = runOfflineTriage(input({ region: "left_leg", symptoms: ["Leg swelling"], severity: "Severe", ageGroup: "Senior (Over 60)" }));
    expect(r.urgencyLevel).toBe("RED");
  });
});

describe("offline engine — red-flag in free text overrides a benign body region", () => {
  it("benign finger complaint + 'chest pain' in free text → RED with bridge", () => {
    const r = runOfflineTriage(
      input({
        region: "left_hand",
        symptoms: ["Finger pain"],
        additionalText: "but my chest dey pain me too",
      })
    );
    expect(r.urgencyLevel).toBe("RED");
    expect(r.showEmergencyBridge).toBe(true);
  });
});

/* ── Owner's required cases (CLAUDE.md) ──────────────────────── */
describe("offline engine — owner's required cases", () => {
  it("infant with fever + danger sign → RED (the 2 a.m. story)", () => {
    const r = runOfflineTriage(input({ region: "head", symptoms: ["Fever"], severity: "Severe", ageGroup: "Infant (0-1)" }));
    expect(r.urgencyLevel).toBe("RED");
  });
  it("pregnant woman with heavy bleeding (free text) → RED", () => {
    const r = runOfflineTriage(input({
      region: "abdomen", symptoms: ["Stomach pain / Cramps"], severity: "Moderate",
      biologicalSex: "Female (Pregnant)", additionalText: "I am bleeding heavily",
    }));
    expect(r.urgencyLevel).toBe("RED");
  });
  it("pregnant woman with the bleeding symptom chip → RED", () => {
    const r = runOfflineTriage(input({ region: "abdomen", symptoms: ["Bleeding from the vagina"], biologicalSex: "Female (Pregnant)" }));
    expect(r.urgencyLevel).toBe("RED");
  });
  it("adult with a mild headache since today → GREEN (home care)", () => {
    const r = runOfflineTriage(input({ region: "head", symptoms: ["Headache"] }));
    expect(r.urgencyLevel).toBe("GREEN");
  });
  it("chest pain in an adult over 40 → RED", () => {
    const r = runOfflineTriage(input({ region: "chest", symptoms: ["Chest pain / Tightness"], ageGroup: "Middle-aged (41-60)" }));
    expect(r.urgencyLevel).toBe("RED");
  });
});

describe("online floor mode (severityEscalates: false)", () => {
  it("severe headache in an adult is a YELLOW floor online (AI decides), RED offline", () => {
    const i = input({ region: "head", symptoms: ["Headache"], severity: "Severe" });
    expect(runOfflineTriage(i, { severityEscalates: false }).urgencyLevel).toBe("YELLOW");
    expect(runOfflineTriage(i).urgencyLevel).toBe("RED");
  });
  it("danger signs stay RED online: infant fever, pregnancy bleeding, chest pain", () => {
    const off = { severityEscalates: false };
    expect(runOfflineTriage(input({ region: "head", symptoms: ["Fever"], severity: "Severe", ageGroup: "Infant (0-1)" }), off).urgencyLevel).toBe("RED");
    expect(runOfflineTriage(input({ region: "abdomen", symptoms: ["Bleeding from the vagina"], biologicalSex: "Female (Pregnant)" }), off).urgencyLevel).toBe("RED");
    expect(runOfflineTriage(input({ region: "chest", symptoms: ["Chest pain / Tightness"], ageGroup: "Middle-aged (41-60)" }), off).urgencyLevel).toBe("RED");
  });
});

describe("offline engine — regressions found in discovery (2026-11-26)", () => {
  it("severe + 'Immunocompromised (HIV, Chemo)' (the body-map label) → RED", () => {
    const r = runOfflineTriage(input({ region: "left_arm", symptoms: ["Swelling"], severity: "Severe", comorbidities: ["Immunocompromised (HIV, Chemo)"] }));
    expect(r.urgencyLevel).toBe("RED");
  });
  it("'Hypertension / Heart Disease' blocks GREEN", () => {
    const r = runOfflineTriage(input({ region: "left_hand", symptoms: ["Finger pain"], comorbidities: ["Hypertension / Heart Disease"] }));
    expect(r.urgencyLevel).toBe("YELLOW");
  });
  it("not-pregnant woman with mild abdominal symptom is not escalated by pregnancy rules", () => {
    const r = runOfflineTriage(input({ region: "abdomen", symptoms: ["Bloating / Gas"], biologicalSex: "Female (Not Pregnant)" }));
    expect(r.urgencyLevel).toBe("YELLOW");
  });
});

describe("emergencies say which danger sign fired (first-aid steps)", () => {
  it("infant with fever → infant", () => {
    const r = runOfflineTriage(input({ region: "head", symptoms: ["Fever"], ageGroup: "Infant (0-1)" }));
    expect(r.urgencyLevel).toBe("RED");
    expect(r.sign).toBe("infant");
  });
  it("pregnant + heavy bleeding → a red flag id (bleeding or pregnancy)", () => {
    const r = runOfflineTriage(input({ biologicalSex: "Female (Pregnant)", additionalText: "I am bleeding heavily" }));
    expect(r.urgencyLevel).toBe("RED");
    expect(["bleeding", "pregnancy"]).toContain(r.sign);
  });
  it("chest pain → chest_pain", () => {
    const r = runOfflineTriage(input({ region: "chest", symptoms: ["Chest pain / Tightness"], ageGroup: "Middle-aged (41-60)" }));
    expect(r.sign).toBe("chest_pain");
  });
  it("non-RED results carry no sign", () => {
    expect(runOfflineTriage(input({ region: "left_arm" })).sign).toBeUndefined();
  });
});
