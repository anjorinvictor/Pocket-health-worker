/**
 * Pocket Health Worker — Emergency actions (shared by every RED screen)
 *
 * 112 first and biggest; a state ambulance line only once that state is chosen
 * (LASAMBUS is Lagos-only); first aid for the danger sign while getting there; what to do
 * with no transport; nearby hospitals; and the mental-health line for people in distress.
 */

"use client";

import { MENTAL_HEALTH_LINES, NATIONAL_EMERGENCY, STATE_AMBULANCE } from "@/data/emergency-lines";
import { useI18n } from "@/lib/i18n";
import FacilityFinder from "./FacilityFinder";
import FirstAid from "./FirstAid";
import { PhoneIcon } from "./Icons";

interface Props {
  selectedState: string | null;
  onStateChange: (state: string) => void;
  /** Which danger sign fired, to choose the first-aid steps (general steps if unknown). */
  sign?: string;
  /** Shown after the first-aid steps (e.g. the AI's explanation). */
  children?: React.ReactNode;
}

export default function EmergencyActions({ selectedState, onStateChange, sign, children }: Props) {
  const { t } = useI18n();
  const ambulance = selectedState ? STATE_AMBULANCE[selectedState] : undefined;
  const mani = MENTAL_HEALTH_LINES[0].lines[0];

  return (
    <div className="space-y-4">
      <section aria-labelledby="call-now" className="card p-5 space-y-3">
        <h2 id="call-now" className="text-xl font-bold">{t("callForHelp")}</h2>
        <a href={`tel:${NATIONAL_EMERGENCY.tel}`} className="btn btn-danger w-full text-lg min-h-14">
          <PhoneIcon className="w-6 h-6" /> {t("callN", { n: NATIONAL_EMERGENCY.display })}
        </a>
        <p className="text-sm text-muted text-center">{t("nationalNote")}</p>
        {ambulance ? (
          <a href={`tel:${ambulance.tel}`} className="btn btn-secondary w-full">
            <PhoneIcon /> {ambulance.label}: {ambulance.display}
          </a>
        ) : (
          <p className="text-sm text-muted">{t("chooseStateAmbulance")}</p>
        )}
      </section>

      <FirstAid sign={sign} />

      {children}

      <section aria-labelledby="no-transport" className="card p-5 space-y-2">
        <h2 id="no-transport" className="text-xl font-bold">{t("noTransportTitle")}</h2>
        <p>{t("noTransportBody")}</p>
      </section>

      <div className="card p-5">
        <FacilityFinder
          selectedState={selectedState}
          onStateChange={onStateChange}
          showCallButtons={false}
          heading={t("nearestHospitals")}
        />
      </div>

      <p className="text-sm text-muted">
        {t("overwhelmed")}{" "}
        <a href={`tel:${mani.tel}`} className="btn btn-quiet px-1">
          {t("talkToMani", { n: mani.display })}
        </a>
      </p>
    </div>
  );
}
