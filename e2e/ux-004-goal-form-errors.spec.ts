import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const evidenceDir = join(process.cwd(), ".agent", "evidence", "UX-004");
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

test.describe("UX-004 field-adjacent goal validation", () => {
  test("desktop: invalid error sits in the form, then valid save recovers", async ({ page }) => {
    const { consoleErrors, failedRequests } = await collectPageIssues(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.getByTestId("goal-calc-month")).toBeVisible();
    const priorName = await page.getByTestId("goal-name-input").inputValue();
    const target = page.getByTestId("goal-target-input");
    await target.click();
    await target.fill("-10");
    await expect(target).toHaveValue("-10");
    await page.getByTestId("goal-save-button").click();

    const formError = page.getByTestId("goal-form-error");
    await expect(formError).toBeVisible();
    await expect(page.getByTestId("goal-error")).toContainText(/non-negative|decimal/i);

    const errorBox = await formError.boundingBox();
    const formBox = await page.getByTestId("goal-form").boundingBox();
    const saveBox = await page.getByTestId("goal-save-button").boundingBox();
    expect(errorBox).toBeTruthy();
    expect(formBox).toBeTruthy();
    expect(saveBox).toBeTruthy();
    expect(errorBox!.y).toBeGreaterThan(formBox!.y);
    expect(errorBox!.y).toBeLessThan(saveBox!.y);

    await page.screenshot({
      path: join(evidenceDir, "desktop-form-error.png"),
      fullPage: true,
    });

    await page.getByTestId("goal-target-input").fill("20000.00");
    await page.getByTestId("goal-saved-input").fill("0.00");
    await page.getByTestId("goal-date-input").fill("2026-12-31");
    await page.getByTestId("goal-save-button").click();
    await expect(page.getByTestId("goal-status")).toContainText("saved");
    await expect(page.getByTestId("goal-form-error")).toHaveCount(0);
    // Prior invalid attempt must not wipe the loaded goal name field value path;
    // after valid save the name remains whatever was submitted (seeded or edited).
    await expect(page.getByTestId("goal-name-input")).toHaveValue(priorName);

    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });

  test("mobile: form error placement without overflow", async ({ page }) => {
    const { consoleErrors, failedRequests } = await collectPageIssues(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByTestId("goal-target-input").fill("-1");
    await page.getByTestId("goal-save-button").click();
    await expect(page.getByTestId("goal-form-error")).toBeVisible();
    await page.screenshot({
      path: join(evidenceDir, "mobile-form-error.png"),
      fullPage: true,
    });
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });
});
