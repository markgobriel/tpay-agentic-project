import { describe, expect, it } from "vitest";
import { ANALYSIS_TIMEZONE, assertMinorCurrencyAmount } from "./index.js";

describe("foundation domain scaffolding", () => {
  it("exports the UTC analysis timezone policy", () => {
    expect(ANALYSIS_TIMEZONE).toBe("UTC");
  });

  it("accepts non-negative integer minor units", () => {
    expect(assertMinorCurrencyAmount(0)).toBe(0);
    expect(assertMinorCurrencyAmount(1250)).toBe(1250);
  });

  it("rejects fractional or negative amounts", () => {
    expect(() => assertMinorCurrencyAmount(1.5)).toThrow(/minor units/i);
    expect(() => assertMinorCurrencyAmount(-1)).toThrow(/minor units/i);
  });
});
