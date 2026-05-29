/**
 * Pocket Health Worker — Visual Body Map Symptom Triage
 *
 * Rebuilt with a clean, well-proportioned clinical silhouette matching the
 * Lovable reference. Each body part is its own separately-outlined,
 * individually-clickable SVG region with hover and selected states.
 *
 * FRONT view: head, neck, chest, abdomen, left/right arms, left/right legs
 * BACK view: head, neck, upper back, lower back, left/right arms, left/right legs
 *
 * All doctor-approved fields retained. Compiled output feeds the same
 * /api/triage pipeline (UN SDG 3).
 */

"use client";

import { useState } from "react";

export interface BodyMapStructuredData {
  region: string;
  symptoms: string[];
  severity: "Mild" | "Moderate" | "Severe";
  duration: "Today" | "Few days" | "Over a week";
  ageGroup: string;
  biologicalSex: string;
  comorbidities: string[];
  additionalText: string;
}

interface BodyMapProps {
  onSubmit: (formattedText: string, ageGroup: string, structuredData: BodyMapStructuredData) => void;
  onBack: () => void;
}

type Region =
  | "head"
  | "neck"
  | "chest"
  | "abdomen"
  | "upper_back"
  | "lower_back"
  | "left_arm"
  | "right_arm"
  | "left_hand"
  | "right_hand"
  | "left_leg"
  | "right_leg"
  | "left_foot"
  | "right_foot"
  | "general"
  | null;

