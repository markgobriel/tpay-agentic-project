/**
 * Parse a major-unit currency string into integer minor units at the presentation boundary.
 * Rejects floats that are not decimal money strings with at most two fraction digits.
 */
export function parseMajorCurrencyToMinor(input: string): number {
  const trimmed = input.trim();
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(trimmed);
  if (!match) {
    throw new Error("Enter a non-negative amount with up to two decimal places.");
  }
  const dollars = Number(match[1]);
  const cents = match[2] === undefined ? 0 : Number(match[2].padEnd(2, "0"));
  return dollars * 100 + cents;
}

export function minorToMajorInput(amountMinor: number): string {
  if (!Number.isInteger(amountMinor) || amountMinor < 0) {
    throw new Error("Display amounts must be non-negative integer minor units.");
  }
  const major = Math.trunc(amountMinor / 100);
  const minor = amountMinor % 100;
  return `${major}.${String(minor).padStart(2, "0")}`;
}
