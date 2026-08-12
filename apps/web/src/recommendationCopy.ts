import { formatMinorAsCurrency } from "./formatMoney.js";

/**
 * Presentation-only: turn API category ids into readable labels.
 */
export function humanizeCategoryLabel(category: string): string {
  return category.replaceAll("_", " ");
}

/**
 * Presentation-only explanation from existing recommendation minor amounts.
 * Does not invent new finance math.
 */
export function formatRecommendationExplanation(
  category: string,
  proposedReductionMinor: number,
  currentSpendingMinor: number,
  spendingAfterReductionMinor: number,
  currencyCode = "USD",
): string {
  const label = humanizeCategoryLabel(category);
  const cut = formatMinorAsCurrency(proposedReductionMinor, currencyCode);
  const from = formatMinorAsCurrency(currentSpendingMinor, currencyCode);
  const after = formatMinorAsCurrency(spendingAfterReductionMinor, currencyCode);
  return `Reduce ${label} spending by ${cut} (from ${from} to ${after}) to help close part of the savings gap.`;
}
