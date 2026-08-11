/**
 * Category vocabulary and recommendation eligibility (DOMAIN_RULES.md).
 * Recommendation allocation itself is REC-001; eligibility is domain invariant.
 */

export const ESSENTIAL_CATEGORIES = [
  "rent",
  "utilities",
  "groceries",
  "transportation",
  "healthcare",
  "debt_minimum_payments",
] as const;

export const DISCRETIONARY_CATEGORIES = [
  "subscriptions",
  "restaurants",
  "entertainment",
  "shopping",
  "other",
] as const;

/** Deterministic recommendation priority among discretionary categories. */
export const DISCRETIONARY_RECOMMENDATION_PRIORITY = [
  "subscriptions",
  "restaurants",
  "entertainment",
  "shopping",
  "other",
] as const;

export const INCOME_CATEGORIES = ["salary"] as const;

export type EssentialCategory = (typeof ESSENTIAL_CATEGORIES)[number];
export type DiscretionaryCategory = (typeof DISCRETIONARY_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = EssentialCategory | DiscretionaryCategory;
export type TransactionCategory = IncomeCategory | ExpenseCategory;

const ESSENTIAL_SET = new Set<string>(ESSENTIAL_CATEGORIES);
const DISCRETIONARY_SET = new Set<string>(DISCRETIONARY_CATEGORIES);

export function isEssentialCategory(category: string): category is EssentialCategory {
  return ESSENTIAL_SET.has(category);
}

export function isDiscretionaryCategory(category: string): category is DiscretionaryCategory {
  return DISCRETIONARY_SET.has(category);
}

/** Essentials are never eligible for savings-cut recommendations. */
export function isEligibleForRecommendation(category: string): category is DiscretionaryCategory {
  return isDiscretionaryCategory(category);
}
