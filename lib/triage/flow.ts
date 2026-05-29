/**
 * Pocket Health Worker — Conversation State Machine
 *
 * Controls the structured stages of the symptom collection flow (complaint entry → follow-ups → done).
 * It caps the follow-up question depth to prevent infinite loops, guaranteeing that the AI completes 
 * its safety assessment within a practical, concise timeline (UN SDG 3 access goal).
 */

export type ConversationStage = "collecting" | "followup" | "done";

export interface ConversationState {
  stage: ConversationStage;
  followupCount: number;
}

export const MAX_FOLLOWUPS = 4;

/**
 * Initializes a new conversation state.
 * @returns An initial ConversationState object starting in the "collecting" phase.
 */
export function initialState(): ConversationState {
  return { stage: "collecting", followupCount: 0 };
}

/**
 * Increments the follow-up counter and transitions the conversation stage 
 * to "done" if the maximum question limit has been reached.
 * @param state The current ConversationState.
 * @returns The advanced ConversationState.
 */
export function advanceAfterFollowup(state: ConversationState): ConversationState {
  const next = state.followupCount + 1;
  return {
    stage: next >= MAX_FOLLOWUPS ? "done" : "followup",
    followupCount: next,
  };
}

/**
 * Manually marks the conversation as concluded.
 * @param state The current ConversationState.
 * @returns A completed ConversationState.
 */
export function markDone(state: ConversationState): ConversationState {
  return { ...state, stage: "done" };
}

/**
 * Evaluates whether the system should force the AI to return a final triage assessment 
 * instead of asking more follow-up questions.
 * @param state The current ConversationState.
 * @returns Boolean representing if we are at or past the maximum follow-up threshold.
 */
export function shouldForceResult(state: ConversationState): boolean {
  return state.followupCount >= MAX_FOLLOWUPS;
}

