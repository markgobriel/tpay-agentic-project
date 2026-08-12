import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const evidenceDir = join(process.cwd(), ".agent", "evidence", "UX-001");
mkdirSync(evidenceDir, { recursive: true });

async function collectPageIssues(page: Page) {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (text.includes("favicon.ico")) return;
      consoleErrors.push(text);
    }
  });
  page.on("response", (res) => {
    if (res.url().includes("favicon.ico")) return;
    if (res.status() >= 400) {
      failedRequests.push(`${res.status()} ${res.url()}`);
    }
  });
  return { consoleErrors, failedRequests };
}

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
    };
  });
  expect(overflow.scrollWidth, "page should not horizontally overflow").toBeLessThanOrEqual(
    overflow.clientWidth + 1,
  );
}

test.describe("UX-001 pace month clarity and honest empty cuts", () => {
  test("desktop: names calculation month, mismatch control, helpers, secondary Got it", async ({
    page,
  }) => {
    const { consoleErrors, failedRequests } = await collectPageIssues(page);
    await page.addInitScript(() => {
      try {
        localStorage.removeItem("save-spend-demo-guide-dismissed");
      } catch {
        /* ignore */
      }
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.getByTestId("goal-calc-month")).toContainText("July 2026");
    await expect(page.getByTestId("rec-calc-month")).toContainText("July 2026");
    await expect(page.getByTestId("goal-amount-help")).toContainText("1200.00");

    const gotIt = page.getByTestId("demo-guide-dismiss");
    await expect(gotIt).toHaveClass(/secondary-button/);
    await expect(page.getByTestId("goal-save-button")).toHaveClass(/primary-button/);

    // Force a month mismatch against e2e CALCULATION_DATE (July).
    await page.getByLabel("Selected UTC month").fill("2026-08");
    await expect(page.getByTestId("month-mismatch")).toBeVisible();
    await expect(page.getByTestId("month-mismatch")).toContainText("July 2026");
    await expect(page.getByTestId("month-mismatch")).toContainText("August 2026");
    await page.screenshot({
      path: join(evidenceDir, "desktop-mismatch.png"),
      fullPage: true,
    });

    await page.getByTestId("show-pace-month").click();
    await expect(page.getByTestId("month-mismatch")).toHaveCount(0);
    await expect(page.getByLabel("Selected UTC month")).toHaveValue("2026-07");

    // Raise the goal so a gap exists, then mock empty discretionary recommendations.
    await page.getByTestId("goal-target-input").fill("50000.00");
    await page.getByTestId("goal-saved-input").fill("0.00");
    await page.getByTestId("goal-date-input").fill("2026-11-30");
    await page.getByTestId("goal-save-button").click();
    await expect(page.getByTestId("goal-status")).toContainText("saved");

    await page.route("**/recommendations", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          accountId: "acct_mock_primary",
          // Empty calculation month (matches live no-CALCULATION_DATE audit).
          analyticsYearMonth: "2026-08",
          savingsGapMinor: 500000,
          currentMonthlySavingsMinor: 0,
          totalProposedReductionMinor: 0,
          unresolvedGapMinor: 500000,
          projectedMonthlySavingsMinor: 0,
          recommendations: [],
        }),
      });
    });
    await page.getByTestId("goal-save-button").click();
    await expect(page.getByTestId("rec-calc-month")).toContainText("August 2026");
    await expect(page.getByTestId("rec-empty")).toContainText(/August 2026/i);
    await expect(page.getByTestId("rec-empty")).toContainText(
      /no discretionary spending available/i,
    );
    await expect(page.getByTestId("rec-empty")).not.toContainText(/No discretionary cuts needed/i);

    await page.screenshot({
      path: join(evidenceDir, "desktop-honest-empty.png"),
      fullPage: true,
    });
    await assertNoHorizontalOverflow(page);
    expect(consoleErrors, `console errors: ${consoleErrors.join("; ")}`).toEqual([]);
    expect(failedRequests, `failed requests: ${failedRequests.join("; ")}`).toEqual([]);
  });

  test("mobile: mismatch and calc-month labels without overflow", async ({ page }) => {
    const { consoleErrors, failedRequests } = await collectPageIssues(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByTestId("goal-calc-month")).toBeVisible();
    await page.getByLabel("Selected UTC month").fill("2026-08");
    await expect(page.getByTestId("month-mismatch")).toBeVisible();
    await page.screenshot({
      path: join(evidenceDir, "mobile-mismatch.png"),
      fullPage: true,
    });
    await assertNoHorizontalOverflow(page);
    expect(consoleErrors, `console errors: ${consoleErrors.join("; ")}`).toEqual([]);
    expect(failedRequests, `failed requests: ${failedRequests.join("; ")}`).toEqual([]);
  });
});
