/**
 * Pocket Health Worker — Hospitals with emergency care, by state
 *
 * NAMES AND TOWNS ONLY. The previous directory carried ~40 phone numbers and street
 * addresses with no source; many looked invented (the same endings repeated across states).
 * A wrong number at 2 a.m. is worse than no number, so they were removed on 2026-11-26
 * (owner decision). The single call action is 112 (national, toll-free), plus a state
 * ambulance line only where one is sourced (see data/emergency-lines.ts).
 *
 * These are well-known public teaching / federal / general hospitals, listed from public
 * knowledge. Owner to verify before adding any phone number back; every number added must
 * cite its source in a comment.
 */

export interface Facility {
  name: string;
  town: string;
}

export const FACILITIES: Record<string, Facility[]> = {
  Lagos: [
    { name: "Lagos University Teaching Hospital (LUTH)", town: "Idi-Araba, Surulere" },
    { name: "Lagos State University Teaching Hospital (LASUTH)", town: "Ikeja" },
    { name: "General Hospital Lagos", town: "Lagos Island" },
    { name: "Federal Medical Centre Ebute-Metta", town: "Ebute-Metta" },
    { name: "General Hospital Gbagada", town: "Gbagada" },
  ],
  Abuja: [
    { name: "National Hospital Abuja", town: "Central Business District" },
    { name: "University of Abuja Teaching Hospital", town: "Gwagwalada" },
    { name: "Wuse District Hospital", town: "Wuse" },
    { name: "Maitama District Hospital", town: "Maitama" },
    { name: "Asokoro District Hospital", town: "Asokoro" },
  ],
  Oyo: [
    { name: "University College Hospital (UCH)", town: "Ibadan" },
    { name: "Adeoyo Maternity Teaching Hospital", town: "Yemetu, Ibadan" },
    { name: "Ring Road State Hospital", town: "Ibadan" },
  ],
  Kano: [
    { name: "Aminu Kano Teaching Hospital", town: "Kano" },
    { name: "Murtala Muhammad Specialist Hospital", town: "Kano" },
  ],
  Rivers: [
    { name: "University of Port Harcourt Teaching Hospital (UPTH)", town: "Port Harcourt" },
    { name: "Rivers State University Teaching Hospital", town: "Port Harcourt" },
  ],
  Enugu: [
    { name: "University of Nigeria Teaching Hospital (UNTH)", town: "Ituku-Ozalla" },
    { name: "ESUT Teaching Hospital, Parklane", town: "Enugu" },
  ],
  Kaduna: [
    { name: "Barau Dikko Teaching Hospital", town: "Kaduna" },
    { name: "Ahmadu Bello University Teaching Hospital", town: "Shika, Zaria" },
  ],
  Edo: [
    { name: "University of Benin Teaching Hospital (UBTH)", town: "Benin City" },
    { name: "Irrua Specialist Teaching Hospital", town: "Irrua" },
  ],
  Delta: [
    { name: "Federal Medical Centre Asaba", town: "Asaba" },
    { name: "Central Hospital Warri", town: "Warri" },
    { name: "Delta State University Teaching Hospital", town: "Oghara" },
  ],
  Ondo: [
    { name: "Federal Medical Centre Owo", town: "Owo" },
    { name: "UNIMED Teaching Hospital", town: "Akure" },
  ],
  Anambra: [
    { name: "Nnamdi Azikiwe University Teaching Hospital (NAUTH)", town: "Nnewi" },
    { name: "Chukwuemeka Odumegwu Ojukwu University Teaching Hospital", town: "Amaku, Awka" },
  ],
  Borno: [
    { name: "University of Maiduguri Teaching Hospital (UMTH)", town: "Maiduguri" },
    { name: "State Specialist Hospital", town: "Maiduguri" },
  ],
  Osun: [
    { name: "Obafemi Awolowo University Teaching Hospitals Complex (OAUTHC)", town: "Ile-Ife" },
    { name: "UNIOSUN Teaching Hospital", town: "Osogbo" },
  ],
};

export const STATES = Object.keys(FACILITIES);
