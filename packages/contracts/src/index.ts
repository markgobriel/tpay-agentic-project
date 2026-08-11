/**
 * Shared API contracts. No server runtime or Prisma dependencies.
 */

export type HealthStatus = "ok";

export interface HealthResponse {
  status: HealthStatus;
  service: "save-and-spend-api";
}

export interface TimezonePolicyResponse {
  analysisTimezone: "UTC";
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export interface AccountResponse {
  id: string;
  name: string;
  currencyCode: string;
  currentBalanceMinor: number;
}

export interface TransactionResponse {
  id: string;
  accountId: string;
  amountMinor: number;
  type: "income" | "expense";
  category: string;
  merchant: string;
  occurredAt: string;
}

export interface TransactionsResponse {
  accountId: string;
  transactions: TransactionResponse[];
}

export interface CategorySpendingResponse {
  category: string;
  amountMinor: number;
}

export interface MonthlyAnalyticsResponse {
  accountId: string;
  yearMonth: string;
  incomeMinor: number;
  spendingMinor: number;
  currentMonthlySavingsMinor: number;
  categorySpending: CategorySpendingResponse[];
}

export interface SavingsGoalResponse {
  id: string;
  accountId: string;
  name: string;
  targetAmountMinor: number;
  currentSavedMinor: number;
  targetDate: string;
  remainingGoalMinor: number;
  monthsRemaining: number;
  requiredMonthlySavingsMinor: number;
  savingsGapMinor: number;
  onPace: boolean;
  isComplete: boolean;
  /** Month used for current monthly savings in the projection. */
  analyticsYearMonth: string;
  currentMonthlySavingsMinor: number;
}

export interface UpsertSavingsGoalRequest {
  name: string;
  targetAmountMinor: number;
  currentSavedMinor: number;
  /** ISO-8601 date or date-time; stored/compared as an Instant. */
  targetDate: string;
}
