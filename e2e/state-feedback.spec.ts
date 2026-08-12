import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const evidenceDir = join(process.cwd(), ".agent", "evidence", "EVOLVE-003");
mkdirSync(evidenceDir, { recursive: true });

test.describe("EVOLVE-003 dashboard state feedback", () => {
  test("shows recoverable dashboard error and restores on retry", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("favicon.ico")) {
        consoleErrors.push(msg.text());
      }
    });

    let failAccount = true;
    await page.route("**/account", async (route) => {
      if (failAccount) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: { message: "Mock account unavailable." } }),
        });
        return;
      }
      await route.continue();
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const dashboardError = page.getByTestId("dashboard-error");
    await expect(dashboardError).toBeVisible();
    await expect(dashboardError).toContainText("Mock account unavailable.");
    await expect(page.getByTestId("balance-empty")).toBeVisible();
    await expect(page.getByTestId("month-empty")).toBeVisible();
    await expect(page.getByTestId("categories-empty")).toBeVisible();

    await page.screenshot({
      path: join(evidenceDir, "desktop-error.png"),
      fullPage: false,
    });

    failAccount = false;
    await dashboardError.getByRole("button", { name: "Retry" }).click();
    await expect(page.getByTestId("balance-panel")).toBeVisible();
    await expect(page.getByTestId("current-balance")).toHaveText("$2,450.00");
    await expect(page.getByTestId("dashboard-error")).toHaveCount(0);

    await page.setViewportSize({ width: 390, height: 844 });
    failAccount = true;
    await page.reload();
    await expect(page.getByTestId("dashboard-error")).toBeVisible();
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
    await page.screenshot({
      path: join(evidenceDir, "mobile-error.png"),
      fullPage: false,
    });

    // Failed /account responses are intentional; ignore matching console noise.
    expect(consoleErrors.filter((text) => !text.includes("Failed to load"))).toEqual([]);
  });

  test("goal save reports pending then success status", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.getByTestId("goal-panel")).toBeVisible();

    await page.route("**/savings-goal", async (route) => {
      if (route.request().method() === "PUT") {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
      await route.continue();
    });

    await page.getByTestId("goal-name-input").fill("Emergency Fund");
    await page.getByTestId("goal-save-button").click();
    await expect(page.getByTestId("goal-status")).toContainText(/Saving goal|Savings goal saved/);
    await expect(page.getByTestId("goal-status")).toHaveText("Savings goal saved.");

    await page.screenshot({
      path: join(evidenceDir, "desktop-goal-saved.png"),
      fullPage: false,
    });
  });
});
