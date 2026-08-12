import { describe, expect, it } from "vitest";
import type { TransactionResponse } from "@save-and-spend/contracts";
import { filterTransactionsByYearMonth } from "./filterTransactionsByMonth.js";

function txn(id: string, occurredAt: string): TransactionResponse {
  return {
    id,
    accountId: "acct",
    occurredAt,
    merchant: "M",
    amountMinor: 100,
    type: "expense",
    category: "other",
  };
}

describe("filterTransactionsByYearMonth", () => {
  const rows = [
    txn("a", "2026-07-01T12:00:00.000Z"),
    txn("b", "2026-08-02T12:00:00.000Z"),
    txn("c", "2026-07-18T12:00:00.000Z"),
  ];

  it("keeps only matching UTC year-month rows", () => {
    expect(filterTransactionsByYearMonth(rows, "2026-07").map((t) => t.id)).toEqual(["a", "c"]);
    expect(filterTransactionsByYearMonth(rows, "2026-08").map((t) => t.id)).toEqual(["b"]);
  });

  it("returns empty when the month has no rows", () => {
    expect(filterTransactionsByYearMonth(rows, "2026-09")).toEqual([]);
  });
});
