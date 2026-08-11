import { describe, expect, it } from "vitest";
import {
  ANALYSIS_TIMEZONE,
  assertMinorCurrencyAmount,
  calculateMonthlyAnalytics,
  ceilDiv,
  DomainValidationError,
  DISCRETIONARY_RECOMMENDATION_PRIORITY,
  isEligibleForRecommendation,
  isEssentialCategory,
  parseUtcYearMonth,
  projectSavingsGoal,
  wholeUtcMonthsRemaining,
  type DomainTransaction,
} from "./index.js";

const sampleTransactions: DomainTransaction[] = [
  {
    amountMinor: 500_000,
    type: "income",
    category: "salary",
    occurredAt: new Date("2026-07-01T12:00:00.000Z"),
  },
  {
    amountMinor: 150_000,
    type: "expense",
    category: "rent",
    occurredAt: new Date("2026-07-02T12:00:00.000Z"),
  },
  {
    amountMinor: 12_000,
    type: "expense",
    category: "utilities",
    occurredAt: new Date("2026-07-05T12:00:00.000Z"),
  },
  {
    amountMinor: 18_600,
    type: "expense",
    category: "restaurants",
    occurredAt: new Date("2026-07-09T12:00:00.000Z"),
  },
  {
    amountMinor: 4_500,
    type: "expense",
    category: "subscriptions",
    occurredAt: new Date("2026-07-03T12:00:00.000Z"),
  },
  // Different month — must be ignored for July analytics
  {
    amountMinor: 99_999,
    type: "expense",
    category: "shopping",
    occurredAt: new Date("2026-06-30T23:00:00.000Z"),
  },
];

describe("DOMAIN-001 money and timezone foundations", () => {
  it("exports the UTC analysis timezone policy", () => {
    expect(ANALYSIS_TIMEZONE).toBe("UTC");
  });

  it("accepts non-negative integer minor units and rejects invalid amounts", () => {
    expect(assertMinorCurrencyAmount(0)).toBe(0);
    expect(assertMinorCurrencyAmount(1250)).toBe(1250);
    expect(() => assertMinorCurrencyAmount(1.5)).toThrow(/minor units/i);
    expect(() => assertMinorCurrencyAmount(-1)).toThrow(/minor units/i);
  });

  it("ceil-divides required savings without floating currency math", () => {
    expect(ceilDiv(100, 3)).toBe(34);
    expect(ceilDiv(10, 5)).toBe(2);
    expect(ceilDiv(0, 4)).toBe(0);
  });
});

describe("DOMAIN-001 monthly analytics", () => {
  it("sums income, spending, savings, and category totals for a UTC month", () => {
    const analytics = calculateMonthlyAnalytics(sampleTransactions, "2026-07");
    expect(analytics.yearMonth).toBe("2026-07");
    expect(analytics.incomeMinor).toBe(500_000);
    expect(analytics.spendingMinor).toBe(150_000 + 12_000 + 18_600 + 4_500);
    expect(analytics.currentMonthlySavingsMinor).toBe(
      500_000 - (150_000 + 12_000 + 18_600 + 4_500),
    );
    expect(analytics.categorySpending).toEqual([
      { category: "rent", amountMinor: 150_000 },
      { category: "restaurants", amountMinor: 18_600 },
      { category: "subscriptions", amountMinor: 4_500 },
      { category: "utilities", amountMinor: 12_000 },
    ]);
  });

  it("returns zero totals for unavailable months with no transactions", () => {
    const analytics = calculateMonthlyAnalytics(sampleTransactions, "2026-01");
    expect(analytics).toEqual({
      yearMonth: "2026-01",
      incomeMinor: 0,
      spendingMinor: 0,
      currentMonthlySavingsMinor: 0,
      categorySpending: [],
    });
  });

  it("rejects invalid month identifiers", () => {
    expect(() => parseUtcYearMonth("2026-13")).toThrow(DomainValidationError);
    expect(() => parseUtcYearMonth("July 2026")).toThrow(DomainValidationError);
    expect(() => calculateMonthlyAnalytics([], "2026-13")).toThrow(DomainValidationError);
  });
});

