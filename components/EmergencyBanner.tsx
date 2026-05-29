/**
 * EmergencyBanner — shown when triage concludes symptoms may be life-threatening
 * (RED). Prominently urges immediate hospital care. Part of the safety-first UX
 * that prioritizes getting people to appropriate care quickly (UN SDG 3).
 */

interface Props {
  message: string;
}

export default function EmergencyBanner({ message }: Props) {
  return (
    <div className="w-full bg-red-600 text-white px-4 py-4 rounded-xl shadow-lg">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0" aria-hidden>🚨</span>
        <div>
          <p className="font-bold text-lg leading-tight">Emergency — Go to hospital now</p>
          <p className="mt-1 text-red-100 text-sm">{message}</p>
          <p className="mt-2 text-white text-sm font-medium">
            Go to the nearest hospital or general hospital emergency department immediately.
            Do not wait.
          </p>
        </div>
      </div>
    </div>
  );
}
