/**
 * Safety tests — crisis (self-harm) interceptor.
 *
 * This is a life-critical filter. These tests lock in BOTH that genuine crisis
 * language is caught (including Nigerian English / Pidgin) AND that negations and
 * ordinary medical complaints are NOT misclassified as a crisis.
 */

import { describe, it, expect } from "vitest";
import { isCrisis } from "./crisis";

describe("isCrisis — standard English crisis phrases", () => {
  const positives = [
    "I want to kill myself",
    "I am going to end my life",
    "I feel suicidal",
    "I wish I was dead",
    "there is no reason to live",
    "I want to harm myself",
    "I just want to die",
    "I am thinking of committing suicide",
  ];
  for (const text of positives) {
    it(`flags: "${text}"`, () => {
      expect(isCrisis(text)).toBe(true);
    });
  }
});

describe("isCrisis — Nigerian English / Pidgin crisis phrases", () => {
  const positives = [
    "I wan die",
    "i wan kill myself",
    "i go kee myself",
    "make i just die",
    "i don tire for this life",
    "i am tired of this life",
  ];
  for (const text of positives) {
    it(`flags: "${text}"`, () => {
      expect(isCrisis(text)).toBe(true);
    });
  }
});

describe("isCrisis — smart apostrophes / spacing are normalized", () => {
  it("matches curly apostrophe in can't go on", () => {
    expect(isCrisis("I can’t go on")).toBe(true);
  });
  it("matches with messy extra spacing", () => {
    expect(isCrisis("i    want   to    die")).toBe(true);
  });
});

describe("isCrisis — negations must NOT trigger", () => {
  const negatives = [
    "I don't want to die",
    "I am not suicidal",
    "I don't want to hurt myself",
    "i no wan die",
    "i no wan kill myself",
  ];
  for (const text of negatives) {
    it(`does not flag: "${text}"`, () => {
      expect(isCrisis(text)).toBe(false);
    });
  }
});

describe("isCrisis — ordinary medical complaints must NOT trigger", () => {
  const negatives = [
    "I have a headache and fever",
    "my chest is paining me",
    "the pain is killing me but I took paracetamol",
    "my baby has diarrhoea",
    "I am tired and weak from malaria",
  ];
  for (const text of negatives) {
    it(`does not flag: "${text}"`, () => {
      expect(isCrisis(text)).toBe(false);
    });
  }
});
