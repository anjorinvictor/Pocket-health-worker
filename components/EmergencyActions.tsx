/**
 * Pocket Health Worker — Emergency actions (shared by every RED screen)
 *
 * 112 first and biggest; a state ambulance line only once that state is chosen
 * (LASAMBUS is Lagos-only); what to do with no transport; nearby hospitals;
 * and the mental-health line for people in distress.
 */

"use client";

import { MENTAL_HEALTH_LINES, NATIONAL_EMERGENCY, STATE_AMBULANCE } from "@/data/emergency-lines";
import FacilityFinder from "./FacilityFinder";
import { PhoneIcon } from "./Icons";

interface Props {
  selectedState: string | null;
  onStateChange: (state: string) => void;
}

export default function EmergencyActions({ selectedState, onStateChange }: Props) {
  const ambulance = selectedState ? STATE_AMBULANCE[selectedState] : undefined;
  const mani = MENTAL_HEALTH_LINES[0].lines[0];

  return (
    <div className="space-y-4">
      <section aria-labelledby="call-now" className="card p-5 space-y-3">
        <h2 id="call-now" className="text-xl font-bold">Call for help now</h2>
        <a href={`tel:${NATIONAL_EMERGENCY.tel}`} className="btn btn-danger w-full text-lg min-h-14">
          <PhoneIcon className="w-6 h-6" /> Call {NATIONAL_EMERGENCY.display}
        </a>
        <p className="text-sm text-muted text-center">National emergency line · free from any network</p>
        {ambulance ? (
          <a href={`tel:${ambulance.tel}`} className="btn btn-secondary w-full">
            <PhoneIcon /> {ambulance.label}: {ambulance.display}
          </a>
        ) : (
          <p className="text-sm text-muted">Choose your state below to see a local ambulance line where one exists.</p>
        )}
      </section>

      <section aria-labelledby="no-transport" className="card p-5 space-y-2">
        <h2 id="no-transport" className="text-xl font-bold">No transport?</h2>
        <p>
          Call a neighbour, a family member, or a keke or okada rider right now. Do not wait for morning.
          If the person stops breathing or will not wake up, call 112 straight away.
        </p>
      </section>

      <div className="card p-5">
        <FacilityFinder
          selectedState={selectedState}
          onStateChange={onStateChange}
          showCallButtons={false}
          heading="Nearest hospitals with emergency care"
        />
      </div>

      <p className="text-sm text-muted">
        Feeling overwhelmed or unsafe?{" "}
        <a href={`tel:${mani.tel}`} className="btn btn-quiet px-1">
          Talk to MANI: {mani.display}
        </a>
      </p>
    </div>
  );
}
