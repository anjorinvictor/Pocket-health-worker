/**
 * Pidgin coverage and first-aid safety.
 *
 * - Every fixed sentence the rules engine or red-flag list can show has a Pidgin version,
 *   so a Pidgin reader never gets a half-English emergency.
 * - Every body-map option has a Pidgin label (values sent to the rules stay English).
 * - First aid never names a medicine or a dose (non-negotiable 2), and both languages
 *   carry the same number of steps.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { en, pcm } from "./strings";
import { FIXED_SENTENCES, PCM_LABELS, splitSentences } from "./labels";
import { makeI18n } from "./index";
import { runOfflineTriage } from "@/lib/triage/offlineTriage";
import { AGE_GROUPS, CONDITIONS, DURATIONS, REGION_LABELS, SEVERITIES, SEX_OPTIONS } from "@/lib/triage/options";
import { FIRST_AID } from "@/data/first-aid";
import redFlags from "@/data/red-flags.json";
import type { StructuredInput } from "@/types";

const REGIONS = Object.keys(REGION_LABELS);

/** Every combination that matters for the rules' wording. */
function allRulesOutputs() {
  const out = new Set<string>();
  const texts = ["", "chest pain", "I am bleeding heavily", "fever"];
  for (const region of REGIONS)
    for (const severity of SEVERITIES)
      for (const duration of DURATIONS)
        for (const ageGroup of AGE_GROUPS)
          for (const biologicalSex of SEX_OPTIONS)
            for (const additionalText of texts) {
              const input: StructuredInput = {
                region, severity, duration, ageGroup, biologicalSex, additionalText,
                symptoms: region === "head" ? ["Headache"] : [],
                comorbidities: [],
              };
              for (const severityEscalates of [true, false]) {
                const r = runOfflineTriage(input, { severityEscalates });
                [r.headline, ...splitSentences(r.details), ...r.warningSignsToWatch].forEach((s) => out.add(s));
              }
            }
  return out;
}

describe("Pidgin coverage", () => {
  it("every interface string has a non-empty Pidgin version", () => {
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(pcm[key], key).toBeTruthy();
    }
  });

  it("every sentence the rules engine can show has Pidgin", () => {
    const missing = [...allRulesOutputs()].filter((s) => !FIXED_SENTENCES[s]);
    expect(missing).toEqual([]);
  });

  it("every red-flag message has Pidgin", () => {
    const missing = redFlags.map((f) => f.message).filter((m) => !FIXED_SENTENCES[m]);
    expect(missing).toEqual([]);
  });

  it("every body-map option and region has a Pidgin label", () => {
    const values = [...SEVERITIES, ...DURATIONS, ...AGE_GROUPS, ...SEX_OPTIONS, ...CONDITIONS, ...Object.values(REGION_LABELS)];
    expect(values.filter((v) => !PCM_LABELS[v])).toEqual([]);
  });

  it("every body-map symptom has a Pidgin label", () => {
    const src = readFileSync(path.resolve(__dirname, "../../components/BodyMap.tsx"), "utf8");
    const block = src.slice(src.indexOf("const REGION_SYMPTOMS"), src.indexOf("};", src.indexOf("const REGION_SYMPTOMS")));
    const symptoms = new Set([...block.matchAll(/"([^"]+)"/g)].map((m) => m[1]));
    expect(symptoms.size).toBeGreaterThan(40);
    expect([...symptoms].filter((s) => !PCM_LABELS[s])).toEqual([]);
  });

  it("tx translates a multi-sentence rules answer completely", () => {
    const { tx } = makeI18n("pcm");
    const r = runOfflineTriage({
      region: "chest", symptoms: [], severity: "Moderate", duration: "Today",
      ageGroup: "Adult (18-40)", biologicalSex: "Male", comorbidities: [], additionalText: "",
    });
    const shown = tx(r.details);
    expect(shown).not.toMatch(/Visit a Primary Health Centre/);
    expect(shown).toMatch(/Go Primary Health Centre/);
  });

  it("English is untouched", () => {
    const { tx, label, t } = makeI18n("en");
    expect(tx("Do not wait to see if it gets better.")).toBe("Do not wait to see if it gets better.");
    expect(label("Fever")).toBe("Fever");
    expect(t("callN", { n: "112" })).toBe("Call 112");
  });
});

describe("First aid", () => {
  const DRUG_WORDS = /\b(paracetamol|panadol|aspirin|ibuprofen|antibiotic|tablet|capsule|syrup|injection|dose|dosage|mg|ml|ors|adrenaline|epipen|inhaler)\b/i;

  for (const [id, steps] of Object.entries(FIRST_AID)) {
    it(`${id}: same steps in both languages, no medicine named`, () => {
      expect(steps.en.length).toBeGreaterThanOrEqual(3);
      expect(steps.pcm.length).toBe(steps.en.length);
      for (const s of [...steps.en, ...steps.pcm]) expect(s).not.toMatch(DRUG_WORDS);
    });
  }

  it("every red flag has its own first-aid list", () => {
    expect(redFlags.filter((f) => !(f.id in FIRST_AID)).map((f) => f.id)).toEqual([]);
  });
});
