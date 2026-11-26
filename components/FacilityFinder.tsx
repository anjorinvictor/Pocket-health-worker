/**
 * Pocket Health Worker — Hospital finder (shared)
 *
 * State picker + "use my location" (GPS works with no internet) + hospital names for
 * that state. No phone numbers: none were sourced (see data/facilities.ts). The call
 * action is 112, plus a state ambulance line only for the selected state.
 *
 * Nearest care: our list is only the big public hospitals per state, so after "use my
 * location" we also offer Google Maps at the person's exact position, which shows every
 * nearby hospital and clinic with live data (needs internet). Each listed hospital gets a
 * "Directions" link. We never invent coordinates or numbers.
 * The chosen state and position live in memory only — nothing is stored.
 */

"use client";

import { useId, useState } from "react";
import { FACILITIES, STATES } from "@/data/facilities";
import { NATIONAL_EMERGENCY, STATE_AMBULANCE } from "@/data/emergency-lines";
import { nearestState } from "@/lib/geo/nearestState";
import { PhoneIcon, PinIcon } from "./Icons";
import { useI18n } from "@/lib/i18n";

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
  heading,
}: Props) {
  const { t } = useI18n();
  const selectId = useId();
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const useLocation = () => {
    setGeoError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError(t("geoUnavailable"));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(here);
        onStateChange(nearestState(here, STATES));
        setLocating(false);
      },
      () => {
        setGeoError(t("geoFailed"));
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  };

  const ambulance = selectedState ? STATE_AMBULANCE[selectedState] : undefined;
  const list = selectedState ? FACILITIES[selectedState] ?? [] : [];
  const nearMeUrl = coords
    ? `https://www.google.com/maps/search/hospital/@${coords.lat.toFixed(5)},${coords.lng.toFixed(5)},14z`
    : "https://www.google.com/maps/search/hospital+near+me";
  const directionsUrl = (name: string, town: string) =>
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${name}, ${town}, ${selectedState}, Nigeria`)}${
      coords ? `&origin=${coords.lat.toFixed(5)},${coords.lng.toFixed(5)}` : ""
    }`;

  return (
    <section aria-labelledby={`${selectId}-h`} className="space-y-4">
      <h2 id={`${selectId}-h`} className="text-xl font-bold">{heading ?? t("findHospital")}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
        <div>
          <label htmlFor={selectId} className="block text-sm font-semibold text-muted mb-1.5">
            {t("yourState")}
          </label>
          <select
            id={selectId}
            className="field cursor-pointer"
            value={selectedState ?? ""}
            onChange={(e) => onStateChange(e.target.value)}
          >
            <option value="" disabled>{t("chooseState")}</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s === "Abuja" ? "Abuja (FCT)" : s}</option>
            ))}
          </select>
        </div>
        <button type="button" onClick={useLocation} disabled={locating} className="btn btn-secondary sm:self-end">
          <PinIcon />
          {locating ? t("findingState") : t("useMyLocation")}
        </button>
      </div>

      {geoError && <p role="status" className="text-sm text-clinic bg-clinic-soft rounded-xl px-3 py-2">{geoError}</p>}

      <a href={nearMeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full">
        <PinIcon /> {coords ? t("mapNearMe") : t("mapSearch")}
      </a>
      <p className="text-sm text-muted -mt-2">{coords ? t("mapNoteHere") : t("mapNote")}</p>

      {showCallButtons && (
        <div className="grid grid-cols-1 gap-2">
          <a href={`tel:${NATIONAL_EMERGENCY.tel}`} className="btn btn-danger w-full">
            <PhoneIcon /> {t("call112Free", { n: NATIONAL_EMERGENCY.display })}
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
            <li key={f.name} className="rounded-xl bg-sand px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold leading-snug">{f.name}</p>
                <p className="text-sm text-muted">{f.town}, {selectedState}</p>
              </div>
              <a
                href={directionsUrl(f.name, f.town)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-quiet shrink-0 px-2"
                aria-label={t("directionsTo", { name: f.name })}
              >
                {t("directions")}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{t("chooseStateForList")}</p>
      )}

      <p className="text-sm text-muted">{t("hospitalListNote")}</p>
    </section>
  );
}
