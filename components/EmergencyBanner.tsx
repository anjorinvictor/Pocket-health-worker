/**
 * EmergencyBanner — the unmistakable top of every RED screen.
 * Words + warning-triangle shape + colour; never colour alone. No emoji.
 */

import { AlertIcon } from "./Icons";

export default function EmergencyBanner({ message }: { message?: string }) {
  return (
    <div role="alert" className="rounded-2xl bg-danger text-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <AlertIcon className="w-8 h-8 mt-0.5" />
        <div>
          <p className="text-sm font-bold uppercase tracking-wider">Emergency</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold">Go to hospital now</h1>
          {message && <p className="mt-2 text-base">{message}</p>}
          <p className="mt-2 text-base font-semibold">Do not wait to see if it gets better.</p>
        </div>
      </div>
    </div>
  );
}
