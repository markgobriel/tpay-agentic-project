import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { MOCK_ACCOUNT_ID, seedMockFinanceData, type DbClient } from "@save-and-spend/db";
import { startTestDatabase, type LocalPostgres } from "@save-and-spend/db/testing";
import { createApp } from "./app.js";

describe("API-001 finance HTTP contracts", () => {
  let db: DbClient;
  let app: ReturnType<typeof createApp>;
  let postgres: LocalPostgres | undefined;

  beforeAll(async () => {
    postgres = await startTestDatabase("api");
    db = postgres.db;
    await seedMockFinanceData(db);
    app = createApp({
      db,
      now: () => new Date("2026-07-15T12:00:00.000Z"),
    });
  }, 30_000);

  afterAll(async () => {
    await postgres?.close();
  });

  it("returns the mock account summary", async () => {
    const response = await request(app).get("/account").expect(200);
    expect(response.headers["x-powered-by"]).toBeUndefined();
    expect(response.body).toMatchObject({
      id: MOCK_ACCOUNT_ID,
      name: "Everyday Checking",
      currencyCode: "USD",
      currentBalanceMinor: 245_000,
    });
  });

  it("returns client-safe JSON for malformed, oversized, and unknown requests", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      const malformed = await request(app)
        .put("/savings-goal")
        .set("Content-Type", "application/json")
        .send('{"name":')
        .expect(400);
      expect(malformed.body).toEqual({
        error: { code: "invalid_json", message: "Request body must contain valid JSON." },
      });
      expect(malformed.headers["x-powered-by"]).toBeUndefined();

      const oversized = await request(app)
        .put("/savings-goal")
        .send({ name: "x".repeat(33 * 1024) })
        .expect(413);
      expect(oversized.body.error.code).toBe("request_too_large");
      expect(oversized.body.error.message).toContain("32 KB");

      const missing = await request(app).get("/does-not-exist").expect(404);
      expect(missing.headers["content-type"]).toMatch(/application\/json/);
      expect(missing.body).toEqual({
        error: {
          code: "route_not_found",
          message: "No API route matches GET /does-not-exist.",
        },
      });
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  it("returns seeded transactions without embedding domain math in the route", async () => {
    const response = await request(app).get("/transactions").expect(200);
    expect(response.body.accountId).toBe(MOCK_ACCOUNT_ID);
    expect(response.body.transactions).toHaveLength(12);
    expect(response.body.transactions[0]).toMatchObject({
      type: "income",
      category: "salary",
      amountMinor: 500_000,
    });
  });

  it("returns monthly analytics for a valid UTC month", async () => {
    const response = await request(app).get("/analytics").query({ month: "2026-07" }).expect(200);
    expect(response.body.yearMonth).toBe("2026-07");
    expect(response.body.incomeMinor).toBe(500_000);
    expect(response.body.spendingMinor).toBeGreaterThan(0);
    expect(response.body.currentMonthlySavingsMinor).toBe(
      response.body.incomeMinor - response.body.spendingMinor,
    );
    expect(Array.isArray(response.body.categorySpending)).toBe(true);
  });

  it("rejects missing or invalid analytics months with client-safe errors", async () => {
    const missing = await request(app).get("/analytics").expect(400);
    expect(missing.body.error.code).toBe("missing_month");

    const invalid = await request(app).get("/analytics").query({ month: "2026-13" }).expect(400);
    expect(invalid.body.error.code).toBe("invalid_year_month");
    expect(typeof invalid.body.error.message).toBe("string");
  });

  it("returns the savings goal with domain-projected pace fields", async () => {
    const response = await request(app).get("/savings-goal").expect(200);
    expect(response.body).toMatchObject({
      accountId: MOCK_ACCOUNT_ID,
      name: "Emergency Fund",
      targetAmountMinor: 600_000,
      currentSavedMinor: 120_000,
      analyticsYearMonth: "2026-07",
      isComplete: false,
    });
    expect(response.body.requiredMonthlySavingsMinor).toBeGreaterThan(0);
    expect(Number.isInteger(response.body.savingsGapMinor)).toBe(true);
    expect(typeof response.body.onPace).toBe("boolean");
  });

  it("returns discretionary recommendations without cutting essentials", async () => {
    const response = await request(app).get("/recommendations").expect(200);
    expect(response.body.accountId).toBe(MOCK_ACCOUNT_ID);
    expect(response.body.analyticsYearMonth).toBe("2026-07");
    expect(Number.isInteger(response.body.totalProposedReductionMinor)).toBe(true);
    expect(Number.isInteger(response.body.unresolvedGapMinor)).toBe(true);
    expect(Array.isArray(response.body.recommendations)).toBe(true);
    for (const line of response.body.recommendations) {
      expect(["subscriptions", "restaurants", "entertainment", "shopping", "other"]).toContain(
        line.category,
      );
      expect(line.proposedReductionMinor).toBeGreaterThan(0);
      expect(line.proposedReductionMinor).toBeLessThanOrEqual(line.currentSpendingMinor);
    }
    const priorities = response.body.recommendations.map(
      (line: { priority: number }) => line.priority,
    );
    expect(priorities).toEqual([...priorities].sort((a: number, b: number) => a - b));
  });

  it("updates the savings goal and rejects invalid payloads without mutating state", async () => {
    const before = await request(app).get("/savings-goal").expect(200);

    const updated = await request(app)
      .put("/savings-goal")
      .send({
        name: "Vacation Fund",
        targetAmountMinor: 300_000,
        currentSavedMinor: 50_000,
        targetDate: "2026-12-31T00:00:00.000Z",
      })
      .expect(200);
    expect(updated.body.name).toBe("Vacation Fund");
    expect(updated.body.targetAmountMinor).toBe(300_000);
    expect(updated.body.currentSavedMinor).toBe(50_000);

    const invalid = await request(app)
      .put("/savings-goal")
      .send({
        name: "Bad",
        targetAmountMinor: -1,
        currentSavedMinor: 0,
        targetDate: "2026-12-31T00:00:00.000Z",
      })
      .expect(400);
    expect(invalid.body.error.code).toBe("invalid_target_amount");

    const pastTarget = await request(app)
      .put("/savings-goal")
      .send({
        name: "Too Soon",
        targetAmountMinor: 100_000,
        currentSavedMinor: 0,
        targetDate: "2026-01-01T00:00:00.000Z",
      })
      .expect(400);
    expect(pastTarget.body.error.code).toBe("invalid_target_date");

    const afterReject = await request(app).get("/savings-goal").expect(200);
    expect(afterReject.body.name).toBe("Vacation Fund");
    expect(afterReject.body.targetAmountMinor).toBe(300_000);
    expect(afterReject.body.name).not.toBe("Too Soon");
    expect(before.body.name).toBe("Emergency Fund");
  });
});
