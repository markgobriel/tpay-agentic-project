import type {
  AccountResponse,
  MonthlyAnalyticsResponse,
  TransactionsResponse,
} from "@save-and-spend/contracts";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(body?.error?.message ?? `Request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

export function fetchAccount(): Promise<AccountResponse> {
  return getJson<AccountResponse>("/account");
}

export function fetchTransactions(): Promise<TransactionsResponse> {
  return getJson<TransactionsResponse>("/transactions");
}

export function fetchMonthlyAnalytics(month: string): Promise<MonthlyAnalyticsResponse> {
  return getJson<MonthlyAnalyticsResponse>(`/analytics?month=${encodeURIComponent(month)}`);
}
