/**
 * Pocket Health Worker — Body map
 *
 * Step 1 tap where it hurts (front/back; every region is also reachable by keyboard and
 * from a list), step 2 what you feel there, then severity, duration, age, sex/pregnancy,
 * known conditions and optional free text. Produces both a plain-text summary (for the AI)
 * and the structured answers (for the deterministic rules on phone and server).
 */

"use client";

import { useState } from "react";
import type { StructuredInput } from "@/types";
import { AGE_GROUPS, CONDITIONS, DURATIONS, SEVERITIES, SEX_OPTIONS } from "@/lib/triage/options";
import { ArrowLeftIcon, ArrowRightIcon } from "./Icons";

export type BodyMapStructuredData = StructuredInput;

interface BodyMapProps {
  onSubmit: (formattedText: string, structured: StructuredInput) => void;
  onBack: () => void;
}

type Region =
  | "head" | "neck" | "chest" | "abdomen" | "upper_back" | "lower_back"
  | "left_arm" | "right_arm" | "left_hand" | "right_hand"
  | "left_leg" | "right_leg" | "left_foot" | "right_foot" | "general";

const REGION_SYMPTOMS: Record<Region, string[]> = {
  head: ["Headache", "Dizziness / Lightheadedness", "Migraine", "Vision issues / Blurring", "Fever", "Pulling at ears (child)", "Sunken fontanelle (infant)"],
  neck: ["Sore throat", "Difficulty swallowing", "Stiff neck", "Swollen glands"],
  chest: ["Chest pain / Tightness", "Breathing difficulty / Shortness of breath", "Persistent cough", "Heart palpitations", "Grunting / working hard to breathe (child)"],
  abdomen: ["Stomach pain / Cramps", "Nausea / Vomiting", "Diarrhoea", "Bloating / Gas", "Loss of appetite", "Hard/swollen belly", "Bleeding from the vagina"],
  upper_back: ["Upper back pain", "Shoulder blade pain", "Neck stiffness radiating down", "Spinal tension"],
  lower_back: ["Lower back pain", "Sciatica / Shooting leg pain", "Difficulty bending", "Spinal stiffness"],
  left_arm: ["Numbness / Tingling", "Joint pain / Stiffness", "Muscle weakness", "Swelling", "Non-blanching rash (meningitis flag)"],
  right_arm: ["Numbness / Tingling", "Joint pain / Stiffness", "Muscle weakness", "Swelling", "Non-blanching rash (meningitis flag)"],
  left_hand: ["Finger pain / Stiffness", "Hand swelling", "Numbness / Tingling", "Joint pain"],
  right_hand: ["Finger pain / Stiffness", "Hand swelling", "Numbness / Tingling", "Joint pain"],
  left_leg: ["Leg swelling", "Knee / Joint pain", "Muscle cramps", "Numbness / Tingling", "Non-blanching rash (meningitis flag)"],
  right_leg: ["Leg swelling", "Knee / Joint pain", "Muscle cramps", "Numbness / Tingling", "Non-blanching rash (meningitis flag)"],
  left_foot: ["Toe swelling / Pain", "Ankle pain", "Numbness / Tingling", "Foot pain"],
  right_foot: ["Toe swelling / Pain", "Ankle pain", "Numbness / Tingling", "Foot pain"],
  general: ["High fever", "Fatigue / General weakness", "Body aches / Muscle pain", "Chills / Shivering", "Weight loss", "Inconsolable crying (infant)", "Refusal to feed / lethargy (infant/child)"],
};

const REGION_LABELS: Record<Region, string> = {
  head: "Head & face", neck: "Throat & neck", chest: "Chest", abdomen: "Belly & stomach",
  upper_back: "Upper back", lower_back: "Lower back",
  left_arm: "Left arm", right_arm: "Right arm", left_hand: "Left hand & fingers", right_hand: "Right hand & fingers",
  left_leg: "Left leg", right_leg: "Right leg", left_foot: "Left foot & toes", right_foot: "Right foot & toes",
  general: "Whole body / general",
};

const FRONT_REGIONS: Region[] = ["head", "neck", "chest", "abdomen", "left_arm", "right_arm", "left_hand", "right_hand", "left_leg", "right_leg", "left_foot", "right_foot"];
const BACK_REGIONS: Region[] = ["head", "neck", "upper_back", "lower_back", "left_arm", "right_arm", "left_hand", "right_hand", "left_leg", "right_leg", "left_foot", "right_foot"];

/* SVG colours come from the theme (CSS custom properties defined in globals.css). */
const FILL = {
  idle: { fill: "var(--color-sand)", stroke: "var(--color-edge)", width: 1.4 },
  hover: { fill: "var(--color-rust-soft)", stroke: "var(--color-rust)", width: 1.8 },
  active: { fill: "var(--color-rust)", stroke: "var(--color-rust-dark)", width: 2.2 },
} as const;

function Choice({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className="chip">
      {label}
    </button>
  );
}

