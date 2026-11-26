# Pocket Health Worker — project brief

Written by the product owner (Anjorin Olamide) from what the product does and how it looks. Statements about architecture were claims to verify; the **Stack** and **Verified state** sections below were rewritten on 2026-11-26 from reading the code.

## ⚠️ Timing constraint

The founder is pitching this app live at the AYEESSI "Pitch Your Startup Idea" event on **Friday 27 November 2026**, demoing the production deployment (https://pocket-health-worker.vercel.app/).

- Do not push to `main`, or trigger a production deploy, until the founder says the pitch is over.
- Work on a branch. Every branch gets a Vercel preview URL. Test there.
- If anything breaks production before Friday, roll back first, then investigate.

## What the product is

Pocket Health Worker (PHW) is a free, offline-capable web app (PWA) that gives Nigerians first-line health guidance when they can't reach a doctor.

A person either describes symptoms in their own words (chat) or taps where it hurts on a body map. They then answer simple questions: severity (mild / moderate / severe), duration (today / few days / over a week), age group (infant 0–1 up to senior 60+), biological sex and pregnancy status, and (in code today) optional pre-existing conditions.

They get one clear next step at one of three urgency levels: care at home, visit a clinic, or emergency now. Each step comes with who to call.

Positioning: "A calm hand for when you can't reach a doctor." Guidance, not diagnosis. Supports SDG 3.

## Who it's for

- Ordinary Nigerians, often non-technical, often on low-end Android phones.
- Weak or no signal; small, expensive data bundles.
- Night-time emergencies, when the health centre is closed and the hospital is far away.
- Users may be scared or rushed. Every screen must be calm, plain-language, and obvious.

Reference story: at 2 a.m., a mother whose 8-month-old has a high fever opens PHW on ₦100 of data. She taps the head, picks the symptoms, severity, duration and "Infant (0–1)", and gets "Emergency: go to hospital now" with 112 and an ambulance line. This exact flow must work flawlessly, including offline.

## Stack (verified 2026-11-26)

- **Next.js 16.2.6 (App Router, Turbopack), React 19.2.4, TypeScript 5, Tailwind CSS v4** (`@tailwindcss/postcss`). No UI library. One runtime dependency besides Next/React: `@google/genai`.
- **Single page app**: everything lives in `app/page.tsx`, a client component holding an `AppState` union (`welcome | chat | bodymap | result | offlineResult | crisis | emergency`). No routing between screens; refresh returns to welcome.
- **One API route**: `app/api/triage/route.ts` (POST, dynamic). Calls Gemini `gemini-2.5-flash` with `responseMimeType: application/json`, retries on 429.
- **Pipeline (online)**: client → `/api/triage` → `isCrisis(latest user msg)` → `checkRedFlags(all user text)` → Gemini → `parseGeminiResponse` → `mergeUrgency` (only re-raises to RED if a red flag matched — which can't happen at that point, because red flags already returned early) → `recommendedAction` overwritten with `data/facility-guidance.json` text.
- **Pipeline (offline)**: only when `navigator.onLine === false`. Body map → `runOfflineTriage` (`lib/triage/offlineTriage.ts`, rule-based). **Chat offline only runs crisis + red-flag checks, then tells the user it can't help** — no offline chat triage.
- **Safety layers (deterministic, keyword-based)**: `lib/safety/crisis.ts` (self-harm, with negation guard, Pidgin phrases), `lib/safety/redFlags.ts` + `data/red-flags.json` (13 danger-sign groups, Pidgin phrases), `lib/safety/normalize.ts`. These run before the AI **on free text only** — they do not look at the body-map structured fields (age group, severity, pregnancy).
- **PWA**: `public/sw.js` (hand-written; precaches `/`, manifest, icon, favicon; stale-while-revalidate for same-origin GETs; never caches `/api/triage`). `public/manifest.json`. Registered from `page.tsx`.
- **Data**: PHC directory is hard-coded **twice** (`components/ClinicalSidebar.tsx`, 12 states; `components/OfflineResultCard.tsx`, 13 states incl. Borno). Emergency/helpline numbers are hard-coded in `ResultCard.tsx`, `OfflineResultCard.tsx`, `CrisisSupport.tsx`.
- **Privacy**: no cookies, no storage, no DB. `lib/telemetry.ts` exists but is a no-op unless `TELEMETRY_ENABLED` / `NEXT_PUBLIC_TELEMETRY_ENABLED` is set, and then only `console.info`s categorical events. Symptom text **is** sent to Google Gemini when online (needed for AI triage; should be stated honestly).
- **Fonts/images**: system fonts only (Georgia serif, system sans). No web fonts. `public/luxury_medical_hero.png` (458 KB) is unused. Default Next SVGs (`next.svg`, `vercel.svg`, …) unused.
- **Deployed on Vercel** from GitHub `anjorinvictor/Pocket-health-worker`, branch `main`.

### Commands

| What | Command | State on 2026-11-26 |
|---|---|---|
| Dev | `npm run dev` | — |
| Build | `npm run build` | ✅ passes (TypeScript clean) |
| Lint | `npm run lint` | ❌ 3 errors, 1 warning (`setState` in effect in `page.tsx`; unescaped `'` in `ChatWindow.tsx`; unused `handleStart`) |
| Test | `npm test` (Vitest, `lib/**/*.test.ts`) | ✅ 61 tests pass — **but the tests are uncommitted** |

Env: `GEMINI_API_KEY` (in `.env.local`, git-ignored via `.env*`).

## Verified state (2026-11-26)

**Production ≠ local.** Production serves commit `191dc03` (`main` = `origin/main`). The working tree has large uncommitted changes (tests, Pidgin red-flags, service worker v2, geolocation "use my location", LASAMBUS number change, Connect-a-health-worker stub). None of that is live.

| Feature | Owner's status | What the code actually does |
|---|---|---|
| Landing page | Works | Works. Desktop-first split layout; tiny type (9–11 px) on mobile. |
| Chat triage | Works | Online works via Gemini. **Offline: no triage**, only danger-sign check. |
| Body map | Works | 14 regions + "whole body". Has an extra Step 7 "pre-existing conditions" (Diabetes is the first option). SVG regions are not keyboard-accessible. |
| Result screen | Works | Works. RED result always shows **LASAMBUS 767 (Lagos-only) to everyone**. |
| Emergency screen | Works | The deterministic red-flag screen (`screen: "emergency"`) shows **only a banner — no 112 button, no ambulance, no helpline**. Call buttons only appear on AI/offline RED result cards. |
| Data Saver | Not working | Toggle only exists inside the sidebar (visible on mobile only on the chat screen). When on: appends "be concise" to the Gemini system prompt (adds bytes upstream), lowers temperature, and on chat follow-ups **sends only the last 3 turns — which drops the original complaint**. No output cap, no change to what the phone downloads. Effectively no measurable saving. |
| NAFDAC check | Not working | Pure simulation: any 10+ digit PIN returns **"Status: GENUINE"** with an invented product (Coartem DS / Amartem). Dangerous — can tell someone a fake drug is genuine. Hard-codes Sproxil's 38353 only. |
| PHC directory | Works, verify | Phone numbers **appear fabricated** (repeating suffixes like `…1029`, `…2931` across different states). No sources in repo. Treat as unverified → must be removed or sourced. |
| Offline mode | Verify | Body-map flow works offline **only if `navigator.onLine` is false**. On weak signal (online but failing), fetch has no timeout and no fallback — user gets "Sorry, something went wrong". If Gemini errors, the server returns a generic **YELLOW** for every case (including an infant with fever). |

### Safety probe (deterministic layers, 2026-11-26)

| Case | Offline engine | Online deterministic gate |
|---|---|---|
| Infant (0–1), head, Fever, Severe (the 2 a.m. story) | RED ✅ | **none → Gemini decides** ❌ |
| Pregnant + "I am bleeding heavily" | **YELLOW** ❌ | **none** ❌ ("pregnant woman with heavy bleeding" does match) |
| Adult, head, Headache, Mild, Today | **YELLOW** (head is "high-risk region") — brief expects home care | none → Gemini |
| Adult 41–60, chest pain, Mild | RED ✅ | `chest_pain` ✅ |
| Severe + "Immunocompromised (HIV, Chemo)" | **YELLOW** — label mismatch: engine checks `"HIV/AIDS"`, body map sends `"Immunocompromised (HIV, Chemo)"`. Same for Hypertension/Asthma labels. Only "Diabetes" matches. |

### The diabetes question

"Diabetes" appears in exactly one input path: the body-map Step 7 checkbox. If it isn't ticked, the prompt literally says `Pre-existing Conditions: None reported.` Nothing else in the code injects diabetes. So either the tester ticked it (it's the first option, easy to hit), or Gemini invented it. The prompt never tells the model to use only stated facts, and the result is never checked against the input — both need fixing regardless. Additionally, Data Saver's 3-turn history cut can drop the original body-map summary on follow-ups, which invites invention.

## Status after branch `rebuild/mobile-safety` (2026-11-26)

The tables above describe `main` / production. On the branch:

- **Safety**: deterministic rules run on the phone first and as a server floor; any RED goes straight to the emergency screen (works offline). AI may raise, never lower. AI failure / timeout (20 s) → rules result, never a generic YELLOW. Grounding check (`lib/triage/grounding.ts`) rejects invented conditions, one corrective retry. Combo red flags (`matchAll`) in `data/red-flags.json`. All four required cases pass offline (tests + browser) — online they hit the same deterministic gate.
- **Emergency screen**: `EmergencyActions` everywhere RED appears — 112 first, LASAMBUS 767 only when Lagos is chosen, no-transport advice, hospital names.
- **Directory**: `data/facilities.ts`, names + towns only, no phone numbers (owner decision). Numbers live in `data/emergency-lines.ts` with sources.
- **NAFDAC**: `components/NafdacCheck.tsx` — `sms:` link to the user's own short code; Greenbook link with the NRN copied. No verdicts, no "simulate".
- **Data Saver**: header switch on every screen (memory only, resets on reload). Measured on the same request: response 1,080–1,291 B → 955 B, 3.0–3.9 s → 1.4 s; emergencies 0 B (answered on phone). First page load ≈ 213 KB gzip, cached by the service worker.
- **UI**: theme in `app/globals.css` (`@theme` + `.btn/.chip/.field/.card`), all text pairs WCAG AA; 360 px first, desktop two-column; body-map regions keyboard-operable.
- **Commands**: build ✅, lint ✅ (0 problems), tests ✅ 84.
- **Added 2026-11-26 (pre-pitch)**: Pidgin switch (`lib/i18n/`, memory only; AI answers in Pidgin via `PIDGIN_RULE`; rules/red-flag sentences translated, test-enforced); "What to do on the way" first aid per danger sign (`data/first-aid.ts`, no drugs/doses, test-enforced; **needs clinician review**); "Show this to the nurse" large-print English handover card (`components/NurseCard.tsx`, nothing stored); install card + PNG icons (`components/InstallCard.tsx`). Tests 112.
- **Open**: SURPIN toll-free number removed (unconfirmed); hospital names need owner verification; Vercel preview needs `GEMINI_API_KEY` set for the Preview environment or chat falls back to "see a clinic" (body map still works via rules); privacy copy now discloses that answers go to an AI service when online.

## Non-negotiables

Do not break or weaken any of these. If a change would touch them, stop and ask.

1. Safety layers stay on top of the AI. Danger signs always escalate to emergency, online or offline. The AI must never be able to downgrade a red-flag case.
2. Guidance, not diagnosis. Keep the disclaimers and the "informational only" label on possible causes. Never prescribe drugs or doses.
3. Never invent patient history. The AI must only use what the user actually entered.
4. No fake data in an emergency tool. Phone numbers, addresses and verification results must be real and sourced, or clearly removed. A wrong number at 2 a.m. is worse than no number.
5. Privacy promise is literal. No analytics, no cookies, no server-side storage of symptoms, no third-party trackers. Ask the owner before adding any browser storage.
6. Offline parity. Every core flow must have an offline path that works without the Gemini API.

## Sourced reference facts (researched 2026-11-26)

- **NAFDAC MAS**: scratch panel → text PIN free to the provider's short code → SMS reply genuine/fake. Approved providers and short codes per a NAFDAC policy list: PharmaSecure 38351, Sproxil 38353, Savanté 38120, UBQ-t/Kezzler 20966, M-Pedigree 1393. The short code is printed on the pack — never hard-code one. Source: policyvault.africa/wp-content/uploads/policy/NGA422.pdf
- **NAFDAC Greenbook**: greenbook.nafdac.gov.ng — registered-drug database, search by NRN/product name (form-based search; deep links not confirmed).
- **Emergency**: 112 is Nigeria's national toll-free emergency number. **LASAMBUS (Lagos only): 767 or 112**, both toll-free. Lagos warns residents to use only 767/112. Sources: gazettengr.com (Lagos govt), von.gov.ng (NEMSAS).
- **MANI**: 0809 111 6264, 0811 168 0686 (findahelpline.com, therapyroute.com). **SURPIN**: 0908 021 7555, 0903 440 0009 listed in directories; the 0800 078 7746 toll-free number in the code is **not confirmed** by a source that shows the digits.

## Work plan, in order

- **Step 0: Discovery** — done 2026-11-26 (this file). Steps 1–3 done on branch `rebuild/mobile-safety` (see Status above).
- **Step 1: Data Saver, made real** — measurably fewer bytes per check when on (measure in DevTools, "Slow 3G"): shorter prompts, capped output, no web fonts/non-essential images, no prefetch, no background requests, prefer the offline engine where equivalent. Show it's on. No storage without asking.
- **Step 2: NAFDAC check, honest and real** — scratch PIN + user-entered short code → `sms:` link (works offline); NRN → Greenbook search; remove "simulate" and every locally generated verdict; note that the scratch-PIN check is the stronger test.
- **Step 3: UI upgrade** — keep brand: espresso `#1C1412`, rust `#AD4A2B`, cream `#F6F2EB`, ember `#E58A5F` on dark; serif headings, clean sans body. Mobile-first at 360 px, then desktop. ≥48 px tap targets, WCAG AA, large plain type, one primary action per screen. Emergency unmistakable and never colour-only. Small JS, no heavy UI libraries, no gimmicky emoji.
- **Step 4+: Owner's list** (below).

## How to work in this repo

- Plan before coding; show the plan and wait for approval on anything non-trivial.
- Small, focused commits on a branch, each one buildable.
- After every change: `npm run build`, `npm run lint`, `npm test`, then click through the main flow at 360 px, online and with network set to Offline.
- Triage-logic changes must keep tests for: infant with fever + danger sign → emergency; pregnant woman with heavy bleeding → emergency; adult with mild headache since today → home care; chest pain in an adult over 40 → emergency. Each must give the same urgency online and offline.
- Never commit API keys. `GEMINI_API_KEY` lives in env vars only.
- Say what you verified and how.

## Owner's list

- Rebuild the UI so it is mobile-friendly and desktop-friendly; every button must work; the flow stays the same. (2026-11-26)
