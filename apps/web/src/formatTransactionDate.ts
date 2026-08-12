const transactionDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function formatUtcDate(isoDate: string): string {
  return transactionDateFormatter.format(new Date(isoDate));
}

export const formatTransactionDate = formatUtcDate;
