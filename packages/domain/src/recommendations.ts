import {
  DISCRETIONARY_RECOMMENDATION_PRIORITY,
  isEligibleForRecommendation,
  type DiscretionaryCategory,
} from "./categories.js";
import { assertMinorCurrencyAmount, type MinorCurrencyAmount } from "./money.js";

export interface CategorySpendingInput {
  category: string;
  amountMinor: MinorCurrencyAmount;
}

export interface RecommendationLine {
  category: DiscretionaryCategory;
  priority: number;
  currentSpendingMinor: MinorCurrencyAmount;
  proposedReductionMinor: MinorCurrencyAmount;
  spendingAfterReductionMinor: MinorCurrencyAmount;
  explanation: string;
}

export interface RecommendationPlan {
  savingsGapMinor: MinorCurrencyAmount;
  totalProposedReductionMinor: MinorCurrencyAmount;
  unresolvedGapMinor: MinorCurrencyAmount;
  /** current monthly savings + total proposed reductions */
  projectedMonthlySavingsMinor: number;
  recommendations: RecommendationLine[];
}

/**
 * Deterministic discretionary spending recommendations (DOMAIN_RULES.md).
 * Never recommends cuts to essential categories. Caps each cut by category spending
 * and stops once the feasible portion of the savings gap is closed.
 */
export function recommendDiscretionaryReductions(
  savingsGapMinor: number,
  categorySpending: readonly CategorySpendingInput[],
  currentMonthlySavingsMinor: number,
): RecommendationPlan {
  assertMinorCurrencyAmount(savingsGapMinor);
  if (!Number.isInteger(currentMonthlySavingsMinor)) {
    throw new Error("Current monthly savings must be an integer minor-unit amount.");
  }

  const spendingByCategory = new Map<string, number>();
  for (const row of categorySpending) {
    assertMinorCurrencyAmount(row.amountMinor);
    if (!isEligibleForRecommendation(row.category)) {
      continue;
    }
    spendingByCategory.set(
      row.category,
      (spendingByCategory.get(row.category) ?? 0) + row.amountMinor,
    );
  }

  let remainingGap = savingsGapMinor;
  const recommendations: RecommendationLine[] = [];

  DISCRETIONARY_RECOMMENDATION_PRIORITY.forEach((category, index) => {
    if (remainingGap <= 0) {
      return;
    }
    const currentSpendingMinor = spendingByCategory.get(category) ?? 0;
    if (currentSpendingMinor <= 0) {
      return;
    }
    const proposedReductionMinor = Math.min(currentSpendingMinor, remainingGap);
    const spendingAfterReductionMinor = currentSpendingMinor - proposedReductionMinor;
    remainingGap -= proposedReductionMinor;
    recommendations.push({
      category,
      priority: index + 1,
      currentSpendingMinor,
      proposedReductionMinor,
      spendingAfterReductionMinor,
      explanation: `Reduce ${category} spending by ${proposedReductionMinor} minor units (from ${currentSpendingMinor} to ${spendingAfterReductionMinor}) to close part of the savings gap.`,
    });
  });

  const totalProposedReductionMinor = recommendations.reduce(
    (sum, line) => sum + line.proposedReductionMinor,
    0,
  );

  return {
    savingsGapMinor,
    totalProposedReductionMinor,
    unresolvedGapMinor: remainingGap,
    projectedMonthlySavingsMinor: currentMonthlySavingsMinor + totalProposedReductionMinor,
    recommendations,
  };
}
