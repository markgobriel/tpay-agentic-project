import { expect, test } from "@playwright/test";

test.describe("QUALITY-001 core Save & Spend flow", () => {
  test("account → goal → recommendations with accessible labels", async ({ page }) => {
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

    await page.goto("/");
    await expect(page.getByTestId("current-balance")).toHaveText("$2,450.00");
    await expect(page.getByTestId("monthly-income")).toHaveText("$5,000.00");
    await expect(page.getByRole("heading", { name: "Transaction history" })).toBeVisible();

    const monthInput = page.getByLabel("Selected UTC month");
    await expect(monthInput).toBeVisible();
    await monthInput.focus();
    await expect(monthInput).toBeFocused();

    await page.getByTestId("goal-edit-button").click();
    await page.getByTestId("goal-name-input").fill("Quality Goal");
    await page.getByTestId("goal-target-input").fill("20000.00");
    await page.getByTestId("goal-saved-input").fill("0.00");
    await page.getByTestId("goal-date-input").fill("2026-12-31");
    await page.getByTestId("goal-save-button").click();
    await expect(page.getByTestId("goal-status")).toContainText("saved");
    await expect(page.getByTestId("goal-on-pace")).toHaveText("Behind pace");

    await expect(page.getByTestId("recommendations-panel")).toBeVisible();
    await expect(page.getByTestId("rec-gap")).toHaveText("$1,128.34");
    await expect(page.getByTestId("rec-total-cuts")).toHaveText("$455.00");
    await expect(page.getByTestId("rec-unresolved")).toHaveText("$673.34");
    await expect(page.getByTestId("rec-list")).toContainText("subscriptions");
    await expect(page.getByTestId("rec-list")).not.toContainText("rent");

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId("current-balance")).toBeVisible();
    await expect(page.getByTestId("recommendations-panel")).toBeVisible();

    expect(consoleErrors, `console errors: ${consoleErrors.join("; ")}`).toEqual([]);
    expect(failedRequests, `failed requests: ${failedRequests.join("; ")}`).toEqual([]);
  });
});
