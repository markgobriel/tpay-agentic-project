/**
 * Deterministic financial domain rules for Save & Spend MVP.
 * No React, HTTP, or Prisma dependencies.
 */

export { ANALYSIS_TIMEZONE } from "./dates.js";
export {
  DomainValidationError,
  isInstantInUtcYearMonth,
  parseUtcYearMonth,
  utcYearMonthFromInstant,
  utcYearMonthKey,
  wholeUtcMonthsRemaining,
  type UtcYearMonth,
} from "./dates.js";

export { assertMinorCurrencyAmount, ceilDiv, type MinorCurrencyAmount } from "./money.js";

export {
  DISCRETIONARY_CATEGORIES,
  DISCRETIONARY_RECOMMENDATION_PRIORITY,
  ESSENTIAL_CATEGORIES,
  INCOME_CATEGORIES,
  isDiscretionaryCategory,
  isEligibleForRecommendation,
  isEssentialCategory,
  type DiscretionaryCategory,
  type EssentialCategory,
  type ExpenseCategory,
  type IncomeCategory,
  type TransactionCategory,
} from "./categories.js";

export {
  calculateMonthlyAnalytics,
  type CategorySpending,
  type DomainTransaction,
  type MonthlyAnalytics,
  type TransactionType,
} from "./analytics.js";

export { projectSavingsGoal, type SavingsGoalInput, type SavingsGoalProjection } from "./goals.js";

export {
  recommendDiscretionaryReductions,
  type CategorySpendingInput,
  type RecommendationLine,
  type RecommendationPlan,
} from "./recommendations.js";
