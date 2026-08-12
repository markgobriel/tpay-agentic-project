import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const evidenceDir = join(process.cwd(), ".agent", "evidence", "UX-002");
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

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

test.describe("UX-002 plain-language cut explanations", () => {
  test("desktop: dollar explanations without minor-units jargon", async ({ page }) => {
    const { consoleErrors, failedRequests } = await collectPageIssues(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await page.getByTestId("goal-edit-button").click();
    await page.getByTestId("goal-target-input").fill("20000.00");
    await page.getByTestId("goal-saved-input").fill("0.00");
    await page.getByTestId("goal-date-input").fill("2026-12-31");
    await page.getByTestId("goal-save-button").click();
    await expect(page.getByTestId("goal-on-pace")).toHaveText("Behind pace");
    await expect(page.getByTestId("rec-list")).toBeVisible();

    const explain = page.getByTestId("rec-explain-subscriptions");
    await expect(explain).toContainText("$45.00");
    await expect(explain).not.toContainText(/minor units/i);
    await expect(explain).not.toContainText(/\b4500\b/);
    await expect(page.getByTestId("rec-list")).toContainText("subscriptions");

    await page.screenshot({
      path: join(evidenceDir, "desktop-plain-explanations.png"),
      fullPage: true,
    });
    await assertNoHorizontalOverflow(page);
    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });

  test("mobile: plain explanations without overflow", async ({ page }) => {
    const { consoleErrors, failedRequests } = await collectPageIssues(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByTestId("goal-edit-button").click();
    await page.getByTestId("goal-target-input").fill("20000.00");
    await page.getByTestId("goal-saved-input").fill("0.00");
    await page.getByTestId("goal-date-input").fill("2026-12-31");
    await page.getByTestId("goal-save-button").click();
    await expect(page.getByTestId("rec-explain-subscriptions")).toContainText("$45.00");
    await expect(page.getByTestId("rec-explain-subscriptions")).not.toContainText(/minor/i);
    await page.screenshot({
      path: join(evidenceDir, "mobile-plain-explanations.png"),
      fullPage: true,
    });
    await assertNoHorizontalOverflow(page);
    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });
});