describe("DOMAIN-001 savings goal projection", () => {
  it("ceil-rounds required monthly savings and computes the gap", () => {
    const projection = projectSavingsGoal(
      {
        targetAmountMinor: 600_000,
        currentSavedMinor: 120_000,
        targetDate: new Date("2026-12-31T00:00:00.000Z"),
      },
      100_000,
      new Date("2026-07-15T00:00:00.000Z"),
    );

    // July..December inclusive = 6 months; remaining = 480000; ceil(480000/6)=80000
    expect(projection.isComplete).toBe(false);
    expect(projection.monthsRemaining).toBe(6);
    expect(projection.remainingGoalMinor).toBe(480_000);
    expect(projection.requiredMonthlySavingsMinor).toBe(80_000);
    expect(projection.savingsGapMinor).toBe(0);
    expect(projection.onPace).toBe(true);
  });

  it("reports a positive gap when current savings are below the required pace", () => {
    const projection = projectSavingsGoal(
      {
        targetAmountMinor: 100_000,
        currentSavedMinor: 0,
        targetDate: new Date("2026-09-30T00:00:00.000Z"),
      },
      10_000,
      new Date("2026-07-01T00:00:00.000Z"),
    );
    // July..September = 3 months; ceil(100000/3)=33334; gap = 23334
    expect(projection.requiredMonthlySavingsMinor).toBe(33_334);
    expect(projection.savingsGapMinor).toBe(23_334);
    expect(projection.onPace).toBe(false);
  });

  it("marks completed goals with zero required savings and gap", () => {
    const projection = projectSavingsGoal(
      {
        targetAmountMinor: 100_000,
        currentSavedMinor: 100_000,
        targetDate: new Date("2026-12-31T00:00:00.000Z"),
      },
      0,
      new Date("2026-07-15T00:00:00.000Z"),
    );
    expect(projection).toMatchObject({
      remainingGoalMinor: 0,
      monthsRemaining: 0,
      requiredMonthlySavingsMinor: 0,
      savingsGapMinor: 0,
      onPace: true,
      isComplete: true,
    });
  });

  it("rejects invalid target dates and non-positive remaining periods", () => {
    expect(() =>
      projectSavingsGoal(
        {
          targetAmountMinor: 100_000,
          currentSavedMinor: 0,
          targetDate: new Date("2026-07-01T00:00:00.000Z"),
        },
        10_000,
        new Date("2026-07-15T00:00:00.000Z"),
      ),
    ).toThrow(DomainValidationError);

    expect(() =>
      wholeUtcMonthsRemaining(
        new Date("2026-07-15T00:00:00.000Z"),
        new Date("2026-07-15T00:00:00.000Z"),
      ),
    ).toThrow(/after the calculation date/i);

    expect(() =>
      projectSavingsGoal(
        {
          targetAmountMinor: -1,
          currentSavedMinor: 0,
          targetDate: new Date("2026-12-31T00:00:00.000Z"),
        },
        0,
        new Date("2026-07-15T00:00:00.000Z"),
      ),
    ).toThrow(/minor units/i);
  });

  it("counts a same-month later target date as one remaining period", () => {
    expect(
      wholeUtcMonthsRemaining(
        new Date("2026-07-15T00:00:00.000Z"),
        new Date("2026-07-31T00:00:00.000Z"),
      ),
    ).toBe(1);
  });
});

describe("DOMAIN-001 category eligibility invariants", () => {
  it("never marks essential categories as recommendation-eligible", () => {
    expect(isEssentialCategory("rent")).toBe(true);
    expect(isEligibleForRecommendation("rent")).toBe(false);
    expect(isEligibleForRecommendation("groceries")).toBe(false);
    expect(isEligibleForRecommendation("subscriptions")).toBe(true);
    expect([...DISCRETIONARY_RECOMMENDATION_PRIORITY]).toEqual([
      "subscriptions",
      "restaurants",
      "entertainment",
      "shopping",
      "other",
    ]);
  });
});
