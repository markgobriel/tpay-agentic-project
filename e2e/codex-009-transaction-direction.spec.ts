import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const evidenceDir = join(process.cwd(), ".agent", "evidence", "CODEX-009");
mkdirSync(evidenceDir, { recursive: true });

function collectPageIssues(page: Page) {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("favicon.ico")) {
      consoleErrors.push(message.text());
    }
  });
  page.on("response", (response) => {
    if (!response.url().includes("favicon.ico") && response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    if (!request.url().includes("favicon.ico")) {
      failedRequests.push(`${request.failure()?.errorText ?? "request failed"} ${request.url()}`);
    }
  });
  return { consoleErrors, failedRequests };
}

async function expectDirectionCues(page: Page) {
  const rows = page.locator(".transactions tbody tr");
  await expect(rows).toHaveCount(12);

  const income = rows.first();
  await expect(income.locator(".txn-type")).toHaveText("Income");
  await expect(income.locator(".txn-type")).toBeVisible();
  await expect(income.locator(".txn-amount")).toHaveText("+$5,000.00");

  const expense = rows.nth(1);
  await expect(expense.locator(".txn-type")).toHaveText("Expense");
  await expect(expense.locator(".txn-type")).toBeVisible();
  await expect(expense.locator(".txn-amount")).toHaveText("−$1,500.00");

  await expect(page.getByTestId("goal-panel")).toContainText("Dec 31, 2026");
}

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const) {
  test(`${viewport.name} makes transaction direction explicit`, async ({ page }) => {
    const issues = collectPageIssues(page);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await expectDirectionCues(page);

    const width = await page.evaluate(() => ({
      page: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(width.page).toBeLessThanOrEqual(width.viewport + 1);

    await page.screenshot({
      path: join(evidenceDir, `${viewport.name}-direction.png`),
      fullPage: true,
    });

    expect(issues.consoleErrors).toEqual([]);
    expect(issues.failedRequests).toEqual([]);
  });
}
