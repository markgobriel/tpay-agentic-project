import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const evidenceDir = join(process.cwd(), ".agent", "evidence", "CODEX-002");
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

test.describe("CODEX-002 responsive transaction activity", () => {
  test("desktop retains a complete semantic transaction table", async ({ page }) => {
    const issues = collectPageIssues(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.getByRole("columnheader", { name: "Category" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Type" })).toBeVisible();
    await expect(page.locator(".transactions tbody tr").first()).toContainText("Jul 1, 2026");
    await expect(page.locator(".transactions tbody tr").first()).toContainText("salary");

    await page.getByTestId("transactions-panel").screenshot({
      path: join(evidenceDir, "desktop-activity.png"),
    });

    expect(issues.consoleErrors).toEqual([]);
    expect(issues.failedRequests).toEqual([]);
  });

  test("mobile prioritizes merchant and amount with readable metadata", async ({ page }) => {
    const issues = collectPageIssues(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const firstRow = page.locator(".transactions tbody tr").first();
    await expect(firstRow.getByText("Acme Corp Payroll")).toBeVisible();
    await expect(firstRow.getByText("+$5,000.00", { exact: true })).toBeVisible();
    await expect(firstRow.getByText("Jul 1, 2026")).toBeVisible();
    await expect(firstRow.locator(".txn-category-label")).toHaveText("salary");
    await expect(firstRow.locator(".txn-category-label")).toBeVisible();
    await expect(firstRow.locator(".txn-type")).toHaveText("Income");
    await expect(firstRow.locator(".txn-type")).toBeVisible();

    const firstExpense = page.locator(".transactions tbody tr").nth(1);
    await expect(firstExpense.locator(".txn-type")).toHaveText("Expense");
    await expect(firstExpense.locator(".txn-type")).toBeVisible();
    await expect(firstExpense.locator(".txn-amount")).toHaveText("−$1,500.00");

    const layout = await firstRow.evaluate((row) => {
      const merchant = row.querySelector(".txn-merchant")?.getBoundingClientRect();
      const amount = row.querySelector(".txn-amount")?.getBoundingClientRect();
      const date = row.querySelector(".txn-date")?.getBoundingClientRect();
      return {
        merchantTop: merchant?.top,
        amountTop: amount?.top,
        dateHeight: date?.height,
        rowWidth: row.getBoundingClientRect().width,
        viewportWidth: document.documentElement.clientWidth,
        pageWidth: document.documentElement.scrollWidth,
      };
    });
    expect(Math.abs((layout.merchantTop ?? 0) - (layout.amountTop ?? 0))).toBeLessThan(20);
    expect(layout.dateHeight).toBeLessThan(24);
    expect(layout.rowWidth).toBeLessThan(layout.viewportWidth);
    expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);

    await page.getByTestId("transactions-panel").screenshot({
      path: join(evidenceDir, "mobile-activity.png"),
    });

    expect(issues.consoleErrors).toEqual([]);
    expect(issues.failedRequests).toEqual([]);
  });
});
