/**
 * One-shot WEB-001 browser validation evidence.
 * Uses Playwright against the running Vite + API stack.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const baseUrl = process.env.WEB_URL ?? "http://127.0.0.1:5173";
const chromePath =
  process.env.CHROME_PATH ??
  "/Users/markgobriel/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const evidenceDir = join(process.cwd(), ".agent", "evidence", "WEB-001");
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
    // Ignore browser automatic favicon probes when a data-URI icon is provided.
    if (url.includes("favicon.ico") || text.includes("favicon.ico")) {
      return;
    }
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
await page.getByTestId("current-balance").waitFor({ timeout: 10_000 });

const balance = await page.getByTestId("current-balance").innerText();
const income = await page.getByTestId("monthly-income").innerText();
const spending = await page.getByTestId("monthly-spending").innerText();
const savings = await page.getByTestId("monthly-savings").innerText();
const categoryText = await page.locator(".category-list").innerText();
const tableRows = await page.locator(".transactions tbody tr").count();
const brand = await page.locator(".brand").innerText();

await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: join(evidenceDir, "dashboard-mobile.png"), fullPage: true });
await page.setViewportSize({ width: 1280, height: 800 });
await page.screenshot({ path: join(evidenceDir, "dashboard-desktop.png"), fullPage: true });

const report = {
  taskId: "WEB-001",
  at: new Date().toISOString(),
  baseUrl,
  brand,
  balance,
  income,
  spending,
  savings,
  categoryText,
  tableRows,
  consoleErrors,
  failedRequests,
  expected: {
    balance: "$2,450.00",
    income: "$5,000.00",
    spending: "$2,795.00",
    savings: "$2,205.00",
    minTransactions: 12,
  },
};

const ok =
  balance === report.expected.balance &&
  income === report.expected.income &&
  spending === report.expected.spending &&
  savings === report.expected.savings &&
  tableRows >= 12 &&
  categoryText.toLowerCase().includes("rent") &&
  consoleErrors.length === 0 &&
  failedRequests.length === 0;

report.pass = ok;
writeFileSync(join(evidenceDir, "browser-report.json"), JSON.stringify(report, null, 2));
await browser.close();

console.log(JSON.stringify(report, null, 2));
if (!ok) {
  process.exitCode = 1;
}
