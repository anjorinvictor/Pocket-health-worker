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
  idle: { fill: "var(--color-sand)", stroke: "var(--color-paper)", width: 1.6 },
  hover: { fill: "var(--color-rust-soft)", stroke: "var(--color-rust)", width: 1.8 },
  active: { fill: "var(--color-rust)", stroke: "var(--color-rust-dark)", width: 2 },
} as const;

/*
 * Human figure (viewBox 0 0 200 420). Left-side paths are drawn once and mirrored for the
 * right side, so the body is symmetric. Arms and legs are drawn before the torso so the
 * torso overlaps them cleanly at the shoulders and hips.
 */
const BODY = {
  head: "M100,10 C113,10 122,20 122,35 C122,46 119,55 113,61 C109,65 105,67 100,67 C95,67 91,65 87,61 C81,55 78,46 78,35 C78,20 87,10 100,10 Z",
  neck: "M91,60 C92,66 92,72 90,79 L110,79 C108,72 108,66 109,60 C106,64 103,66 100,66 C97,66 94,64 91,60 Z",
  upperTorso: "M90,79 C80,80 70,82 63,87 C58,91 57,98 58,106 C59,118 62,132 66,146 L134,146 C138,132 141,118 142,106 C143,98 142,91 137,87 C130,82 120,80 110,79 Z",
  lowerTorso: "M66,146 C68,158 70,168 69,180 C68,192 64,204 62,214 L138,214 C136,204 132,192 131,180 C130,168 132,158 134,146 Z",
  arm: "M64,86 C55,88 49,96 47,108 C45,122 44,138 42,152 C40,168 37,186 35,204 C34,212 33,218 33,224 L45,225 C46,216 48,206 50,196 C53,180 56,164 57,150 C58,138 59,126 60,114 C61,104 63,94 64,86 Z",
  hand: "M33,223 C30,229 28,236 28,243 C28,251 31,258 35,261 C38,263 42,262 44,259 C46,255 47,249 47,243 C47,236 46,230 45,225 Z",
  leg: "M62,213 C59,236 60,258 63,282 C65,300 65,316 66,334 C67,352 68,370 70,388 L86,388 C86,370 88,352 90,334 C92,316 95,300 96,284 C98,264 99,246 99,232 L100,213 Z",
  foot: "M70,387 C68,393 65,398 62,403 C60,407 63,411 70,411 L87,411 C91,411 92,407 90,401 C89,396 87,391 86,387 Z",
};
const MIRROR = "matrix(-1 0 0 1 200 0)";

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

          <div className="mx-auto w-full max-w-[220px]">
            <svg viewBox="0 0 200 420" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto select-none" aria-label={`Human body, ${view} view`}>
              {/* Limbs first (under the torso). On the front view the person's right side is on your left. */}
              <path d={BODY.arm} {...regionProps("left_arm")} />
              <path d={BODY.hand} {...regionProps("left_hand")} />
              <path d={BODY.arm} transform={MIRROR} {...regionProps("right_arm")} />
              <path d={BODY.hand} transform={MIRROR} {...regionProps("right_hand")} />
              <path d={BODY.leg} {...regionProps("left_leg")} />
              <path d={BODY.foot} {...regionProps("left_foot")} />
              <path d={BODY.leg} transform={MIRROR} {...regionProps("right_leg")} />
              <path d={BODY.foot} transform={MIRROR} {...regionProps("right_foot")} />

              {view === "front" ? (
                <>
                  <path d={BODY.upperTorso} {...regionProps("chest")} />
                  <path d={BODY.lowerTorso} {...regionProps("abdomen")} />
                </>
              ) : (
                <>
                  <path d={BODY.upperTorso} {...regionProps("upper_back")} />
                  <path d={BODY.lowerTorso} {...regionProps("lower_back")} />
                </>
              )}
              <path d={BODY.neck} {...regionProps("neck")} />
              <path d={BODY.head} {...regionProps("head")} />

              {/* Gentle anatomy lines — decoration only, never clickable. */}
              <g
                style={{ pointerEvents: "none" }}
                fill="none"
                stroke="var(--color-edge)"
                strokeOpacity={0.45}
                strokeWidth={1.2}
                strokeLinecap="round"
              >
                {view === "front" ? (
                  <>
                    <path d="M76,89 Q88,94 97,91 M103,91 Q112,94 124,89" />
                    <path d="M100,104 L100,134" strokeOpacity={0.25} />
                    <circle cx="100" cy="184" r="1.6" fill="var(--color-edge)" stroke="none" fillOpacity={0.5} />
                    <path d="M80,296 Q78,302 80,308 M120,296 Q122,302 120,308" strokeOpacity={0.3} />
                  </>
                ) : (
                  <>
                    <path d="M81,28 Q100,12 119,28" />
                    <path d="M100,84 L100,210" strokeDasharray="2 4" />
                    <path d="M74,100 Q82,116 93,106 M126,100 Q118,116 107,106" />
                    <path d="M76,206 Q100,214 124,206" strokeOpacity={0.3} />
                  </>
                )}
              </g>
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
