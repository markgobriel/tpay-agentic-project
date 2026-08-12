import { describe, expect, it } from "vitest";
import { categorySharePercent } from "./categoryShare.js";

describe("EVOLVE-001 category share presentation helper", () => {
  it("computes integer percents that sum near 100 for typical totals", () => {
    expect(categorySharePercent(25_00, 100_00)).toBe(25);
    expect(categorySharePercent(1, 3)).toBe(33);
    expect(categorySharePercent(0, 100)).toBe(0);
    expect(categorySharePercent(50, 0)).toBe(0);
  });

  it("rejects non-integer amounts", () => {
    expect(() => categorySharePercent(1.5, 10)).toThrow(/integer/i);
  });
});