const REGION_SYMPTOMS: Record<string, string[]> = {
  head: ["Headache", "Dizziness / Lightheadedness", "Migraine", "Vision issues / Blurring", "Fever", "Pulling at ears (child)", "Sunken fontanelle (infant)"],
  neck: ["Sore throat", "Difficulty swallowing", "Stiff neck", "Swollen glands"],
  chest: ["Chest pain / Tightness", "Breathing difficulty / Shortness of breath", "Persistent cough", "Heart palpitations", "Grunting / working hard to breathe (child)"],
  abdomen: ["Stomach pain / Cramps", "Nausea / Vomiting", "Diarrhoea", "Bloating / Gas", "Loss of appetite", "Hard/swollen belly"],
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

const REGION_LABELS: Record<string, string> = {
  head: "Head & Face",
  neck: "Throat & Neck",
  chest: "Chest",
  abdomen: "Abdomen & Stomach",
  upper_back: "Upper Back",
  lower_back: "Lower Back",
  left_arm: "Left Arm",
  right_arm: "Right Arm",
  left_hand: "Left Hand & Fingers",
  right_hand: "Right Hand & Fingers",
  left_leg: "Left Leg",
  right_leg: "Right Leg",
  left_foot: "Left Foot & Toes",
  right_foot: "Right Foot & Toes",
  general: "Whole Body / General",
};

/* ── Colour tokens ───────────────────────────────────────────── */
const CLR = {
  idle:     { fill: "#f0eded", stroke: "#ccc5be", width: 1.4 },
  hover:    { fill: "#fed7aa", stroke: "#f97316", width: 1.6 },
  active:   { fill: "#ea580c", stroke: "#c2410c", width: 2   },
  face:     "#b0a89f",
} as const;

export default function BodyMap({ onSubmit, onBack }: BodyMapProps) {
  const [view, setView] = useState<"front" | "back">("front");
  const [selectedRegion, setSelectedRegion] = useState<Region>(null);
  const [hoveredRegion, setHoveredRegion] = useState<Region>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<"Mild" | "Moderate" | "Severe" | null>(null);
  const [duration, setDuration] = useState<"Today" | "Few days" | "Over a week" | null>(null);
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [biologicalSex, setBiologicalSex] = useState<"Male" | "Female (Not Pregnant)" | "Female (Pregnant)" | null>(null);
  const [comorbidities, setComorbidities] = useState<string[]>([]);
  const [additionalText, setAdditionalText] = useState("");

  const handleRegionClick = (region: Region) => {
    setSelectedRegion(region);
    setSelectedSymptoms([]);
  };
  const toggleSymptom = (s: string) =>
    setSelectedSymptoms((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  const toggleComorbidity = (c: string) =>
    setComorbidities((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegion || !severity || !duration || !ageGroup || !biologicalSex) return;
    const symptomsList = selectedSymptoms.length > 0 ? selectedSymptoms.join(", ") : "General discomfort";
    const chronicList = comorbidities.length > 0 ? comorbidities.join(", ") : "None reported";
    const structuredSummary = `[Body Map Clinical Triage]
Location: ${REGION_LABELS[selectedRegion]} (${view.toUpperCase()} view).
Symptom Indicators: ${symptomsList}.
Intensity Level: ${severity}.
Duration Timeframe: ${duration}.
Age Demographic: ${ageGroup}.
Biological Sex & Pregnancy: ${biologicalSex}.
Pre-existing Conditions: ${chronicList}.
Patient Disclosures: ${additionalText.trim() || "None provided."}`;
    const structured: BodyMapStructuredData = {
      region: selectedRegion,
      symptoms: selectedSymptoms,
      severity,
      duration,
      ageGroup,
      biologicalSex,
      comorbidities,
      additionalText: additionalText.trim(),
    };
    onSubmit(structuredSummary, ageGroup, structured);
  };

  const isFormValid = selectedRegion && severity && duration && ageGroup && biologicalSex;

  /* ── Inline style builder for SVG regions ─────────────────── */
  const rs = (region: Region): React.CSSProperties => {
    const isActive = selectedRegion === region;
    const isHovered = hoveredRegion === region;
    const c = isActive ? CLR.active : isHovered ? CLR.hover : CLR.idle;
    return {
      fill: c.fill,
      stroke: c.stroke,
      strokeWidth: c.width,
      cursor: "pointer",
      transition: "all 0.22s ease",
      filter: isActive ? "drop-shadow(0 0 6px rgba(234,88,12,0.25))" : "none",
    };
  };
  const ev = (region: Region) => ({
    onClick: () => handleRegionClick(region),
    onMouseEnter: () => setHoveredRegion(region),
    onMouseLeave: () => setHoveredRegion(null),
    style: rs(region),
  });

  /* ── Chip component helper ────────────────────────────────── */
  const Chip = ({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-2.5 rounded-2xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
        active
          ? "bg-[#ac4c28] border-[#ac4c28] text-white shadow-sm"
          : "bg-white hover:bg-slate-50 border-slate-200 text-slate-500"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 animate-scale-up">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>
        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
          Pocket Health · Body Map
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ═══ LEFT — Body diagram card ═══════════════════════════ */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col items-center space-y-5">
          <div className="w-full text-center space-y-1.5">
            <p className="text-[10px] font-black tracking-wider text-[#ac4c28] uppercase">Step 1</p>
            <h4 className="text-xl font-serif font-bold text-slate-800">Where does it hurt or feel wrong?</h4>
            <p className="text-[11px] text-slate-400 font-medium">Tap where it hurts</p>
          </div>

          {/* Front / Back pill */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/40">
            <button
              type="button"
              onClick={() => { setView("front"); setSelectedRegion(null); setSelectedSymptoms([]); }}
              className={`px-5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                view === "front" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Front
            </button>
            <button
              type="button"
              onClick={() => { setView("back"); setSelectedRegion(null); setSelectedSymptoms([]); }}
              className={`px-5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                view === "back" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Back
            </button>
          </div>

          {/* ── SVG body ── */}
          <div className="relative w-full max-w-[220px] mx-auto">
            <svg viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto select-none">

              {/* ── HEAD ── */}
              <ellipse cx="100" cy="38" rx="24" ry="26" {...ev("head")} />

              {/* Face (front only, non-interactive) */}
              {view === "front" && (
                <g style={{ pointerEvents: "none" }}>
                  <circle cx="91" cy="34" r="2" fill={CLR.face} />
                  <circle cx="109" cy="34" r="2" fill={CLR.face} />
                  <path d="M93,44 Q100,50 107,44" fill="none" stroke={CLR.face} strokeWidth="1.5" strokeLinecap="round" />
                </g>
              )}

              {/* ── NECK ── */}
              <rect x="91" y="64" width="18" height="14" rx="5" {...ev("neck")} />

              {/* ── LEFT ARM ── tapered curved path */}
              <path d="M56,86 C48,86 42,96 40,120 C38,144 38,160 42,168 C46,176 54,176 56,168 C58,160 58,144 58,120 C58,96 60,86 56,86 Z" {...ev("left_arm")} />
              {/* ── LEFT HAND ── */}
              <ellipse cx="49" cy="180" rx="9" ry="8" {...ev("left_hand")} />

              {/* ── RIGHT ARM ── mirror */}
              <path d="M144,86 C152,86 158,96 160,120 C162,144 162,160 158,168 C154,176 146,176 144,168 C142,160 142,144 142,120 C142,96 140,86 144,86 Z" {...ev("right_arm")} />
              {/* ── RIGHT HAND ── */}
              <ellipse cx="151" cy="180" rx="9" ry="8" {...ev("right_hand")} />

              {view === "front" ? (
                <>
                  {/* ── CHEST ── wide rounded rectangle */}
                  <rect x="62" y="80" width="76" height="52" rx="5" {...ev("chest")} />

                  {/* ── ABDOMEN ── slightly narrower rectangle below chest */}
                  <rect x="66" y="134" width="68" height="54" rx="4" {...ev("abdomen")} />
                </>
              ) : (
                <>
                  {/* ── UPPER BACK ── */}
                  <rect x="62" y="80" width="76" height="52" rx="5" {...ev("upper_back")} />

                  {/* ── LOWER BACK ── */}
                  <rect x="66" y="134" width="68" height="54" rx="4" {...ev("lower_back")} />
                </>
              )}

              {/* ── LEFT LEG ── tapered path */}
              <path d="M72,194 C68,194 66,210 66,240 C66,270 68,310 72,340 C74,346 82,346 84,340 C88,310 90,270 90,240 C90,210 88,194 84,194 Z" {...ev("left_leg")} />
              {/* ── LEFT FOOT ── */}
              <ellipse cx="78" cy="350" rx="13" ry="6" {...ev("left_foot")} />

              {/* ── RIGHT LEG ── mirror */}
              <path d="M116,194 C112,194 110,210 110,240 C110,270 112,310 116,340 C118,346 126,346 128,340 C132,310 134,270 134,240 C134,210 132,194 128,194 Z" {...ev("right_leg")} />
              {/* ── RIGHT FOOT ── */}
              <ellipse cx="122" cy="350" rx="13" ry="6" {...ev("right_foot")} />

            </svg>
          </div>

          {/* Whole-body button */}
          <button
            type="button"
            onClick={() => handleRegionClick("general")}
            className={`w-full py-2.5 rounded-2xl border text-xs font-bold transition-all duration-200 cursor-pointer text-center ${
              selectedRegion === "general"
                ? "bg-[#ac4c28] border-[#ac4c28] text-white shadow-sm"
                : "bg-[#faf8f5] hover:bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            Whole body / general feeling
          </button>

          {selectedRegion && selectedRegion !== "general" && (
            <p className="text-xs text-[#ac4c28] font-bold text-center animate-fade-in">
              {REGION_LABELS[selectedRegion]} selected
            </p>
          )}
        </div>

        {/* ═══ RIGHT — Triage form ═══════════════════════════════ */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-7 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">

          {/* Step 2 — Symptoms */}
          <div className="space-y-3">
            <p className="text-[10px] font-black tracking-wider text-[#ac4c28] uppercase">Step 2</p>
            <h5 className="text-sm font-serif font-bold text-slate-800">
              {selectedRegion
                ? `${REGION_LABELS[selectedRegion]} — what are you feeling there?`
                : "Pick a body area to see symptoms"}
            </h5>
            {selectedRegion ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {REGION_SYMPTOMS[selectedRegion].map((symptom) => {
                  const on = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => toggleSymptom(symptom)}
                      className={`text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between text-xs font-semibold cursor-pointer ${
                        on ? "bg-[#faf3ed] border-[#f5e3d7] text-slate-800" : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <span>{symptom}</span>
                      <span className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 ${on ? "bg-[#ac4c28] border-[#ac4c28] text-white" : "border-slate-300"}`}>
                        {on && (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-2.5 h-2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic bg-slate-50 border border-slate-200/50 rounded-2xl p-4 text-center leading-relaxed">
                The diagram on the left will guide you. Tap any zone to load symptom indicators.
              </p>
            )}
          </div>

          {/* Step 3 — Severity */}
          <div className="space-y-3">
            <p className="text-[10px] font-black tracking-wider text-[#ac4c28] uppercase">Step 3</p>
            <h5 className="text-sm font-serif font-bold text-slate-800">How strong does it feel?</h5>
            <div className="flex flex-wrap gap-2.5">
              {(["Mild", "Moderate", "Severe"] as const).map((l) => (
                <Chip key={l} label={l} active={severity === l} onClick={() => setSeverity(l)} />
              ))}
            </div>
          </div>

          {/* Step 4 — Duration */}
          <div className="space-y-3">
            <p className="text-[10px] font-black tracking-wider text-[#ac4c28] uppercase">Step 4</p>
            <h5 className="text-sm font-serif font-bold text-slate-800">How long has this been going on?</h5>
            <div className="flex flex-wrap gap-2.5">
              {(["Today", "Few days", "Over a week"] as const).map((t) => (
                <Chip key={t} label={t} active={duration === t} onClick={() => setDuration(t)} />
              ))}
            </div>
          </div>

          {/* Step 5 — Age */}
          <div className="space-y-3">
            <p className="text-[10px] font-black tracking-wider text-[#ac4c28] uppercase">Step 5</p>
            <h5 className="text-sm font-serif font-bold text-slate-800">Roughly how old are you?</h5>
            <div className="flex flex-wrap gap-2.5">
              {["Infant (0-1)", "Toddler (1-3)", "Child (4-11)", "Teen (12-17)", "Adult (18-40)", "Middle-aged (41-60)", "Senior (Over 60)"].map((a) => (
                <Chip key={a} label={a} active={ageGroup === a} onClick={() => setAgeGroup(a)} />
              ))}
            </div>
          </div>

          {/* Step 6 — Bio sex */}
          <div className="space-y-3">
            <p className="text-[10px] font-black tracking-wider text-[#ac4c28] uppercase">Step 6</p>
            <h5 className="text-sm font-serif font-bold text-slate-800">Biological sex and pregnancy status</h5>
            <div className="flex flex-wrap gap-2.5">
              {(["Male", "Female (Not Pregnant)", "Female (Pregnant)"] as const).map((s) => (
                <Chip key={s} label={s} active={biologicalSex === s} onClick={() => setBiologicalSex(s)} />
              ))}
            </div>
          </div>

          {/* Step 7 — Comorbidities */}
          <div className="space-y-3">
            <p className="text-[10px] font-black tracking-wider text-[#ac4c28] uppercase">Step 7</p>
            <h5 className="text-sm font-serif font-bold text-slate-800">Do you have any pre-existing conditions?</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {["Diabetes", "Hypertension / Heart Disease", "Asthma / COPD", "Immunocompromised (HIV, Chemo)"].map((c) => {
                const on = comorbidities.includes(c);
                return (
                  <button key={c} type="button" onClick={() => toggleComorbidity(c)}
                    className={`text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between text-xs font-semibold cursor-pointer ${on ? "bg-[#faf3ed] border-[#f5e3d7] text-slate-800" : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"}`}
                  >
                    <span>{c}</span>
                    <span className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 ${on ? "bg-[#ac4c28] border-[#ac4c28] text-white" : "border-slate-300"}`}>
                      {on && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-2.5 h-2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional free-text */}
          <div className="space-y-3">
            <p className="text-[10px] font-black tracking-wider text-[#ac4c28] uppercase">Optional</p>
            <h5 className="text-sm font-serif font-bold text-slate-800">Anything else you want to add?</h5>
            <textarea
              value={additionalText}
              onChange={(e) => setAdditionalText(e.target.value)}
              placeholder="In your own words..."
              className="w-full min-h-[96px] rounded-2xl border border-slate-200 p-4 text-xs font-medium focus:border-[#ac4c28] focus:ring-1 focus:ring-[#ac4c28] outline-none transition-all duration-200 resize-none text-slate-700 bg-slate-50/50"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex flex-col items-center space-y-3">
            <button type="submit" disabled={!isFormValid}
              className={`w-full py-4 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isFormValid
                  ? "bg-[#ac4c28] hover:bg-[#913d1e] text-white shadow-[#ac4c28]/10 hover:shadow-lg active:scale-[0.99]"
                  : "bg-slate-100 text-slate-400 border border-slate-200 shadow-none cursor-not-allowed"
              }`}
            >
              See my assessment
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wide text-center">
              {!isFormValid ? "Pick a region, symptoms, severity, duration, age, and sex." : "Ready to compile structured symptom data for clinical triage."}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
