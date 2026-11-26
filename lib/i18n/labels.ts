/**
 * Pocket Health Worker — Pidgin for values that are also data
 *
 * Body-map options (symptoms, severity, age…) are sent to the rules engine and the AI as
 * English strings, so the VALUES never change; only what is shown is translated here.
 * FIXED_SENTENCES covers every fixed sentence the rules engine, the red-flag list and the
 * server fallback can produce (a test checks none is missing).
 */

export const PCM_LABELS: Record<string, string> = {
  // Severity / duration
  Mild: "Small (mild)",
  Moderate: "Medium (moderate)",
  Severe: "Strong well well (severe)",
  Today: "Today",
  "Few days": "Some days",
  "Over a week": "Pass one week",

  // Age
  "Infant (0-1)": "Small baby (0-1)",
  "Toddler (1-3)": "Small pikin (1-3)",
  "Child (4-11)": "Pikin (4-11)",
  "Teen (12-17)": "Teenager (12-17)",
  "Adult (18-40)": "Adult (18-40)",
  "Middle-aged (41-60)": "Middle age (41-60)",
  "Senior (Over 60)": "Old person (pass 60)",

  // Sex / pregnancy
  Male: "Man",
  "Female (Not Pregnant)": "Woman (no belle)",
  "Female (Pregnant)": "Woman (get belle)",

  // Long-term conditions
  Diabetes: "Diabetes (sugar)",
  "Hypertension / Heart Disease": "High BP / heart sickness",
  "Asthma / COPD": "Asthma / COPD",
  "Immunocompromised (HIV, Chemo)": "Weak body defence (HIV, chemo)",
  "Sickle cell disease": "Sickle cell",

  // Regions
  "Head & face": "Head & face",
  "Throat & neck": "Throat & neck",
  Chest: "Chest",
  "Belly & stomach": "Belle & stomach",
  "Upper back": "Top back",
  "Lower back": "Waist / lower back",
  "Left arm": "Left arm",
  "Right arm": "Right arm",
  "Left hand & fingers": "Left hand & finger",
  "Right hand & fingers": "Right hand & finger",
  "Left leg": "Left leg",
  "Right leg": "Right leg",
  "Left foot & toes": "Left foot & toe",
  "Right foot & toes": "Right foot & toe",
  "Whole body / general": "Whole body",

  // Symptoms
  Headache: "Head dey pain (headache)",
  "Dizziness / Lightheadedness": "Head dey turn (dizzy)",
  Migraine: "Migraine (strong head pain)",
  "Vision issues / Blurring": "Eye no dey see well / blur",
  Fever: "Body dey hot (fever)",
  "Pulling at ears (child)": "Pikin dey pull ear",
  "Sunken fontanelle (infant)": "Soft top of baby head don sink",
  "Sore throat": "Throat dey pain",
  "Difficulty swallowing": "E hard to swallow",
  "Stiff neck": "Neck don stiff",
  "Swollen glands": "Glands don swell",
  "Chest pain / Tightness": "Chest dey pain / tight",
  "Breathing difficulty / Shortness of breath": "E hard to breathe",
  "Persistent cough": "Cough wey no dey stop",
  "Heart palpitations": "Heart dey beat fast / jump",
  "Grunting / working hard to breathe (child)": "Pikin dey grunt / struggle to breathe",
  "Stomach pain / Cramps": "Stomach dey pain / cramp",
  "Nausea / Vomiting": "Vomit dey catch me / vomiting",
  Diarrhoea: "Running stomach (diarrhoea)",
  "Bloating / Gas": "Belle don swell / gas",
  "Loss of appetite": "Food no dey sweet me",
  "Hard/swollen belly": "Belle hard / don swell",
  "Bleeding from the vagina": "Blood dey come from private part (vagina)",
  "Upper back pain": "Top back dey pain",
  "Shoulder blade pain": "Shoulder blade dey pain",
  "Neck stiffness radiating down": "Neck stiff, pain dey go down",
  "Spinal tension": "Spine tight",
  "Lower back pain": "Waist / lower back dey pain",
  "Sciatica / Shooting leg pain": "Pain dey shoot go leg (sciatica)",
  "Difficulty bending": "E hard to bend",
  "Spinal stiffness": "Spine stiff",
  "Numbness / Tingling": "E dey numb / tingle",
  "Joint pain / Stiffness": "Joint dey pain / stiff",
  "Muscle weakness": "Muscle no get power",
  Swelling: "E don swell",
  "Non-blanching rash (meningitis flag)": "Rash wey no dey fade when you press glass on am",
  "Finger pain / Stiffness": "Finger dey pain / stiff",
  "Hand swelling": "Hand don swell",
  "Joint pain": "Joint dey pain",
  "Leg swelling": "Leg don swell",
  "Knee / Joint pain": "Knee / joint dey pain",
  "Muscle cramps": "Muscle dey cramp",
  "Toe swelling / Pain": "Toe don swell / dey pain",
  "Ankle pain": "Ankle dey pain",
  "Foot pain": "Foot dey pain",
  "High fever": "Body dey hot well well (high fever)",
  "Fatigue / General weakness": "Body weak / tire",
  "Body aches / Muscle pain": "Body dey pain",
  "Chills / Shivering": "Body dey shake / cold dey catch am",
  "Weight loss": "Body dey lose weight",
  "Inconsolable crying (infant)": "Baby dey cry, e no gree stop",
  "Refusal to feed / lethargy (infant/child)": "Pikin no gree eat / body no get power",
};

