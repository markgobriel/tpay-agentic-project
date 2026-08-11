import { assertMinorCurrencyAmount, type MinorCurrencyAmount } from "./money.js";
import {
  isInstantInUtcYearMonth,
  parseUtcYearMonth,
  type UtcYearMonth,
  utcYearMonthKey,
} from "./dates.js";

export type TransactionType = "income" | "expense";

export interface DomainTransaction {
  amountMinor: MinorCurrencyAmount;
  type: TransactionType;
  category: string;
  occurredAt: Date;
}

export interface CategorySpending {
  category: string;
  amountMinor: MinorCurrencyAmount;
}

export interface MonthlyAnalytics {
  yearMonth: string;
  incomeMinor: MinorCurrencyAmount;
  spendingMinor: MinorCurrencyAmount;
  /** income - spending; may be negative when spending exceeds income. */
  currentMonthlySavingsMinor: number;
  categorySpending: CategorySpending[];
}

/**
 * Deterministic monthly analytics for a UTC calendar month.
 * Empty/unavailable months return zero totals (no fabricated data).
 */
export function calculateMonthlyAnalytics(
  transactions: readonly DomainTransaction[],
  yearMonthInput: string | UtcYearMonth,
): MonthlyAnalytics {
  const yearMonth =
    typeof yearMonthInput === "string" ? parseUtcYearMonth(yearMonthInput) : yearMonthInput;

  let incomeMinor = 0;
  let spendingMinor = 0;
  const categoryTotals = new Map<string, number>();

  for (const txn of transactions) {
    assertMinorCurrencyAmount(txn.amountMinor);
    if (!isInstantInUtcYearMonth(txn.occurredAt, yearMonth)) {
      continue;
    }
    if (txn.type === "income") {
      incomeMinor += txn.amountMinor;
      continue;
    }
    if (txn.type === "expense") {
      spendingMinor += txn.amountMinor;
      categoryTotals.set(txn.category, (categoryTotals.get(txn.category) ?? 0) + txn.amountMinor);
    }
  }

  const categorySpending: CategorySpending[] = [...categoryTotals.entries()]
    .map(([category, amountMinor]) => ({ category, amountMinor }))
    .sort((a, b) => a.category.localeCompare(b.category));

  return {
    yearMonth: utcYearMonthKey(yearMonth),
    incomeMinor,
    spendingMinor,
    currentMonthlySavingsMinor: incomeMinor - spendingMinor,
    categorySpending,
  };
}
