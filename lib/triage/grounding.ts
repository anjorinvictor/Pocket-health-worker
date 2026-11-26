/**
 * Pocket Health Worker — Grounding check (no invented patient history)
 *
 * The AI must only use facts the person actually entered. In testing, an infant with a
 * headache was described as having "a pre-existing condition of diabetes" although
 * diabetes was never entered. This module catches that class of error deterministically:
 * if the assessment or reasoning ASSERTS a condition (not merely lists it as a possibility)
 * and the person never mentioned it, the result is rejected.
 */

/** Conditions the model must never assert unless the user stated them. */
const CONDITIONS: Array<{ label: string; terms: string[] }> = [
  { label: "diabetes", terms: ["diabet", "blood sugar"] },
  { label: "hypertension", terms: ["hypertens", "high blood pressure"] },
  { label: "heart disease", terms: ["heart disease", "heart condition", "cardiac condition"] },
  { label: "asthma", terms: ["asthma"] },
  { label: "COPD", terms: ["copd"] },
  { label: "HIV", terms: ["hiv", "immunocompromis"] },
  { label: "sickle cell", terms: ["sickle"] },
  { label: "cancer", terms: ["cancer", "chemo"] },
  { label: "epilepsy", terms: ["epilep"] },
  { label: "kidney disease", terms: ["kidney disease", "renal disease"] },
  { label: "tuberculosis", terms: ["tuberculosis"] },
  { label: "pregnancy", terms: ["pregnan"] },
];

/**
 * Words that, shortly before a condition, mean the model is ASSERTING it as the
 * person's history rather than offering a possibility.
 */
const ASSERTION = /\b(has|have|having|had|with a|known|history of|pre-?existing|underlying|existing|diagnosed|suffers?|suffering|living with|condition of)\b/;

/** Hedges that make a nearby mention a possibility, which is allowed. */
const HEDGE = /\b(may|might|could|possib\w*|suggest\w*|rule out|consider\w*|such as|including|like|or|risk of|signs? of|check for|test for|whether|if)\b/;

function userMentions(userText: string, terms: string[]): boolean {
  // Neither "Female (Not Pregnant)" nor the body-map field label
  // "Biological Sex & Pregnancy:" counts as the user mentioning pregnancy.
  const t = userText
    .toLowerCase()
    .replace(/(not|non)[\s-]pregnant/g, " ")
    .replace(/biological sex & pregnancy:/g, " ");
  return terms.some((term) => t.includes(term));
}

/**
 * Returns the conditions the AI asserted as fact that the user never entered.
 * @param aiText assessment + reasoning from the model
 * @param userText everything the user typed or selected
 */
export function findInventedConditions(aiText: string, userText: string): string[] {
  const text = aiText.toLowerCase();
  const invented: string[] = [];

  for (const { label, terms } of CONDITIONS) {
    if (userMentions(userText, terms)) continue;
    const found = terms.some((term) => {
      // Word-start match so "hiv" does not hit "shivering".
      // Terms are plain lower-case words (see CONDITIONS), so no regex escaping is needed.
      const re = new RegExp(`\\b${term}`, "g");
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        // Look back only within the current sentence, at most 60 characters.
        const window = text.slice(Math.max(0, m.index - 60), m.index);
        const sentence = window.split(/[.!?;\n]/).pop() ?? "";
        if (ASSERTION.test(sentence) && !HEDGE.test(sentence)) return true;
      }
      return false;
    });
    if (found) invented.push(label);
  }
  return invented;
}
