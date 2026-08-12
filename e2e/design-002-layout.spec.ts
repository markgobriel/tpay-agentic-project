import { expect, test, type Page } from "@playwright/test";

function monitorBrowser(page: Page) {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    if (!request.url().endsWith("/favicon.ico")) {
      failedRequests.push(`failed ${request.url()}: ${request.failure()?.errorText ?? "unknown"}`);
    }
  });

  return { consoleErrors, failedRequests };
}

test.describe("DESIGN-002 authored financial workspace", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("save-spend-demo-guide-dismissed");
    });
  });

  test("desktop composes overview, planning, and activity into distinct regions", async ({
    page,
  }) => {
    const health = monitorBrowser(page);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Your money, clearly." })).toBeVisible();
    await expect(page.getByTestId("current-balance")).toHaveText("$2,450.00");

    const balanceBox = await page.getByTestId("balance-panel").boundingBox();
    const monthBox = await page.getByTestId("month-panel").boundingBox();
    const goalBox = await page.getByTestId("goal-panel").boundingBox();
    const recommendationsBox = await page
      .getByRole("heading", { name: "Cut suggestions" })
      .boundingBox();
    const categoriesBox = await page.getByTestId("categories-panel").boundingBox();
    const transactionsBox = await page.getByTestId("transactions-panel").boundingBox();

    expect(balanceBox).not.toBeNull();
    expect(monthBox).not.toBeNull();
    expect(goalBox).not.toBeNull();
    expect(recommendationsBox).not.toBeNull();
    expect(categoriesBox).not.toBeNull();
    expect(transactionsBox).not.toBeNull();
    expect(Math.abs(balanceBox!.y - monthBox!.y)).toBeLessThan(3);
    expect(monthBox!.x).toBeGreaterThan(balanceBox!.x + balanceBox!.width - 3);
    expect(recommendationsBox!.x).toBeGreaterThan(goalBox!.x);
    expect(transactionsBox!.x).toBeGreaterThan(categoriesBox!.x);

    const overviewStyle = await page.locator(".overview-surface").evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundImage: style.backgroundImage,
        backdropFilter: style.backdropFilter,
        boxShadow: style.boxShadow,
      };
    });
    expect(overviewStyle.backgroundImage).toBe("none");
    expect(overviewStyle.backdropFilter).toBe("none");
    expect(overviewStyle.boxShadow).toBe("none");
    await expect(page.getByTestId("goal-form")).toHaveCount(0);
    await expect(page.getByTestId("goal-edit-button")).toHaveAttribute("aria-expanded", "false");

    await page.screenshot({
      path: ".agent/evidence/DESIGN-002/desktop-workspace.png",
      fullPage: true,
    });

    await page.getByTestId("goal-edit-button").click();
    await expect(page.getByTestId("goal-edit-button")).toHaveAttribute("aria-expanded", "true");
    await page.getByTestId("goal-edit-button").focus();
    await expect(page.getByTestId("goal-edit-button")).toBeFocused();
    await page.getByTestId("goal-target-input").fill("-25");
    await page.getByTestId("goal-save-button").click();
    await expect(page.getByTestId("goal-form-error")).toBeVisible();

    await page.getByTestId("goal-name-input").fill("Presentation Goal");
    await page.getByTestId("goal-target-input").fill("20000.00");
    await page.getByTestId("goal-saved-input").fill("0.00");
    await page.getByTestId("goal-date-input").fill("2026-12-31");
    await page.getByTestId("goal-save-button").click();
    await expect(page.getByTestId("goal-status")).toHaveText("Savings goal saved.");
    await expect(page.getByTestId("recommendations-panel")).toBeVisible();

    await page.screenshot({
      path: ".agent/evidence/DESIGN-002/desktop-goal-editor.png",
      fullPage: true,
    });
    expect(health.consoleErrors).toEqual([]);
    expect(health.failedRequests).toEqual([]);
  });

  test("mobile preserves the same reading order without compression or overflow", async ({
    page,
  }) => {
    const health = monitorBrowser(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const balance = page.getByTestId("balance-panel");
    await expect(balance).toBeInViewport();
    await expect(page.getByTestId("current-balance")).toHaveText("$2,450.00");
    await expect(page.getByTestId("goal-form")).toHaveCount(0);

    const balanceBox = await balance.boundingBox();
    const monthBox = await page.getByTestId("month-panel").boundingBox();
    const goalBox = await page.getByTestId("goal-panel").boundingBox();
    const recBox = await page.getByRole("heading", { name: "Cut suggestions" }).boundingBox();
    expect(balanceBox).not.toBeNull();
    expect(monthBox).not.toBeNull();
    expect(goalBox).not.toBeNull();
    expect(recBox).not.toBeNull();
    expect(monthBox!.y).toBeGreaterThan(balanceBox!.y);
    expect(recBox!.y).toBeGreaterThan(goalBox!.y);

    await page.getByLabel("Selected UTC month").fill("2026-08");
    await expect(page.getByTestId("transactions-month-label")).toContainText("August 2026");
    await expect(page.getByTestId("transactions-empty")).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      page: document.documentElement.scrollWidth,
    }));
    expect(dimensions.page).toBe(dimensions.viewport);

    await page.screenshot({
      path: ".agent/evidence/DESIGN-002/mobile-workspace.png",
      fullPage: true,
    });
    expect(health.consoleErrors).toEqual([]);
    expect(health.failedRequests).toEqual([]);
  });
});
