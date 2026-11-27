/**
 * Pocket Health Worker — clinic alert (DEMO).
 *
 * Prototype of "alert the nearest clinic" for the pitch. Messages travel between two windows
 * of the same browser on one device (BroadcastChannel): the app (opened with ?demo=1) and the
 * clinic dashboard (/responder). Nothing goes over the internet and nothing is stored.
 *
 * A real service needs: consent before sending, a server that routes to registered facilities
 * within a radius, SMS fallback for facilities without the dashboard open, delivery receipts,
 * deletion of alerts after the event, and NDPA (Nigeria Data Protection Act 2023) compliance.
 */

export const RESPONDER_CHANNEL = "phw-responder-demo";

/** Demo facility the dashboard plays. Coordinates are approximate (UNILAG, Akoka campus). */
export const DEMO_FACILITY = {
  name: "UNILAG Medical Centre",
  lat: 6.5158,
  lng: 3.3896,
  radiusKm: 2,
};

/** Used only when the phone cannot give a location; always labelled "demo location". */
export const DEMO_PATIENT_LOCATION = { lat: 6.5189, lng: 3.3858, accuracy: 50 };

export interface AlertLocation {
  lat: number;
  lng: number;
  /** Metres. */
  accuracy: number;
  demo: boolean;
}

export interface ClinicAlert {
  type: "alert";
  id: string;
  sentAt: string;
  /** Danger sign (English, for staff). */
  finding: string;
  sign?: string;
  age?: string;
  sex?: string;
  region?: string;
  symptoms: string[];
  words: string[];
  location: AlertLocation;
}

export type ResponderMessage =
  | ClinicAlert
  | { type: "ack"; id: string; facility: string }
  | { type: "cancel"; id: string };

export function openChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  return new BroadcastChannel(RESPONDER_CHANNEL);
}

export function newAlertId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `a-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Great-circle distance in km. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
