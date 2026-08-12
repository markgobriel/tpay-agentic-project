import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const evidenceDir = join(process.cwd(), ".agent", "evidence", "EVOLVE-001");
mkdirSync(evidenceDir, { recursive: true });

test.describe("EVOLVE-001 category visualization", () => {
  test("shows accessible relative bars on desktop and mobile", async ({ page }) => {
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("favicon.ico")) {
        consoleErrors.push(msg.text());
      }
    });
    page.on("response", (res) => {
      if (!res.url().includes("favicon.ico") && res.status() >= 400) {
        failedRequests.push(`${res.status()} ${res.url()}`);
      }
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const breakdown = page.getByTestId("category-breakdown");
    await expect(breakdown).toBeVisible();
    await expect(breakdown.getByRole("meter").first()).toBeVisible();
    await expect(breakdown).toContainText("rent");
    await expect(breakdown).toContainText("%");

    await page.screenshot({
      path: join(evidenceDir, "desktop-categories.png"),
      fullPage: true,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileBreakdown = page.getByTestId("category-breakdown");
    await expect(mobileBreakdown).toBeVisible();
    await expect(mobileBreakdown.getByRole("meter").first()).toBeVisible();
    const firstAmount = mobileBreakdown.getByTestId("category-bar-amount").first();
    await expect(firstAmount).toBeVisible();
    await expect(firstAmount).toContainText("$");
    await expect(firstAmount).toContainText("%");
    const amountBox = await firstAmount.boundingBox();
    expect(amountBox).not.toBeNull();
    expect(amountBox!.width).toBeGreaterThan(8);
    expect(amountBox!.height).toBeGreaterThan(8);
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);

    await page.screenshot({
      path: join(evidenceDir, "mobile-categories.png"),
      fullPage: true,
    });

    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });
});
