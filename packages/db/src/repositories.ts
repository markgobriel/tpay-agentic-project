import type {
  Account,
  PrismaClient,
  SavingsGoal,
  Transaction,
  TransactionCategory,
  TransactionType,
} from "@prisma/client";

export type AccountRecord = Account;
export type TransactionRecord = Transaction;
export type SavingsGoalRecord = SavingsGoal;

/**
 * Thin account persistence. No balance or analytics calculations.
 */
export async function findAccountById(
  db: PrismaClient,
  accountId: string,
): Promise<AccountRecord | null> {
  return db.account.findUnique({ where: { id: accountId } });
}

/**
 * Thin transaction persistence. Filtering only; no category totals or savings math.
 */
export async function listTransactionsByAccount(
  db: PrismaClient,
  accountId: string,
): Promise<TransactionRecord[]> {
  return db.transaction.findMany({
    where: { accountId },
    orderBy: { occurredAt: "asc" },
  });
}

export async function listTransactionsByAccountAndType(
  db: PrismaClient,
  accountId: string,
  type: TransactionType,
): Promise<TransactionRecord[]> {
  return db.transaction.findMany({
    where: { accountId, type },
    orderBy: { occurredAt: "asc" },
  });
}

export async function listTransactionsByAccountAndCategory(
  db: PrismaClient,
  accountId: string,
  category: TransactionCategory,
): Promise<TransactionRecord[]> {
  return db.transaction.findMany({
    where: { accountId, category },
    orderBy: { occurredAt: "asc" },
  });
}

/**
 * Thin savings-goal persistence. Pace/gap/required savings belong in domain.
 */
export async function findSavingsGoalByAccountId(
  db: PrismaClient,
  accountId: string,
): Promise<SavingsGoalRecord | null> {
  return db.savingsGoal.findUnique({ where: { accountId } });
}
