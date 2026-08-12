import type { TransactionResponse } from "@save-and-spend/contracts";
import { formatMinorAsCurrency } from "./formatMoney.js";

export function formatTransactionAmount(
  amountMinor: number,
  type: TransactionResponse["type"],
  currencyCode = "USD",
): string {
  const absoluteAmount = Math.abs(amountMinor);
  const currency = formatMinorAsCurrency(absoluteAmount, currencyCode);
  return `${type === "income" ? "+" : "−"}${currency}`;
}
