/**
 * Pocket Health Worker — Emergency and support phone lines
 *
 * Every number here has a cited source. Do not add a number without one.
 * Checked 2026-11-26.
 */

export interface PhoneLine {
  label: string;
  /** Digits only, used for the tel: link. */
  tel: string;
  /** How the number is shown. */
  display: string;
  note?: string;
}

/**
 * National emergency number, toll-free, all networks.
 * Source: NEMSAS reaffirms 112 emergency medical line — https://von.gov.ng/nemsas-reaffirms-112-emergency-medical-line/
 */
export const NATIONAL_EMERGENCY: PhoneLine = {
  label: "National emergency",
  tel: "112",
  display: "112",
  note: "Free from any network",
};

/**
 * State ambulance lines. Shown ONLY when that state is selected.
 * Lagos (LASAMBUS): 767 or 112, both toll-free; Lagos warns residents to use only these.
 * Source: https://gazettengr.com/lagos-govt-urges-residents-to-use-emergency-lines-767-112/
 */
export const STATE_AMBULANCE: Record<string, PhoneLine> = {
  Lagos: {
    label: "Lagos State Ambulance (LASAMBUS)",
    tel: "767",
    display: "767",
    note: "Lagos only · free",
  },
};

/**
 * Mental health support lines.
 * MANI numbers: https://findahelpline.com/organizations/mentally-aware-nigeria-initiative-mani
 *               https://www.therapyroute.com/article/suicide-hotlines-and-crisis-lines-in-nigeria
 * SURPIN numbers: https://chat.findahelpline.com/organizations/surpin-helpline-nigeria
 * (The previously listed SURPIN toll-free 0800 078 7746 could not be confirmed, so it was removed.)
 */
export const MENTAL_HEALTH_LINES: Array<{ org: string; lines: PhoneLine[] }> = [
  {
    org: "Mentally Aware Nigeria Initiative (MANI)",
    lines: [
      { label: "MANI", tel: "08091116264", display: "0809 111 6264" },
      { label: "MANI", tel: "08111680686", display: "0811 168 0686" },
    ],
  },
  {
    org: "Suicide Research and Prevention Initiative (SURPIN)",
    lines: [
      { label: "SURPIN", tel: "09080217555", display: "0908 021 7555" },
      { label: "SURPIN", tel: "09034400009", display: "0903 440 0009" },
    ],
  },
];
