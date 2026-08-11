import { describe, expect, it } from "vitest";
import { formatMinorAsCurrency } from "./formatMoney.js";

describe("WEB-001 money formatting", () => {
  it("formats integer minor units as USD without float arithmetic artifacts", () => {
    expect(formatMinorAsCurrency(0)).toBe("$0.00");
    expect(formatMinorAsCurrency(245_000)).toBe("$2,450.00");
    expect(formatMinorAsCurrency(1)).toBe("$0.01");
    expect(formatMinorAsCurrency(-12_345)).toBe("-$123.45");
  });

  it("rejects non-integer display inputs", () => {
    expect(() => formatMinorAsCurrency(1.5)).toThrow(/integer minor units/i);
  });
});
