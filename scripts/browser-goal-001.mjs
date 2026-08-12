/**
 * GOAL-001 browser validation: load goal, update it, verify pace fields, reject invalid input.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const baseUrl = process.env.WEB_URL ?? "http://127.0.0.1:5173";
const chromePath =
  process.env.CHROME_PATH ??
  "/Users/markgobriel/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const evidenceDir = join(process.cwd(), ".agent", "evidence", "GOAL-001");
mkdirSync(evidenceDir, { recursive: true });

const failedRequests = [];
const consoleErrors = [];

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
});
const page = await browser.newPage();

page.on("console", (msg) => {
  if (msg.type() === "error") {
    const text = msg.text();
    const url = msg.location().url ?? "";
    if (url.includes("favicon.ico") || text.includes("favicon.ico")) return;
    consoleErrors.push(text);
  }
});
page.on("requestfailed", (req) => {
  if (req.url().includes("favicon.ico")) return;
  failedRequests.push({ url: req.url(), error: req.failure()?.errorText ?? "unknown" });
});
page.on("response", (res) => {
  if (res.url().includes("favicon.ico")) return;
  if (res.status() >= 400 && res.request().method() !== "PUT") {
    // PUT 400 is expected during invalid-input check.
    failedRequests.push({ url: res.url(), error: `HTTP ${res.status()}` });
  }
});

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.getByTestId("goal-pace").waitFor({ timeout: 10_000 });

const initialRequired = await page.getByTestId("goal-required-monthly").innerText();
const initialGap = await page.getByTestId("goal-gap").innerText();
const initialPace = await page.getByTestId("goal-on-pace").innerText();
const initialSaved = await page.getByTestId("goal-current-saved").innerText();

await page.getByTestId("goal-name-input").fill("Vacation Fund");
await page.getByTestId("goal-target-input").fill("3000.00");
await page.getByTestId("goal-saved-input").fill("500.00");
await page.getByTestId("goal-date-input").fill("2026-12-31");
await page.getByTestId("goal-save-button").click();
await page.getByTestId("goal-status").waitFor({ timeout: 10_000 });

const afterName = await page.getByTestId("goal-name-input").inputValue();
const afterRequired = await page.getByTestId("goal-required-monthly").innerText();
const afterGap = await page.getByTestId("goal-gap").innerText();
const afterPace = await page.getByTestId("goal-on-pace").innerText();
const afterSaved = await page.getByTestId("goal-current-saved").innerText();

await page.getByTestId("goal-target-input").fill("-10");
await page.getByTestId("goal-save-button").click();
await page.getByTestId("goal-error").waitFor({ timeout: 5_000 });
const invalidError = await page.getByTestId("goal-error").innerText();

// Ensure invalid input did not clear the successful save.
const nameAfterInvalid = await page.getByTestId("goal-name-input").inputValue();

await page.screenshot({ path: join(evidenceDir, "goal-desktop.png"), fullPage: true });

const report = {
  taskId: "GOAL-001",
  at: new Date().toISOString(),
  baseUrl,
  initial: { initialRequired, initialGap, initialPace, initialSaved },
  afterSave: { afterName, afterRequired, afterGap, afterPace, afterSaved },
  invalidError,
  nameAfterInvalid,
  consoleErrors,
  failedRequests,
};

const ok =
  afterName === "Vacation Fund" &&
  afterSaved === "$500.00" &&
  nameAfterInvalid === "Vacation Fund" &&
  /non-negative|invalid|amount/i.test(invalidError) &&
  afterRequired.length > 0 &&
  afterGap.length > 0 &&
  (afterPace === "On pace" || afterPace === "Behind pace") &&
  consoleErrors.length === 0 &&
  failedRequests.length === 0;

report.pass = ok;
writeFileSync(join(evidenceDir, "browser-report.json"), JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify(report, null, 2));
if (!ok) process.exitCode = 1;
