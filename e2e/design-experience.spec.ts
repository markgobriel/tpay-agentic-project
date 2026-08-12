import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const evidenceDir = join(process.cwd(), ".agent", "evidence", "DESIGN-001");
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

test.describe("DESIGN-001 Apple-inspired experience", () => {
  test("desktop hierarchy, invalid/valid goal, recommendations, focus, screenshots", async ({
    page,
  }) => {
    const { consoleErrors, failedRequests } = await collectPageIssues(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.getByTestId("balance-panel")).toBeVisible();
    await expect(page.getByTestId("month-panel")).toBeVisible();
    await expect(page.getByTestId("current-balance")).toHaveText("$2,450.00");
    await expect(page.getByTestId("monthly-income")).toHaveText("$5,000.00");
    await expect(page.getByTestId("goal-panel")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Transaction history" })).toBeVisible();

    const monthInput = page.getByLabel("Selected UTC month");
    await monthInput.focus();
    await expect(monthInput).toBeFocused();

    await page.screenshot({
      path: join(evidenceDir, "desktop-dashboard.png"),
      fullPage: true,
    });

    await page.getByTestId("goal-target-input").fill("-25");
    await page.getByTestId("goal-save-button").click();
    await expect(page.getByTestId("goal-error")).toBeVisible();
    await expect(page.getByTestId("goal-error")).toContainText(/non-negative/i);

    await page.getByTestId("goal-name-input").fill("Design Goal");
    await page.getByTestId("goal-target-input").fill("20000.00");
    await page.getByTestId("goal-saved-input").fill("0.00");
    await page.getByTestId("goal-date-input").fill("2026-12-31");
    await page.getByTestId("goal-save-button").click();
    await expect(page.getByTestId("goal-status")).toContainText("saved");
    await expect(page.getByTestId("goal-on-pace")).toHaveText("Behind pace");

    await expect(page.getByTestId("recommendations-panel")).toBeVisible();
    await expect(page.getByTestId("rec-gap")).toHaveText("$1,128.34");
    await expect(page.getByTestId("rec-total-cuts")).toHaveText("$455.00");
    await expect(page.getByTestId("rec-list")).toContainText("subscriptions");
    await expect(page.getByTestId("rec-list")).not.toContainText("rent");

    await page.screenshot({
      path: join(evidenceDir, "desktop-after-goal.png"),
      fullPage: true,
    });
    await assertNoHorizontalOverflow(page);

    expect(consoleErrors, `console errors: ${consoleErrors.join("; ")}`).toEqual([]);
    expect(failedRequests, `failed requests: ${failedRequests.join("; ")}`).toEqual([]);
  });

  test("mobile hierarchy without overflow", async ({ page }) => {
    const { consoleErrors, failedRequests } = await collectPageIssues(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByTestId("current-balance")).toBeVisible();
    await expect(page.getByTestId("month-panel")).toBeVisible();
    await expect(page.getByTestId("goal-panel")).toBeVisible();
    await expect(page.getByTestId("recommendations-panel")).toBeVisible();

    await page.getByTestId("goal-name-input").fill("Mobile Goal");
    await page.getByTestId("goal-target-input").fill("20000.00");
    await page.getByTestId("goal-saved-input").fill("0.00");
    await page.getByTestId("goal-date-input").fill("2026-12-31");
    await page.getByTestId("goal-save-button").click();
    await expect(page.getByTestId("goal-status")).toContainText("saved");
    await expect(page.getByTestId("rec-list")).toBeVisible();

    await page.screenshot({
      path: join(evidenceDir, "mobile-dashboard.png"),
      fullPage: true,
    });
    await assertNoHorizontalOverflow(page);

    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });
});
