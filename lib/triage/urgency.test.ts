/**
 * Safety tests — urgency merge policy.
 *
 * A matched red flag must always force the final level to RED, regardless of what the
 * AI returned. This is the guarantee that keeps the model from down-grading an emergency.
 */

import { describe, it, expect } from "vitest";
import { mergeUrgency, raiseUrgency } from "./urgency";

describe("mergeUrgency — red flag always wins", () => {
  it("forces RED when a red flag matched, even over a GREEN AI verdict", () => {
    expect(mergeUrgency("GREEN", true)).toBe("RED");
  });
  it("forces RED over a YELLOW AI verdict", () => {
    expect(mergeUrgency("YELLOW", true)).toBe("RED");
  });
  it("keeps the AI level when no red flag matched", () => {
    expect(mergeUrgency("GREEN", false)).toBe("GREEN");
    expect(mergeUrgency("YELLOW", false)).toBe("YELLOW");
    expect(mergeUrgency("RED", false)).toBe("RED");
  });
});

describe("raiseUrgency — returns the more urgent of two levels", () => {
  it("YELLOW over GREEN", () => {
    expect(raiseUrgency("GREEN", "YELLOW")).toBe("YELLOW");
  });
  it("RED over anything", () => {
    expect(raiseUrgency("RED", "GREEN")).toBe("RED");
    expect(raiseUrgency("YELLOW", "RED")).toBe("RED");
  });
  it("is order-independent", () => {
    expect(raiseUrgency("GREEN", "RED")).toBe(raiseUrgency("RED", "GREEN"));
  });
});
