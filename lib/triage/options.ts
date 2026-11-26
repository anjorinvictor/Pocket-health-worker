/**
 * Pocket Health Worker — Body-map answer options (single source of truth)
 *
 * The body map shows these labels and the offline engine reasons over the very same
 * strings. Keeping them in one place stops the two drifting apart (previously the engine
 * checked "HIV/AIDS" while the body map sent "Immunocompromised (HIV, Chemo)", so that
 * condition was silently ignored).
 */

export const SEVERITIES = ["Mild", "Moderate", "Severe"] as const;
export const DURATIONS = ["Today", "Few days", "Over a week"] as const;

export const AGE_GROUPS = [
  "Infant (0-1)",
  "Toddler (1-3)",
  "Child (4-11)",
  "Teen (12-17)",
  "Adult (18-40)",
  "Middle-aged (41-60)",
  "Senior (Over 60)",
] as const;

export const SEX_OPTIONS = ["Male", "Female (Not Pregnant)", "Female (Pregnant)"] as const;

export const CONDITION = {
  diabetes: "Diabetes",
  heart: "Hypertension / Heart Disease",
  lungs: "Asthma / COPD",
  immune: "Immunocompromised (HIV, Chemo)",
  sickle: "Sickle cell disease",
} as const;

export const CONDITIONS: string[] = Object.values(CONDITION);

export const INFANT = "Infant (0-1)";
export const PREGNANT = "Female (Pregnant)";

/** Body-map region ids and the names people see (also used on the nurse card). */
export const REGION_LABELS: Record<string, string> = {
  head: "Head & face", neck: "Throat & neck", chest: "Chest", abdomen: "Belly & stomach",
  upper_back: "Upper back", lower_back: "Lower back",
  left_arm: "Left arm", right_arm: "Right arm", left_hand: "Left hand & fingers", right_hand: "Right hand & fingers",
  left_leg: "Left leg", right_leg: "Right leg", left_foot: "Left foot & toes", right_foot: "Right foot & toes",
  general: "Whole body / general",
};
