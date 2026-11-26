/**
 * Pocket Health Worker — "What to do on the way" (first aid while getting to care)
 *
 * Shown under the call buttons on every emergency screen, chosen by the danger sign that
 * fired. Works offline (plain data). Rules for this file:
 *  - First aid only. NEVER name a medicine or a dose (non-negotiable 2).
 *  - Every list ends in getting care; nothing here replaces going now.
 *  - Calls out harmful home remedies common in Nigeria (palm oil, urine, kerosene, agbo,
 *    sand on wounds), because doing nothing harmful is half of good first aid.
 *
 * Written 2026-11-26 from widely published lay first-aid guidance: IFRC International
 * First Aid, Resuscitation and Education Guidelines 2020; WHO IMCI general danger signs
 * (sick child); WHO antenatal danger signs; hands-only CPR (100–120 pushes a minute).
 * REVIEW REQUIRED: a Nigerian clinician must check this text before public launch.
 */

export type FirstAidId =
  | "breathing" | "chest_pain" | "unconscious" | "seizure" | "stroke" | "bleeding"
  | "coughing_blood" | "meningitis" | "allergic" | "dehydration" | "poisoning"
  | "infant" | "pregnancy" | "general";

interface Steps {
  en: string[];
  pcm: string[];
}

const CPR_EN = "If they stop breathing, call 112, then push hard and fast in the middle of the chest, about 2 pushes a second, until help comes.";
const CPR_PCM = "If e stop to breathe, call 112, then press hard and fast for middle of the chest, like 2 times every second, till help come.";

