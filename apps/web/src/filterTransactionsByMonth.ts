import type { TransactionResponse } from "@save-and-spend/contracts";

/**
 * Presentation-only: keep transactions whose UTC occurredAt falls in YYYY-MM.
 */
export function filterTransactionsByYearMonth(
  transactions: readonly TransactionResponse[],
  yearMonth: string,
): TransactionResponse[] {
  if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
    return [...transactions];
  }
  return transactions.filter((txn) => txn.occurredAt.slice(0, 7) === yearMonth);
}
