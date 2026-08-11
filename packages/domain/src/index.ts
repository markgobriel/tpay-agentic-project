/**
 * MVP timezone policy for monthly analysis (DOMAIN_RULES.md).
 * All calendar-month boundaries are computed in UTC.
 */
export const ANALYSIS_TIMEZONE = "UTC" as const;

/**
 * Money is stored and calculated as non-negative integer minor units.
 * Formatting belongs only at presentation boundaries.
 */
export type MinorCurrencyAmount = number;

export function assertMinorCurrencyAmount(value: number): MinorCurrencyAmount {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("Monetary amounts must be non-negative integers in minor units.");
  }
  return value;
}
