/**
 * Pocket Health Worker — "What might be going on" on the emergency screen
 *
 * The emergency screen appears instantly from the safety rules. When online (and Data Saver
 * is off) the AI then explains what is most likely happening, so the person understands why
 * they must go now. The urgency never changes: it stays an emergency whatever the AI says.
 */

"use client";

import type { TriageResult } from "@/types";

export type ExplainState =
  | { status: "none" }
  | { status: "loading" }
  | { status: "failed" }
  | { status: "done"; result: TriageResult };

export default function EmergencyExplanation({ state }: { state: ExplainState }) {
  if (state.status === "none") return null;

  return (
    <section aria-labelledby="explain-title" aria-live="polite" className="card p-5 space-y-3">
      <h2 id="explain-title" className="text-xl font-bold">What might be going on</h2>

      {state.status === "loading" && (
        <p className="text-muted">Getting an explanation… You do not need to wait for it. Call or go now.</p>
      )}

      {state.status === "failed" && (
        <p className="text-muted">
          We couldn&rsquo;t load an explanation right now. That does not change anything: please get help now.
        </p>
      )}

      {state.status === "done" && (
        <>
          {state.result.likelyCondition && (
            <p className="text-lg">
              <span className="font-semibold">Most likely: </span>
              {state.result.likelyCondition}
            </p>
          )}
          <p>{state.result.assessment}</p>
          {state.result.generalCauses && state.result.generalCauses.length > 0 && (
            <div>
              <p className="font-semibold">
                It could be <span className="font-normal text-muted">(informational only)</span>
              </p>
              <ul className="list-disc pl-5 space-y-0.5">
                {state.result.generalCauses.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-sm text-muted">
            Not a diagnosis. Only a health worker can say for sure, which is why you need to go now.
          </p>
        </>
      )}
    </section>
  );
}
