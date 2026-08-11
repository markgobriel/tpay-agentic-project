/**
 * Money helpers. Amounts are non-negative integer minor units at domain boundaries.
 * Formatting belongs only at presentation boundaries.
 */

export type MinorCurrencyAmount = number;

export function assertMinorCurrencyAmount(value: number): MinorCurrencyAmount {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("Monetary amounts must be non-negative integers in minor units.");
  }
  return value;
}

/** Integer ceiling division for non-negative numerators and positive denominators. */
export function ceilDiv(numerator: number, denominator: number): number {
  if (!Number.isInteger(numerator) || numerator < 0) {
    throw new Error("ceilDiv numerator must be a non-negative integer.");
  }
  if (!Number.isInteger(denominator) || denominator <= 0) {
    throw new Error("ceilDiv denominator must be a positive integer.");
  }
  return Math.trunc((numerator + denominator - 1) / denominator);
}
