/**
 * Persistence package: Prisma schema, seed data, and thin repositories.
 * Domain policy (analytics, pace, recommendations) must not live here.
 */

export { createDbClient, type DbClient } from "./client.js";
export { MOCK_ACCOUNT_ID, MOCK_SAVINGS_GOAL_ID, seedMockFinanceData } from "./seed.js";
export {
  findAccountById,
  findSavingsGoalByAccountId,
  listTransactionsByAccount,
  listTransactionsByAccountAndCategory,
  listTransactionsByAccountAndType,
  type AccountRecord,
  type SavingsGoalRecord,
  type TransactionRecord,
} from "./repositories.js";

export const DB_PACKAGE_NAME = "@save-and-spend/db" as const;
