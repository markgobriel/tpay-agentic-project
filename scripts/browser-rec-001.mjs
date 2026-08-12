/**
 * REC-001 browser validation: create a savings gap, then verify discretionary recommendation math.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const baseUrl = process.env.WEB_URL ?? "http://127.0.0.1:5173";
const chromePath =
  process.env.CHROME_PATH ??
  "/Users/markgobriel/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const evidenceDir = join(process.cwd(), ".agent", "evidence", "REC-001");
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
  if (res.status() >= 400) {
    failedRequests.push({ url: res.url(), error: `HTTP ${res.status()}` });
  }
});

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.getByTestId("goal-pace").waitFor({ timeout: 10_000 });

// Force a gap larger than July discretionary spending (~$455).
await page.getByTestId("goal-name-input").fill("Aggressive Goal");
await page.getByTestId("goal-target-input").fill("20000.00");
await page.getByTestId("goal-saved-input").fill("0.00");
await page.getByTestId("goal-date-input").fill("2026-12-31");
await page.getByTestId("goal-save-button").click();
await page.getByTestId("goal-status").waitFor({ timeout: 10_000 });

await page.getByTestId("recommendations-panel").waitFor({ timeout: 10_000 });
await page.getByTestId("rec-list").waitFor({ timeout: 10_000 });

const gap = await page.getByTestId("rec-gap").innerText();
const totalCuts = await page.getByTestId("rec-total-cuts").innerText();
const unresolved = await page.getByTestId("rec-unresolved").innerText();
const projected = await page.getByTestId("rec-projected-savings").innerText();
const listText = await page.getByTestId("rec-list").innerText();
const firstCut = await page.getByTestId("rec-cut-subscriptions").innerText();

await page.screenshot({ path: join(evidenceDir, "recommendations-desktop.png"), fullPage: true });

const essentialCategories = ["rent", "utilities", "groceries", "healthcare", "debt minimum"];
const essentialMentioned = essentialCategories.some((name) =>
  listText.toLowerCase().includes(name),
);

const report = {
  taskId: "REC-001",
  at: new Date().toISOString(),
  baseUrl,
  gap,
  totalCuts,
  unresolved,
  projected,
  firstCut,
  listText,
  essentialMentioned,
  consoleErrors,
  failedRequests,
};

// July calc date: required ceil(2000000/6)=333334; savings=220500; gap=112834.
// Discretionary available=45500; unresolved=67334; projected=266000.
const ok =
  gap === "$1,128.34" &&
  totalCuts === "$455.00" &&
  unresolved === "$673.34" &&
  projected === "$2,660.00" &&
  firstCut.includes("$45.00") &&
  /subscriptions/i.test(listText) &&
  /restaurants/i.test(listText) &&
  !essentialMentioned &&
  consoleErrors.length === 0 &&
  failedRequests.length === 0;

report.pass = ok;
writeFileSync(join(evidenceDir, "browser-report.json"), JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify(report, null, 2));
if (!ok) process.exitCode = 1;
