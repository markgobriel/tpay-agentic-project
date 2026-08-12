import type {
  AccountResponse,
  MonthlyAnalyticsResponse,
  SavingsGoalResponse,
  TransactionsResponse,
  UpsertSavingsGoalRequest,
} from "@save-and-spend/contracts";

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string; code?: string };
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

export function fetchSavingsGoal(): Promise<SavingsGoalResponse> {
  return getJson<SavingsGoalResponse>("/savings-goal");
}

export function upsertSavingsGoal(body: UpsertSavingsGoalRequest): Promise<SavingsGoalResponse> {
  return getJson<SavingsGoalResponse>("/savings-goal", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
