/**
 * Presentation-only money formatting. Domain/persistence keep integer minor units.
 * Avoid IEEE-754 for the split by using integer division/remainder.
 */
export function formatMinorAsCurrency(
  amountMinor: number,
  currencyCode = "USD",
  _locale = "en-US",
): string {
  if (!Number.isInteger(amountMinor)) {
    throw new Error("Display amounts must be integer minor units.");
  }
  const negative = amountMinor < 0;
  const absolute = Math.abs(amountMinor);
  const major = Math.trunc(absolute / 100);
  const minor = absolute % 100;
  const formattedMajor = new Intl.NumberFormat(_locale, {
    maximumFractionDigits: 0,
  }).format(major);
  const body = `${formattedMajor}.${String(minor).padStart(2, "0")}`;
  const signed = `${negative ? "-" : ""}${body}`;

  if (currencyCode === "USD") {
    return `${negative ? "-" : ""}$${body}`;
  }
  return `${signed} ${currencyCode}`;
}