export const FIRST_AID: Record<FirstAidId, Steps> = {
  breathing: {
    en: [
      "Help them sit up, leaning a little forward. Do not lay them flat.",
      "Loosen tight clothes and let fresh air in.",
      "Stay calm and keep them calm: fear makes breathing harder.",
      "If their lips turn blue or they cannot speak, call 112 now.",
    ],
    pcm: [
      "Help am sit up, make e lean small forward. No make am lie down flat.",
      "Loose tight cloth and make fresh air enter.",
      "Calm down and help am calm down: fear dey make breathing harder.",
      "If e lips turn blue or e no fit talk, call 112 now now.",
    ],
  },
  chest_pain: {
    en: [
      "Stop all activity. Sit them down to rest in the position they find easiest.",
      "Loosen tight clothing.",
      "Do not let them walk far, climb stairs, or drive themselves to hospital.",
      CPR_EN,
    ],
    pcm: [
      "Make am stop everything. Make am sit down rest, the way wey e comfortable pass.",
      "Loose tight cloth.",
      "No let am waka far, climb stairs, or drive himself go hospital.",
      CPR_PCM,
    ],
  },
  unconscious: {
    en: [
      "Check if they are breathing: watch the chest and listen at the mouth.",
      "If they are breathing, roll them onto their side with the head tilted back, so the airway stays open.",
      CPR_EN,
      "Do not pour water on them or give anything by mouth.",
    ],
    pcm: [
      "Check if e dey breathe: look the chest, put your ear near the mouth.",
      "If e dey breathe, turn am lie for one side, make the head bend back small so breath fit pass.",
      CPR_PCM,
      "No pour water for am body or give am anything for mouth.",
    ],
  },
  seizure: {
    en: [
      "Move hard or sharp things away and put something soft under the head.",
      "Do not hold them down. Put nothing in the mouth: no spoon, no finger, no palm oil, no urine.",
      "When the shaking stops, roll them onto their side and stay with them.",
      "If it lasts more than 5 minutes, or another one starts, call 112.",
    ],
    pcm: [
      "Move hard or sharp things comot, put soft thing under the head.",
      "No hold am down. No put anything for mouth: no spoon, no finger, no palm oil, no urine.",
      "When the shaking stop, turn am lie for one side and stay with am.",
      "If e pass 5 minutes, or another one start, call 112.",
    ],
  },
  stroke: {
    en: [
      "Note the time the signs started and tell the hospital: it changes the treatment.",
      "Give no food or drink: swallowing may not be safe.",
      "If they are drowsy, lay them on their side.",
      "Go now. With a stroke, every minute counts.",
    ],
    pcm: [
      "Note the time wey the signs start and tell the hospital: e dey change the treatment.",
      "No give food or drink: e fit no swallow well.",
      "If sleep dey catch am, make am lie for one side.",
      "Go now now. For stroke, every minute matter.",
    ],
  },
  bleeding: {
    en: [
      "Press firmly on the wound with a clean cloth, and keep pressing.",
      "If blood soaks through, put more cloth on top. Do not remove the first one.",
      "If it is an arm or leg, raise it above the heart if you can.",
      "Do not put sand, ash, herbs or anything else on the wound.",
      "Lay the person down and keep them warm.",
    ],
    pcm: [
      "Press the wound well well with clean cloth, no stop to press.",
      "If blood soak the cloth, put another cloth on top. No remove the first one.",
      "If na hand or leg, raise am up pass the heart if you fit.",
      "No put sand, ash, herbs or any other thing for the wound.",
      "Make the person lie down and keep am warm.",
    ],
  },
  coughing_blood: {
    en: [
      "Keep them sitting up or lying on their side, so blood does not block breathing.",
      "Give no food or drink.",
      "If you can, note how much blood and its colour (bright red or dark), and tell the hospital.",
    ],
    pcm: [
      "Make am sit up or lie for one side, so blood no go block breath.",
      "No give food or drink.",
      "If you fit, note how much blood and the colour (bright red or dark), and tell the hospital.",
    ],
  },
  meningitis: {
    en: [
      "Go now: this can get worse within hours.",
      "If light hurts their eyes, keep them in a quiet, dim place on the way.",
      "Do not give herbs or concoctions.",
      "Tell the hospital about the stiff neck, any rash, and when the fever started.",
    ],
    pcm: [
      "Go now now: e fit worse inside few hours.",
      "If light dey pain e eye, keep am for quiet place wey no too bright for road.",
      "No give herbs or agbo.",
      "Tell the hospital about the stiff neck, any rash, and when the body hot start.",
    ],
  },
  allergic: {
    en: [
      "If breathing is hard, help them sit up. If they feel faint, lay them down with legs raised.",
      "Keep them away from what caused it, if you know (a food, a sting, a new medicine). Do not make them vomit.",
      "Go now: a swelling throat can block breathing fast.",
      CPR_EN,
    ],
    pcm: [
      "If breathing hard, help am sit up. If e wan faint, make am lie down, raise the legs.",
      "Keep am far from wetin cause am, if you know (food, insect sting, new medicine). No make am vomit.",
      "Go now now: throat wey dey swell fit block breath quick.",
      CPR_PCM,
    ],
  },
  dehydration: {
    en: [
      "If they are awake and can swallow, give small sips of clean water, often.",
      "For a baby: keep breastfeeding, often.",
      "If they are very drowsy or cannot swallow, give nothing by mouth.",
      "Keep them cool and out of the sun on the way.",
    ],
    pcm: [
      "If e dey awake and e fit swallow, dey give am small small clean water, many times.",
      "For baby: continue to breastfeed, many times.",
      "If sleep dey catch am well well or e no fit swallow, no give am anything for mouth.",
      "Keep am for cool place, comot am for sun for road.",
    ],
  },
  poisoning: {
    en: [
      "Do not make them vomit. Do not give palm oil, milk or anything else.",
      "Take the container, the pills or the plant with you to the hospital.",
      "If it is on the skin or in the eyes, rinse with plenty of clean water.",
      "If they are drowsy, lay them on their side. If they stop breathing, call 112.",
    ],
    pcm: [
      "No make am vomit. No give palm oil, milk or any other thing.",
      "Carry the container, the drugs or the leaf go hospital.",
      "If e touch skin or enter eye, wash am with plenty clean water.",
      "If sleep dey catch am, make am lie for one side. If e stop to breathe, call 112.",
    ],
  },
  infant: {
    en: [
      "Keep the baby with you and go now.",
      "If the baby feels hot, take off extra clothes and wrapping. Do not use cold water or ice, and do not rub with alcohol, kerosene or herbs.",
      "Keep breastfeeding on the way if the baby can feed.",
      "If the baby has a fit, lay them on their side. Put nothing in the mouth.",
      "If the baby stops breathing or turns blue, call 112 now.",
    ],
    pcm: [
      "Carry the baby with you, go now now.",
      "If baby body dey hot, comot extra cloth and wrapper. No use cold water or ice, and no rub am with alcohol, kerosene or agbo.",
      "Continue to breastfeed for road if baby fit suck.",
      "If baby dey convulse, make am lie for one side. No put anything for mouth.",
      "If baby stop to breathe or turn blue, call 112 now now.",
    ],
  },
  pregnancy: {
    en: [
      "Do not go alone. Take someone with you.",
      "While you wait for transport, lie on your left side.",
      "If you are bleeding, use pads and bring extra. Put nothing inside the vagina.",
      "Bring your antenatal card. Do not take herbs or concoctions.",
    ],
    pcm: [
      "No go alone. Carry person follow you.",
      "While you dey wait for motor, lie down for your left side.",
      "If blood dey come, use pad and carry extra. No put anything inside your private part.",
      "Carry your antenatal card. No drink agbo or any concoction.",
    ],
  },
  general: {
    en: [
      "Keep the person still, comfortable and warm.",
      "Do not give herbs, concoctions or medicine unless a health worker says so.",
      "Bring their medicines (with the packs) and any hospital card.",
      "Note when it started and what has changed, and tell the hospital.",
      "If they stop breathing or will not wake up, call 112 now.",
    ],
    pcm: [
      "Make the person rest, comfortable and warm.",
      "No give herbs, agbo or medicine unless health worker talk am.",
      "Carry the drugs wey e dey take (with the packs) and any hospital card.",
      "Note when e start and wetin don change, and tell the hospital.",
      "If e stop to breathe or e no wan wake, call 112 now now.",
    ],
  },
};

/** Danger-sign id (red flag or rules) → first-aid list. Unknown ids get the general list. */
export function firstAidFor(sign?: string): FirstAidId {
  return sign && sign in FIRST_AID ? (sign as FirstAidId) : "general";
}
