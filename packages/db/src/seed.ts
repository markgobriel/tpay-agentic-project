import type { PrismaClient } from "@prisma/client";

/** Stable mock account id for deterministic seeds and tests. */
export const MOCK_ACCOUNT_ID = "acct_mock_primary" as const;

/** Stable mock savings-goal id. */
export const MOCK_SAVINGS_GOAL_ID = "goal_mock_emergency" as const;

/**
 * Deterministic mock seed for one account, mixed transaction types/categories, and one goal.
 * Amounts are integer minor units (USD cents). Occurrences use UTC calendar dates.
 * No domain calculations (pace, gap, recommendations) are performed here.
 */
export async function seedMockFinanceData(db: PrismaClient): Promise<{
  accountId: string;
  transactionCount: number;
  savingsGoalId: string;
}> {
  await db.transaction.deleteMany();
  await db.savingsGoal.deleteMany();
  await db.account.deleteMany();

  await db.account.create({
    data: {
      id: MOCK_ACCOUNT_ID,
      name: "Everyday Checking",
      currencyCode: "USD",
      // Snapshot balance consistent with seeded activity for the mock story.
      currentBalanceMinor: 2_450_00,
    },
  });

  await db.transaction.createMany({
    data: [
      // Income
      {
        id: "txn_income_salary_jul",
        accountId: MOCK_ACCOUNT_ID,
        amountMinor: 5_000_00,
        type: "income",
        category: "salary",
        merchant: "Acme Corp Payroll",
        occurredAt: new Date("2026-07-01T12:00:00.000Z"),
      },
      // Essential expenses
      {
        id: "txn_essential_rent_jul",
        accountId: MOCK_ACCOUNT_ID,
        amountMinor: 1_500_00,
        type: "expense",
        category: "rent",
        merchant: "Harbor Property Mgmt",
        occurredAt: new Date("2026-07-02T15:00:00.000Z"),
      },
      {
        id: "txn_essential_utilities_jul",
        accountId: MOCK_ACCOUNT_ID,
        amountMinor: 120_00,
        type: "expense",
        category: "utilities",
        merchant: "City Power & Water",
        occurredAt: new Date("2026-07-05T10:00:00.000Z"),
      },
      {
        id: "txn_essential_groceries_jul",
        accountId: MOCK_ACCOUNT_ID,
        amountMinor: 380_00,
        type: "expense",
        category: "groceries",
        merchant: "Fresh Market",
        occurredAt: new Date("2026-07-08T18:30:00.000Z"),
      },
      {
        id: "txn_essential_transport_jul",
        accountId: MOCK_ACCOUNT_ID,
        amountMinor: 95_00,
        type: "expense",
        category: "transportation",
        merchant: "Metro Transit",
        occurredAt: new Date("2026-07-10T08:15:00.000Z"),
      },
      {
        id: "txn_essential_healthcare_jul",
        accountId: MOCK_ACCOUNT_ID,
        amountMinor: 45_00,
        type: "expense",
        category: "healthcare",
        merchant: "Neighborhood Pharmacy",
        occurredAt: new Date("2026-07-12T16:00:00.000Z"),
      },
      {
        id: "txn_essential_debt_jul",
        accountId: MOCK_ACCOUNT_ID,
        amountMinor: 200_00,
        type: "expense",
        category: "debt_minimum_payments",
        merchant: "Student Loan Servicer",
        occurredAt: new Date("2026-07-15T09:00:00.000Z"),
      },
      // Discretionary expenses
      {
        id: "txn_disc_subscriptions_jul",
        accountId: MOCK_ACCOUNT_ID,
        amountMinor: 45_00,
        type: "expense",
        category: "subscriptions",
        merchant: "StreamFlix",
        occurredAt: new Date("2026-07-03T11:00:00.000Z"),
      },
      {
        id: "txn_disc_restaurants_jul",
        accountId: MOCK_ACCOUNT_ID,
        amountMinor: 186_00,
        type: "expense",
        category: "restaurants",
        merchant: "Noodle House",
        occurredAt: new Date("2026-07-09T19:45:00.000Z"),
      },
      {
        id: "txn_disc_entertainment_jul",
        accountId: MOCK_ACCOUNT_ID,
        amountMinor: 60_00,
        type: "expense",
        category: "entertainment",
        merchant: "Cinema Downtown",
        occurredAt: new Date("2026-07-11T21:00:00.000Z"),
      },
      {
        id: "txn_disc_shopping_jul",
        accountId: MOCK_ACCOUNT_ID,
        amountMinor: 129_00,
        type: "expense",
        category: "shopping",
        merchant: "Urban Outfitters",
        occurredAt: new Date("2026-07-14T14:20:00.000Z"),
      },
      {
        id: "txn_disc_other_jul",
        accountId: MOCK_ACCOUNT_ID,
        amountMinor: 35_00,
        type: "expense",
        category: "other",
        merchant: "Misc Purchase",
        occurredAt: new Date("2026-07-18T13:00:00.000Z"),
      },
    ],
  });

  await db.savingsGoal.create({
    data: {
      id: MOCK_SAVINGS_GOAL_ID,
      accountId: MOCK_ACCOUNT_ID,
      name: "Emergency Fund",
      targetAmountMinor: 6_000_00,
      currentSavedMinor: 1_200_00,
      targetDate: new Date("2026-12-31T00:00:00.000Z"),
    },
  });

  const transactionCount = await db.transaction.count({
    where: { accountId: MOCK_ACCOUNT_ID },
  });

  return {
    accountId: MOCK_ACCOUNT_ID,
    transactionCount,
    savingsGoalId: MOCK_SAVINGS_GOAL_ID,
  };
}
