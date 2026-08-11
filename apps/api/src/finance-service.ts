import type {
  AccountResponse,
  ApiErrorResponse,
  MonthlyAnalyticsResponse,
  SavingsGoalResponse,
  TransactionsResponse,
  UpsertSavingsGoalRequest,
} from "@save-and-spend/contracts";
import {
  calculateMonthlyAnalytics,
  DomainValidationError,
  projectSavingsGoal,
  utcYearMonthFromInstant,
  utcYearMonthKey,
  type DomainTransaction,
} from "@save-and-spend/domain";
import {
  findAccountById,
  findSavingsGoalByAccountId,
  listTransactionsByAccount,
  MOCK_ACCOUNT_ID,
  upsertSavingsGoalForAccount,
  type DbClient,
} from "@save-and-spend/db";

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }

  toResponse(): ApiErrorResponse {
    return { error: { code: this.code, message: this.message } };
  }
}

export interface FinanceServiceOptions {
  db: DbClient;
  accountId?: string;
  /** Injected for deterministic tests; defaults to current instant. */
  now?: () => Date;
}

function toDomainTransactions(
  rows: Awaited<ReturnType<typeof listTransactionsByAccount>>,
): DomainTransaction[] {
  return rows.map((row) => ({
    amountMinor: row.amountMinor,
    type: row.type,
    category: row.category,
    occurredAt: row.occurredAt,
  }));
}

function mapDomainError(error: unknown): never {
  if (error instanceof DomainValidationError) {
    throw new HttpError(400, error.code, error.message);
  }
  throw error;
}

export function createFinanceService(options: FinanceServiceOptions) {
  const accountId = options.accountId ?? MOCK_ACCOUNT_ID;
  const now = options.now ?? (() => new Date());

  return {
    async getAccount(): Promise<AccountResponse> {
      const account = await findAccountById(options.db, accountId);
      if (!account) {
        throw new HttpError(404, "account_not_found", "Account was not found.");
      }
      return {
        id: account.id,
        name: account.name,
        currencyCode: account.currencyCode,
        currentBalanceMinor: account.currentBalanceMinor,
      };
    },

    async getTransactions(): Promise<TransactionsResponse> {
      await this.getAccount();
      const rows = await listTransactionsByAccount(options.db, accountId);
      return {
        accountId,
        transactions: rows.map((row) => ({
          id: row.id,
          accountId: row.accountId,
          amountMinor: row.amountMinor,
          type: row.type,
          category: row.category,
          merchant: row.merchant,
          occurredAt: row.occurredAt.toISOString(),
        })),
      };
    },

    async getMonthlyAnalytics(month: string): Promise<MonthlyAnalyticsResponse> {
      await this.getAccount();
      const rows = await listTransactionsByAccount(options.db, accountId);
      try {
        const analytics = calculateMonthlyAnalytics(toDomainTransactions(rows), month);
        return {
          accountId,
          yearMonth: analytics.yearMonth,
          incomeMinor: analytics.incomeMinor,
          spendingMinor: analytics.spendingMinor,
          currentMonthlySavingsMinor: analytics.currentMonthlySavingsMinor,
          categorySpending: analytics.categorySpending,
        };
      } catch (error) {
        mapDomainError(error);
      }
    },

    async getSavingsGoal(): Promise<SavingsGoalResponse> {
      await this.getAccount();
      const goal = await findSavingsGoalByAccountId(options.db, accountId);
      if (!goal) {
        throw new HttpError(404, "savings_goal_not_found", "Savings goal was not found.");
      }
      return this.projectGoalResponse(goal);
    },

    async upsertSavingsGoal(body: UpsertSavingsGoalRequest): Promise<SavingsGoalResponse> {
      await this.getAccount();
      const parsed = parseUpsertSavingsGoalRequest(body);
      const calculationDate = now();
      const analyticsMonth = utcYearMonthKey(utcYearMonthFromInstant(calculationDate));
      const rows = await listTransactionsByAccount(options.db, accountId);

      let projection;
      let analytics;
      try {
        analytics = calculateMonthlyAnalytics(toDomainTransactions(rows), analyticsMonth);
        projection = projectSavingsGoal(
          {
            targetAmountMinor: parsed.targetAmountMinor,
            currentSavedMinor: parsed.currentSavedMinor,
            targetDate: parsed.targetDate,
          },
          analytics.currentMonthlySavingsMinor,
          calculationDate,
        );
      } catch (error) {
        mapDomainError(error);
      }

      const goal = await upsertSavingsGoalForAccount(options.db, {
        accountId,
        ...parsed,
      });

      return {
        id: goal.id,
        accountId: goal.accountId,
        name: goal.name,
        targetAmountMinor: goal.targetAmountMinor,
        currentSavedMinor: goal.currentSavedMinor,
        targetDate: goal.targetDate.toISOString(),
        remainingGoalMinor: projection.remainingGoalMinor,
        monthsRemaining: projection.monthsRemaining,
        requiredMonthlySavingsMinor: projection.requiredMonthlySavingsMinor,
        savingsGapMinor: projection.savingsGapMinor,
        onPace: projection.onPace,
        isComplete: projection.isComplete,
        analyticsYearMonth: analytics.yearMonth,
        currentMonthlySavingsMinor: analytics.currentMonthlySavingsMinor,
      };
    },

    async projectGoalResponse(goal: {
      id: string;
      accountId: string;
      name: string;
      targetAmountMinor: number;
      currentSavedMinor: number;
      targetDate: Date;
    }): Promise<SavingsGoalResponse> {
      const calculationDate = now();
      const analyticsMonth = utcYearMonthKey(utcYearMonthFromInstant(calculationDate));
      const rows = await listTransactionsByAccount(options.db, accountId);
      let analytics;
      try {
        analytics = calculateMonthlyAnalytics(toDomainTransactions(rows), analyticsMonth);
        const projection = projectSavingsGoal(
          {
            targetAmountMinor: goal.targetAmountMinor,
            currentSavedMinor: goal.currentSavedMinor,
            targetDate: goal.targetDate,
          },
          analytics.currentMonthlySavingsMinor,
          calculationDate,
        );
        return {
          id: goal.id,
          accountId: goal.accountId,
          name: goal.name,
          targetAmountMinor: goal.targetAmountMinor,
          currentSavedMinor: goal.currentSavedMinor,
          targetDate: goal.targetDate.toISOString(),
          remainingGoalMinor: projection.remainingGoalMinor,
          monthsRemaining: projection.monthsRemaining,
          requiredMonthlySavingsMinor: projection.requiredMonthlySavingsMinor,
          savingsGapMinor: projection.savingsGapMinor,
          onPace: projection.onPace,
          isComplete: projection.isComplete,
          analyticsYearMonth: analytics.yearMonth,
          currentMonthlySavingsMinor: analytics.currentMonthlySavingsMinor,
        };
      } catch (error) {
        mapDomainError(error);
      }
    },
  };
}

