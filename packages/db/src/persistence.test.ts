import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { DbClient } from "./client.js";
import {
  findAccountById,
  findSavingsGoalByAccountId,
  listTransactionsByAccount,
  listTransactionsByAccountAndCategory,
  listTransactionsByAccountAndType,
} from "./repositories.js";
import { MOCK_ACCOUNT_ID, MOCK_SAVINGS_GOAL_ID, seedMockFinanceData } from "./seed.js";
import { startTestDatabase, type LocalPostgres } from "./testing.js";

describe("DATA-001 persistence", () => {
  let databaseUrl: string;
  let db: DbClient | undefined;
  let postgres: LocalPostgres | undefined;

  beforeAll(async () => {
    postgres = await startTestDatabase("persistence");
    databaseUrl = postgres.databaseUrl;
    db = postgres.db;
  }, 30_000);

  afterAll(async () => {
    await postgres?.close();
  });

  it("seeds one account, income/essential/discretionary transactions, and one goal", async () => {
    const client = db!;
    const result = await seedMockFinanceData(client);

    expect(result.accountId).toBe(MOCK_ACCOUNT_ID);
    expect(result.savingsGoalId).toBe(MOCK_SAVINGS_GOAL_ID);
    expect(result.transactionCount).toBe(12);

    const account = await findAccountById(client, MOCK_ACCOUNT_ID);
    expect(account).not.toBeNull();
    expect(account?.currencyCode).toBe("USD");
    expect(Number.isInteger(account?.currentBalanceMinor)).toBe(true);
    expect(account!.currentBalanceMinor).toBeGreaterThanOrEqual(0);

    const transactions = await listTransactionsByAccount(client, MOCK_ACCOUNT_ID);
    expect(transactions).toHaveLength(12);

    const income = await listTransactionsByAccountAndType(client, MOCK_ACCOUNT_ID, "income");
    const expenses = await listTransactionsByAccountAndType(client, MOCK_ACCOUNT_ID, "expense");
    expect(income).toHaveLength(1);
    expect(expenses).toHaveLength(11);

    const essentialCategories = [
      "rent",
      "utilities",
      "groceries",
      "transportation",
      "healthcare",
      "debt_minimum_payments",
    ] as const;
    for (const category of essentialCategories) {
      const rows = await listTransactionsByAccountAndCategory(client, MOCK_ACCOUNT_ID, category);
      expect(rows.length).toBeGreaterThanOrEqual(1);
      expect(rows.every((row) => row.type === "expense")).toBe(true);
    }

    const discretionaryCategories = [
      "subscriptions",
      "restaurants",
      "entertainment",
      "shopping",
      "other",
    ] as const;
    for (const category of discretionaryCategories) {
      const rows = await listTransactionsByAccountAndCategory(client, MOCK_ACCOUNT_ID, category);
      expect(rows.length).toBeGreaterThanOrEqual(1);
      expect(rows.every((row) => row.type === "expense")).toBe(true);
    }

    for (const txn of transactions) {
      expect(Number.isInteger(txn.amountMinor)).toBe(true);
      expect(txn.amountMinor).toBeGreaterThanOrEqual(0);
      expect(txn.merchant.length).toBeGreaterThan(0);
      expect(txn.occurredAt.toISOString()).toMatch(/^2026-07-/);
    }

    const goal = await findSavingsGoalByAccountId(client, MOCK_ACCOUNT_ID);
    expect(goal).not.toBeNull();
    expect(goal?.id).toBe(MOCK_SAVINGS_GOAL_ID);
    expect(goal?.name).toBe("Emergency Fund");
    expect(Number.isInteger(goal?.targetAmountMinor)).toBe(true);
    expect(Number.isInteger(goal?.currentSavedMinor)).toBe(true);
    expect(goal!.targetAmountMinor).toBeGreaterThanOrEqual(0);
    expect(goal!.currentSavedMinor).toBeGreaterThanOrEqual(0);
    expect(goal!.targetDate.toISOString()).toBe("2026-12-31T00:00:00.000Z");
  });

  it("does not require real banking credentials or network data sources", async () => {
    const client = db!;
    await seedMockFinanceData(client);
    const account = await findAccountById(client, MOCK_ACCOUNT_ID);
    expect(account?.name).toBe("Everyday Checking");
    // Evidence: all data comes from isolated local PostgreSQL + in-repo seed constants.
    expect(databaseUrl).toMatch(/^postgres(?:ql)?:\/\//);
    expect(new URL(databaseUrl).hostname).toMatch(/^(?:127\.0\.0\.1|localhost)$/);
  });
});