function Step({ n, title, children, id }: { n: string; title: string; children: React.ReactNode; id?: string }) {
  return (
    <fieldset className="space-y-3" id={id}>
      <legend className="space-y-0.5 mb-3">
        <span className="eyebrow block">{n}</span>
        <span className="block font-serif text-xl font-bold">{title}</span>
      </legend>
      {children}
    </fieldset>
  );
}

export default function BodyMap({ onSubmit, onBack }: BodyMapProps) {
  const [view, setView] = useState<"front" | "back">("front");
  const [region, setRegion] = useState<Region | null>(null);
  const [hovered, setHovered] = useState<Region | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<StructuredInput["severity"] | null>(null);
  const [duration, setDuration] = useState<StructuredInput["duration"] | null>(null);
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [sex, setSex] = useState<string | null>(null);
  const [conditions, setConditions] = useState<string[]>([]);
  const [extra, setExtra] = useState("");

  const chooseRegion = (r: Region) => {
    setRegion(r);
    setSymptoms([]);
    // On phones the symptom list is below the diagram — bring it into view.
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() =>
        document.getElementById("bm-step2")?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    }
  };
  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const missing = [
    !region && "where it hurts",
    !severity && "how strong",
    !duration && "how long",
    !ageGroup && "age",
    !sex && "sex / pregnancy",
  ].filter(Boolean) as string[];
  const isValid = missing.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!region || !severity || !duration || !ageGroup || !sex) return;
    const symptomsList = symptoms.length > 0 ? symptoms.join(", ") : "General discomfort";
    const chronicList = conditions.length > 0 ? conditions.join(", ") : "None reported";
    const summary = `[Body Map Clinical Triage]
Location: ${REGION_LABELS[region]} (${view.toUpperCase()} view).
Symptom Indicators: ${symptomsList}.
Intensity Level: ${severity}.
Duration Timeframe: ${duration}.
Age Demographic: ${ageGroup}.
Biological Sex & Pregnancy: ${sex}.
Pre-existing Conditions: ${chronicList}.
Patient Disclosures: ${extra.trim() || "None provided."}`;
    onSubmit(summary, {
      region,
      symptoms,
      severity,
      duration,
      ageGroup,
      biologicalSex: sex,
      comorbidities: conditions,
      additionalText: extra.trim(),
    });
  };

  /* Interactive SVG region: mouse, touch and keyboard. */
  const regionProps = (r: Region) => {
    const c = region === r ? FILL.active : hovered === r ? FILL.hover : FILL.idle;
    return {
      role: "button",
      tabIndex: 0,
      "aria-label": REGION_LABELS[r],
      "aria-pressed": region === r,
      onClick: () => chooseRegion(r),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          chooseRegion(r);
        }
      },
      onMouseEnter: () => setHovered(r),
      onMouseLeave: () => setHovered(null),
      style: { fill: c.fill, stroke: c.stroke, strokeWidth: c.width, cursor: "pointer", outline: "none" },
      className: "focus-visible:[stroke:var(--color-ink)] focus-visible:[stroke-width:3]",
    } as const;
  };

  const switchView = (v: "front" | "back") => {
    setView(v);
    if (region && region !== "general" && !(v === "front" ? FRONT_REGIONS : BACK_REGIONS).includes(region)) {
      setRegion(null);
      setSymptoms([]);
    }
  };

  const listRegions = view === "front" ? FRONT_REGIONS : BACK_REGIONS;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-6">
        <button type="button" onClick={onBack} className="btn btn-secondary">
          <ArrowLeftIcon /> Back
        </button>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold mb-6">Where does it hurt?</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Step 1 — diagram */}
        <section aria-labelledby="step1" className="lg:col-span-5 card p-5 sm:p-6 space-y-5 lg:sticky lg:top-20">
          <div>
            <p className="eyebrow">Step 1</p>
            <h2 id="step1" className="text-xl font-bold">Tap the part of the body</h2>
          </div>

          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Body view">
            <Choice label="Front" on={view === "front"} onClick={() => switchView("front")} />
            <Choice label="Back" on={view === "back"} onClick={() => switchView("back")} />
          </div>

          <div className="mx-auto w-full max-w-[240px]">
            <svg viewBox="0 0 200 370" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto select-none" aria-label={`Body, ${view} view`}>
              <ellipse cx="100" cy="38" rx="24" ry="26" {...regionProps("head")} />
              {view === "front" && (
                <g style={{ pointerEvents: "none" }} fill="var(--color-edge)">
                  <circle cx="91" cy="34" r="2" />
                  <circle cx="109" cy="34" r="2" />
                  <path d="M93,44 Q100,50 107,44" fill="none" stroke="var(--color-edge)" strokeWidth="1.5" strokeLinecap="round" />
                </g>
              )}
              <rect x="91" y="64" width="18" height="14" rx="5" {...regionProps("neck")} />
              <path d="M56,86 C48,86 42,96 40,120 C38,144 38,160 42,168 C46,176 54,176 56,168 C58,160 58,144 58,120 C58,96 60,86 56,86 Z" {...regionProps("left_arm")} />
              <ellipse cx="49" cy="180" rx="9" ry="8" {...regionProps("left_hand")} />
              <path d="M144,86 C152,86 158,96 160,120 C162,144 162,160 158,168 C154,176 146,176 144,168 C142,160 142,144 142,120 C142,96 140,86 144,86 Z" {...regionProps("right_arm")} />
              <ellipse cx="151" cy="180" rx="9" ry="8" {...regionProps("right_hand")} />
              {view === "front" ? (
                <>
                  <rect x="62" y="80" width="76" height="52" rx="5" {...regionProps("chest")} />
                  <rect x="66" y="134" width="68" height="54" rx="4" {...regionProps("abdomen")} />
                </>
              ) : (
                <>
                  <rect x="62" y="80" width="76" height="52" rx="5" {...regionProps("upper_back")} />
                  <rect x="66" y="134" width="68" height="54" rx="4" {...regionProps("lower_back")} />
                </>
              )}
              <path d="M72,194 C68,194 66,210 66,240 C66,270 68,310 72,340 C74,346 82,346 84,340 C88,310 90,270 90,240 C90,210 88,194 84,194 Z" {...regionProps("left_leg")} />
              <ellipse cx="78" cy="350" rx="13" ry="6" {...regionProps("left_foot")} />
              <path d="M116,194 C112,194 110,210 110,240 C110,270 112,310 116,340 C118,346 126,346 128,340 C132,310 134,270 134,240 C134,210 132,194 128,194 Z" {...regionProps("right_leg")} />
              <ellipse cx="122" cy="350" rx="13" ry="6" {...regionProps("right_foot")} />
            </svg>
          </div>

          <button
            type="button"
            aria-pressed={region === "general"}
            onClick={() => chooseRegion("general")}
            className="chip w-full justify-center"
          >
            Whole body / general feeling
          </button>

          <div>
            <label htmlFor="region-list" className="block text-sm font-semibold text-muted mb-1.5">
              Or choose from a list
            </label>
            <select
              id="region-list"
              className="field cursor-pointer"
              value={region ?? ""}
              onChange={(e) => e.target.value && chooseRegion(e.target.value as Region)}
            >
              <option value="">Choose a body area</option>
              {[...listRegions, "general" as Region].map((r) => (
                <option key={r} value={r}>{REGION_LABELS[r]}</option>
              ))}
            </select>
          </div>

          <p role="status" className="text-base font-semibold text-rust text-center min-h-6">
            {region ? `${REGION_LABELS[region]} selected` : ""}
          </p>
        </section>

        {/* Steps 2–7 */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 card p-5 sm:p-6 space-y-8">
          <div id="bm-step2" className="scroll-mt-24">
            <Step n="Step 2" title={region ? `${REGION_LABELS[region]}: what do you feel?` : "What do you feel there?"}>
              {region ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {REGION_SYMPTOMS[region].map((s) => (
                    <Choice key={s} label={s} on={symptoms.includes(s)} onClick={() => toggle(symptoms, setSymptoms, s)} />
                  ))}
                </div>
              ) : (
                <p className="text-muted bg-sand rounded-xl p-4">Choose a part of the body in step 1 to see what you might feel there.</p>
              )}
            </Step>
          </div>

          <Step n="Step 3" title="How strong does it feel?">
            <div className="grid grid-cols-3 gap-2">
              {SEVERITIES.map((v) => <Choice key={v} label={v} on={severity === v} onClick={() => setSeverity(v)} />)}
            </div>
          </Step>

          <Step n="Step 4" title="How long has it been going on?">
            <div className="grid grid-cols-1 min-[400px]:grid-cols-3 gap-2">
              {DURATIONS.map((v) => <Choice key={v} label={v} on={duration === v} onClick={() => setDuration(v)} />)}
            </div>
          </Step>

          <Step n="Step 5" title="How old is the person who is unwell?">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AGE_GROUPS.map((v) => <Choice key={v} label={v} on={ageGroup === v} onClick={() => setAgeGroup(v)} />)}
            </div>
          </Step>

          <Step n="Step 6" title="Sex and pregnancy">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SEX_OPTIONS.map((v) => <Choice key={v} label={v} on={sex === v} onClick={() => setSex(v)} />)}
            </div>
          </Step>

          <Step n="Step 7 · optional" title="Any long-term health conditions?">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CONDITIONS.map((v) => (
                <Choice key={v} label={v} on={conditions.includes(v)} onClick={() => toggle(conditions, setConditions, v)} />
              ))}
            </div>
            <p className="text-sm text-muted">Leave empty if none. We only use what you choose here.</p>
          </Step>

          <div className="space-y-2">
            <label htmlFor="bm-extra" className="block">
              <span className="eyebrow block">Optional</span>
              <span className="block font-serif text-xl font-bold">Anything else to add?</span>
            </label>
            <textarea
              id="bm-extra"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="In your own words…"
              maxLength={600}
              className="field min-h-28 resize-y"
            />
          </div>

          <div className="border-t border-line pt-6 space-y-3">
            <button type="submit" disabled={!isValid} className="btn btn-primary w-full text-lg">
              See what to do next <ArrowRightIcon />
            </button>
            <p role="status" className="text-sm text-muted text-center">
              {isValid ? "Ready. This takes a few seconds." : `Still needed: ${missing.join(", ")}.`}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
