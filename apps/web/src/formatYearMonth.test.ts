import { describe, expect, it } from "vitest";
import { formatYearMonthLabel } from "./formatYearMonth.js";

describe("formatYearMonthLabel", () => {
  it("formats valid UTC year-months in plain language", () => {
    expect(formatYearMonthLabel("2026-07")).toBe("July 2026");
    expect(formatYearMonthLabel("2026-08")).toBe("August 2026");
    expect(formatYearMonthLabel("2026-01")).toBe("January 2026");
  });

  it("returns the original string when the value is not YYYY-MM", () => {
    expect(formatYearMonthLabel("2026-13")).toBe("2026-13");
    expect(formatYearMonthLabel("July")).toBe("July");
  });
});
