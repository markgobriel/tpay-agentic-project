import { DomainValidationError, wholeUtcMonthsRemaining } from "./dates.js";
import { assertMinorCurrencyAmount, ceilDiv, type MinorCurrencyAmount } from "./money.js";

export interface SavingsGoalInput {
  targetAmountMinor: MinorCurrencyAmount;
  currentSavedMinor: MinorCurrencyAmount;
  targetDate: Date;
}

export interface SavingsGoalProjection {
  remainingGoalMinor: MinorCurrencyAmount;
  monthsRemaining: number;
  requiredMonthlySavingsMinor: MinorCurrencyAmount;
  /** max(requiredMonthlySavings - currentMonthlySavings, 0) */
  savingsGapMinor: MinorCurrencyAmount;
  onPace: boolean;
  isComplete: boolean;
}

/**
 * Deterministic savings-goal pace and gap math (DOMAIN_RULES.md).
 * Does not read databases or HTTP; callers supply monthly savings and dates.
 */
export function projectSavingsGoal(
  goal: SavingsGoalInput,
  currentMonthlySavingsMinor: number,
  calculationDate: Date,
): SavingsGoalProjection {
  assertMinorCurrencyAmount(goal.targetAmountMinor);
  assertMinorCurrencyAmount(goal.currentSavedMinor);
  if (!Number.isInteger(currentMonthlySavingsMinor)) {
    throw new DomainValidationError(
      "invalid_monthly_savings",
      "Current monthly savings must be an integer minor-unit amount.",
    );
  }

  const remainingGoalMinor = Math.max(goal.targetAmountMinor - goal.currentSavedMinor, 0);
  if (remainingGoalMinor === 0) {
    return {
      remainingGoalMinor: 0,
      monthsRemaining: 0,
      requiredMonthlySavingsMinor: 0,
      savingsGapMinor: 0,
      onPace: true,
      isComplete: true,
    };
  }

  const monthsRemaining = wholeUtcMonthsRemaining(calculationDate, goal.targetDate);
  const requiredMonthlySavingsMinor = ceilDiv(remainingGoalMinor, monthsRemaining);
  const savingsGapMinor = Math.max(requiredMonthlySavingsMinor - currentMonthlySavingsMinor, 0);

  return {
    remainingGoalMinor,
    monthsRemaining,
    requiredMonthlySavingsMinor,
    savingsGapMinor,
    onPace: savingsGapMinor === 0,
    isComplete: false,
  };
}
