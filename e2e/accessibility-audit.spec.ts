import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

async function expectNoAccessibilityViolations(page: Page, state: string): Promise<void> {
  const result = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
  const summary = result.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    targets: violation.nodes.flatMap((node) => node.target),
  }));
  expect(summary, `${state} accessibility violations`).toEqual([]);
}

async function expectDashboardLoaded(page: Page): Promise<void> {
  await expect(page.getByTestId("current-balance")).toHaveText("$2,450.00");
  await expect(page.getByTestId("goal-pace")).toBeVisible();
  await expect(page.getByTestId("recommendations-panel")).toBeVisible();
  await expect(page.getByTestId("category-breakdown")).toBeVisible();
  await expect(page.getByTestId("transactions-panel").locator("tbody tr")).toHaveCount(12);
}

test.describe("CODEX-008 whole-page accessibility audit", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("save-spend-demo-guide-dismissed");
    });
  });

  test("desktop default and progressive states have no detectable violations", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/");
    await expectDashboardLoaded(page);
    await expectNoAccessibilityViolations(page, "desktop default");

    await page.getByTestId("demo-guide-toggle").click();
    await page.getByTestId("goal-edit-button").click();
    await expect(page.getByTestId("demo-guide-dismiss")).toBeVisible();
    await expect(page.getByTestId("goal-form")).toBeVisible();
    await expectNoAccessibilityViolations(page, "desktop expanded guide and goal editor");

    await page.getByTestId("goal-target-input").fill("-1");
    await page.getByTestId("goal-save-button").click();
    await expect(page.getByTestId("goal-form-error")).toBeVisible();
    await expectNoAccessibilityViolations(page, "desktop invalid goal error");
  });

  test("mobile default and open editor have no detectable violations", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expectDashboardLoaded(page);
    await expect(page.getByTestId("balance-panel")).toBeInViewport();
    await expectNoAccessibilityViolations(page, "mobile default");

    await page.getByTestId("goal-edit-button").click();
    await expect(page.getByTestId("goal-form")).toBeVisible();
    await expectNoAccessibilityViolations(page, "mobile goal editor");
  });
});
