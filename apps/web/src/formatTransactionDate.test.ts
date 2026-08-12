import { describe, expect, it } from "vitest";
import { formatTransactionDate } from "./formatTransactionDate.js";

describe("formatTransactionDate", () => {
  it("formats a transaction instant as a compact UTC calendar date", () => {
    expect(formatTransactionDate("2026-07-01T00:00:00.000Z")).toBe("Jul 1, 2026");
  });

  it("does not let an offset move the displayed date out of the UTC policy", () => {
    expect(formatTransactionDate("2026-07-01T23:30:00.000-02:00")).toBe("Jul 2, 2026");
  });
});
