import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const evidenceDir = join(process.cwd(), ".agent", "evidence", "UX-003");
mkdirSync(evidenceDir, { recursive: true });

async function collectPageIssues(page: Page) {
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
  return { consoleErrors, failedRequests };
}

test.describe("UX-003 month-scoped transaction history", () => {
  test("desktop: July rows, August empty, month label", async ({ page }) => {
    const { consoleErrors, failedRequests } = await collectPageIssues(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.getByTestId("transactions-month-label")).toContainText("July 2026");
    await expect(page.locator(".transactions tbody tr")).toHaveCount(12);
    await expect(page.locator(".transactions tbody")).toContainText("Jul 1, 2026");

    await page.screenshot({
      path: join(evidenceDir, "desktop-july-activity.png"),
      fullPage: true,
    });

    await page.getByLabel("Selected UTC month").fill("2026-08");
    await expect(page.getByTestId("transactions-month-label")).toContainText("August 2026");
    await expect(page.getByTestId("transactions-empty")).toContainText("August 2026");
    await expect(page.locator(".transactions tbody tr")).toHaveCount(0);

    await page.screenshot({
      path: join(evidenceDir, "desktop-august-empty.png"),
      fullPage: true,
    });

    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });

  test("mobile: month filter without overflow", async ({ page }) => {
    const { consoleErrors, failedRequests } = await collectPageIssues(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByTestId("transactions-month-label")).toContainText("July 2026");
    await page.getByLabel("Selected UTC month").fill("2026-08");
    await expect(page.getByTestId("transactions-empty")).toBeVisible();
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
    await page.screenshot({
      path: join(evidenceDir, "mobile-august-empty.png"),
      fullPage: true,
    });
    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });
});