/** Fixed sentences from the rules engine, red-flag messages and the server fallback. */
export const FIXED_SENTENCES: Record<string, string> = {
  // Rules engine — RED
  "This may be an emergency. Get help now.": "This fit be emergency. Get help now now.",
  "A baby under one year with these signs needs a health worker immediately.":
    "Baby wey never reach one year, wey get these signs, need health worker now now.",
  "These are danger signs in pregnancy and need urgent care for mother and baby.":
    "These na danger signs for pregnancy. Mama and baby need care quick quick.",
  "Severe symptoms in this part of the body need urgent medical evaluation.":
    "Strong sickness for this part of the body need make doctor check am quick.",
  "Severe symptoms in a baby, older person, pregnant woman or someone with a weak immune system need urgent evaluation.":
    "Strong sickness for baby, old person, pregnant woman or person wey body defence weak, need quick check.",
  "Go to the nearest hospital emergency department now.": "Go the nearest hospital emergency now now.",
  "Do not wait to see if it gets better.": "No wait make e better by itself.",

  // Rules engine — YELLOW
  "See a health worker within 1–2 days.": "See health worker inside 1–2 days.",
  "Visit a Primary Health Centre (PHC), clinic or hospital within the next 1–2 days.":
    "Go Primary Health Centre (PHC), clinic or hospital inside the next 1–2 days.",
  "Symptoms in this part of the body can sometimes be serious.":
    "Sickness for this part of the body fit serious sometimes.",
  "It may not be an emergency, but a health worker should check it.":
    "E fit no be emergency, but make health worker check am.",
  "Write down your symptoms, when they started, and what makes them better or worse.":
    "Write down how you dey feel, when e start, and wetin dey make am better or worse.",
  "It gets worse quickly": "E dey worse quick quick",
  "A fever starts or rises": "Body hot start, or e dey rise",
  "New pain, swelling, or difficulty breathing": "New pain, swelling, or e hard to breathe",
  "Confusion or unusual sleepiness": "Confusion, or sleep dey catch am anyhow",
  "Any danger sign — go to hospital immediately": "Any danger sign — go hospital now now",

  // Rules engine — GREEN
  "You can likely look after this at home for now.": "You fit take care of this one for house for now.",
  "Rest, drink plenty of water, and keep an eye on how you feel.":
    "Rest, drink plenty water, and dey watch how you dey feel.",
  "Do not start any medicine unless a health worker or pharmacist advises it.":
    "No start any medicine unless health worker or pharmacist tell you.",
  "Headache becomes severe or is the worst you have ever had":
    "Headache come strong well well, or e worse pass any one wey you don get before",
  "Fever, stiff neck, confusion, or vomiting appears": "Body hot, neck stiff, confusion, or vomiting start",
  "Blurred vision, weakness, or trouble speaking": "Eye dey blur, body weak, or e hard to talk",
  "It lasts more than 3 days or keeps coming back": "E pass 3 days, or e dey come back again and again",
  "Symptoms get worse or spread": "E dey worse or e dey spread",
  "New symptoms appear (fever, swelling, breathing trouble)":
    "New sign show (body hot, swelling, breathing wahala)",
  "Symptoms last longer than expected": "E dey last pass how e suppose",
  "You feel worried — trust your instincts": "E dey worry you — trust your mind",

  // Red-flag messages (data/red-flags.json)
  "Difficulty breathing can be life-threatening.": "When breathing hard, e fit kill person.",
  "Chest pain may signal a heart or lung emergency.": "Chest pain fit mean heart or lung emergency.",
  "Loss of consciousness needs urgent care.": "When person faint or no dey respond, e need care now now.",
  "Seizures require emergency attention.": "Convulsion (fits) need emergency care.",
  "Sudden weakness, drooping, or slurred speech may be a stroke.":
    "Sudden body weakness, face wey twist, or talk wey no clear fit be stroke.",
  "Severe bleeding is an emergency.": "Blood wey dey rush well well na emergency.",
  "Coughing or vomiting blood needs urgent care.": "To cough or vomit blood need care quick quick.",
  "A stiff neck with high fever can be serious.": "Stiff neck plus high fever fit serious well well.",
  "Swelling of the face or throat is a medical emergency.": "When face or throat dey swell, na emergency.",
  "Severe dehydration needs urgent treatment.": "When water don finish for body well well, e need treatment quick.",
  "Suspected poisoning or overdose is an emergency.":
    "If you think say na poison or too much medicine, na emergency.",
  "A young baby with these signs needs immediate care.": "Small baby wey get these signs need care now now.",
  "These pregnancy signs need urgent attention.": "These pregnancy signs need care quick quick.",

  // Server fallback (app/api/triage/route.ts)
  "I could not complete a full assessment just now.": "I no fit finish the full check now.",
  "If you are worried about your health, please see a health worker.":
    "If your health dey worry you, abeg go see health worker.",
  "The assessment service did not respond properly, so we are defaulting to caution.":
    "The check service no answer well, so we dey take am careful.",
  "Visit a Primary Health Centre or clinic as a precaution.":
    "Go Primary Health Centre or clinic make you dey on the safe side.",
  "Do not delay if symptoms feel serious.": "No delay if e be like say e serious.",
  "This is informational guidance only, not a diagnosis or a substitute for professional medical care.":
    "Na information guidance only, no be diagnosis, and e no fit replace proper doctor care.",
};

/** Splits text into sentences, keeping the closing punctuation. */
export function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean);
}
