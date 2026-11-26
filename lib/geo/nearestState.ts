/**
 * Pocket Health Worker — Nearest-State Geolocation Helper
 *
 * Shared logic to map a device's GPS coordinates to the closest state present in a
 * facility directory. Works fully offline (GPS needs no internet) and contains only
 * real geographic reference points (a major city per state) — never facility data.
 *
 * Callers pass the list of states their directory actually contains, so we can never
 * select a state that has no facilities listed.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/** Approximate reference point (major city) for each supported state. */
export const STATE_CENTROIDS: Record<string, LatLng> = {
  Lagos: { lat: 6.5244, lng: 3.3792 },
  Abuja: { lat: 9.0765, lng: 7.3986 },
  Oyo: { lat: 7.3776, lng: 3.947 },
  Kano: { lat: 12.0022, lng: 8.592 },
  Rivers: { lat: 4.8156, lng: 7.0498 },
  Enugu: { lat: 6.4584, lng: 7.5464 },
  Kaduna: { lat: 10.5222, lng: 7.4383 },
  Edo: { lat: 6.335, lng: 5.6037 },
  Delta: { lat: 6.198, lng: 6.728 },
  Ondo: { lat: 7.2526, lng: 5.1931 },
  Anambra: { lat: 6.2109, lng: 7.0741 },
  Borno: { lat: 11.8311, lng: 13.151 },
  Osun: { lat: 7.7719, lng: 4.556 },
};

/** Great-circle distance (km) between two lat/lng points (Haversine). */
export function distanceKm(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Returns the state (from `availableStates`) whose reference point is closest to the
 * user. Only considers states we have coordinates for, and never returns a state that
 * isn't in the caller's directory.
 */
export function nearestState(point: LatLng, availableStates: string[]): string {
  let best = availableStates[0];
  let bestDist = Infinity;
  for (const state of availableStates) {
    const coords = STATE_CENTROIDS[state];
    if (!coords) continue;
    const d = distanceKm(point, coords);
    if (d < bestDist) {
      bestDist = d;
      best = state;
    }
  }
  return best;
}
