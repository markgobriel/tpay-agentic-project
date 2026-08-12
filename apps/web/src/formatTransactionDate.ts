const transactionDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function formatTransactionDate(occurredAt: string): string {
  return transactionDateFormatter.format(new Date(occurredAt));
}
