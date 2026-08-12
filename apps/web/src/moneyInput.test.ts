import { describe, expect, it } from "vitest";
import { minorToMajorInput, parseMajorCurrencyToMinor } from "./moneyInput.js";

describe("GOAL-001 money input parsing", () => {
  it("parses major-unit strings into integer minor units", () => {
    expect(parseMajorCurrencyToMinor("0")).toBe(0);
    expect(parseMajorCurrencyToMinor("12")).toBe(1200);
    expect(parseMajorCurrencyToMinor("12.3")).toBe(1230);
    expect(parseMajorCurrencyToMinor("12.34")).toBe(1234);
  });

  it("rejects invalid or negative amount strings", () => {
    expect(() => parseMajorCurrencyToMinor("-1")).toThrow(/non-negative/i);
    expect(() => parseMajorCurrencyToMinor("1.234")).toThrow(/two decimal/i);
    expect(() => parseMajorCurrencyToMinor("abc")).toThrow(/non-negative/i);
  });

  it("formats minor units back to major input strings", () => {
    expect(minorToMajorInput(0)).toBe("0.00");
    expect(minorToMajorInput(245_000)).toBe("2450.00");
  });
});
