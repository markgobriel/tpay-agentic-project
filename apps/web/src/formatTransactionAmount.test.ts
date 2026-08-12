import { describe, expect, it } from "vitest";
import { formatTransactionAmount } from "./formatTransactionAmount.js";

describe("formatTransactionAmount", () => {
  it("makes incoming money explicit", () => {
    expect(formatTransactionAmount(500_000, "income")).toBe("+$5,000.00");
  });

  it("makes outgoing money explicit without depending on stored sign", () => {
    expect(formatTransactionAmount(150_000, "expense")).toBe("−$1,500.00");
    expect(formatTransactionAmount(-150_000, "expense")).toBe("−$1,500.00");
  });
});
