/**
 * Presentation-only relative share for category bars.
 * Uses integer arithmetic; does not invent spending totals.
 */
export function categorySharePercent(amountMinor: number, totalMinor: number): number {
  if (!Number.isInteger(amountMinor) || amountMinor < 0) {
    throw new Error("Category amounts must be non-negative integer minor units.");
  }
  if (!Number.isInteger(totalMinor) || totalMinor < 0) {
    throw new Error("Category total must be a non-negative integer minor units.");
  }
  if (totalMinor === 0) {
    return 0;
  }
  return Math.round((amountMinor * 100) / totalMinor);
}