export type FinanceService = ReturnType<typeof createFinanceService>;

function parseUpsertSavingsGoalRequest(body: UpsertSavingsGoalRequest): {
  name: string;
  targetAmountMinor: number;
  currentSavedMinor: number;
  targetDate: Date;
} {
  if (body === null || typeof body !== "object") {
    throw new HttpError(400, "invalid_body", "Request body must be a JSON object.");
  }
  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    throw new HttpError(400, "invalid_name", "Goal name must be a non-empty string.");
  }
  if (!Number.isInteger(body.targetAmountMinor) || body.targetAmountMinor < 0) {
    throw new HttpError(
      400,
      "invalid_target_amount",
      "targetAmountMinor must be a non-negative integer.",
    );
  }
  if (!Number.isInteger(body.currentSavedMinor) || body.currentSavedMinor < 0) {
    throw new HttpError(
      400,
      "invalid_current_saved",
      "currentSavedMinor must be a non-negative integer.",
    );
  }
  if (typeof body.targetDate !== "string" || body.targetDate.trim().length === 0) {
    throw new HttpError(400, "invalid_target_date", "targetDate must be an ISO-8601 string.");
  }
  const targetDate = new Date(body.targetDate);
  if (Number.isNaN(targetDate.getTime())) {
    throw new HttpError(400, "invalid_target_date", "targetDate must be a valid ISO-8601 instant.");
  }
  return {
    name: body.name.trim(),
    targetAmountMinor: body.targetAmountMinor,
    currentSavedMinor: body.currentSavedMinor,
    targetDate,
  };
}
