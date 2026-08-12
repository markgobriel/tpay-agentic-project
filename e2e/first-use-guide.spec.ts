import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const evidenceDir = join(process.cwd(), ".agent", "evidence", "EVOLVE-002");
mkdirSync(evidenceDir, { recursive: true });

test.describe("EVOLVE-002 first-use demo guidance", () => {
  test("shows dismissible mock walkthrough on desktop and mobile", async ({ page }) => {
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

    const guide = page.getByTestId("demo-guide");
    await expect(guide).toBeVisible();
    await expect(guide).toContainText("mock account");
    await expect(guide).toContainText("discretionary");
    await expect(guide).toContainText("not personal financial advice");
    await expect(page.getByTestId("balance-panel")).toBeVisible();

    await page.screenshot({
      path: join(evidenceDir, "desktop-guide.png"),
      fullPage: false,
    });

    await page.getByTestId("demo-guide-dismiss").click();
    await expect(guide).toHaveCount(0);

    await page.reload();
    await expect(page.getByTestId("demo-guide")).toHaveCount(0);
    await expect(page.getByTestId("balance-panel")).toBeVisible();

    await page.evaluate(() => {
      window.localStorage.removeItem("save-spend-demo-guide-dismissed");
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await expect(page.getByTestId("demo-guide")).toBeVisible();
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);

    await page.screenshot({
      path: join(evidenceDir, "mobile-guide.png"),
      fullPage: false,
    });

    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });
});
