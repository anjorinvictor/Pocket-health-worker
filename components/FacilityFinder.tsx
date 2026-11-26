/**
 * Pocket Health Worker — Hospital finder (shared)
 *
 * State picker + "use my location" (GPS works with no internet) + hospital names for
 * that state. No phone numbers: none were sourced (see data/facilities.ts). The call
 * action is 112, plus a state ambulance line only for the selected state.
 * The chosen state lives in memory only — nothing is stored.
 */

"use client";

import { useId, useState } from "react";
import { FACILITIES, STATES } from "@/data/facilities";
import { NATIONAL_EMERGENCY, STATE_AMBULANCE } from "@/data/emergency-lines";
import { nearestState } from "@/lib/geo/nearestState";
import { PhoneIcon, PinIcon } from "./Icons";

interface Props {
  selectedState: string | null;
  onStateChange: (state: string) => void;
  /** Show the call buttons inside the finder (off when EmergencyActions already shows them). */
  showCallButtons?: boolean;
  heading?: string;
}

export default function FacilityFinder({
  selectedState,
  onStateChange,
  showCallButtons = true,
  heading = "Find a hospital near you",
}: Props) {
  const selectId = useId();
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const useLocation = () => {
    setGeoError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Location isn't available on this phone. Please choose your state.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onStateChange(nearestState({ lat: pos.coords.latitude, lng: pos.coords.longitude }, STATES));
        setLocating(false);
      },
      () => {
        setGeoError("Couldn't get your location. Please choose your state.");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  };

  const ambulance = selectedState ? STATE_AMBULANCE[selectedState] : undefined;
  const list = selectedState ? FACILITIES[selectedState] ?? [] : [];

  return (
    <section aria-labelledby={`${selectId}-h`} className="space-y-4">
      <h2 id={`${selectId}-h`} className="text-xl font-bold">{heading}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
        <div>
          <label htmlFor={selectId} className="block text-sm font-semibold text-muted mb-1.5">
            Your state
          </label>
          <select
            id={selectId}
            className="field cursor-pointer"
            value={selectedState ?? ""}
            onChange={(e) => onStateChange(e.target.value)}
          >
            <option value="" disabled>Choose your state</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s === "Abuja" ? "Abuja (FCT)" : s}</option>
            ))}
          </select>
        </div>
        <button type="button" onClick={useLocation} disabled={locating} className="btn btn-secondary sm:self-end">
          <PinIcon />
          {locating ? "Finding your state…" : "Use my location"}
        </button>
      </div>

      {geoError && <p role="status" className="text-sm text-clinic bg-clinic-soft rounded-xl px-3 py-2">{geoError}</p>}

      {showCallButtons && (
        <div className="grid grid-cols-1 gap-2">
          <a href={`tel:${NATIONAL_EMERGENCY.tel}`} className="btn btn-danger w-full">
            <PhoneIcon /> Call {NATIONAL_EMERGENCY.display} · emergency (free)
          </a>
          {ambulance && (
            <a href={`tel:${ambulance.tel}`} className="btn btn-secondary w-full">
              <PhoneIcon /> {ambulance.label}: {ambulance.display}
            </a>
          )}
        </div>
      )}

      {selectedState ? (
        <ul className="space-y-2">
          {list.map((f) => (
            <li key={f.name} className="rounded-xl bg-sand px-4 py-3">
              <p className="font-semibold leading-snug">{f.name}</p>
              <p className="text-sm text-muted">{f.town}, {selectedState}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">Choose your state to see public hospitals with emergency care.</p>
      )}

      <p className="text-sm text-muted">
        We only list numbers we have checked. Call 112 and ask to be connected to the nearest hospital.
      </p>
    </section>
  );
}
