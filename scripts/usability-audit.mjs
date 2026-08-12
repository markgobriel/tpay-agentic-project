/**
 * Novice-user usability discovery audit (desktop + mobile).
 * Captures screenshots, visible copy, control inventory, and friction notes.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const baseUrl = process.env.WEB_URL ?? "http://127.0.0.1:5173";
const chromePath =
  process.env.CHROME_PATH ??
  "/Users/markgobriel/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const evidenceDir = join(process.cwd(), ".agent", "evidence", "USABILITY-AUDIT-001");
mkdirSync(evidenceDir, { recursive: true });

const consoleErrors = [];
const failedRequests = [];

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const context = await browser.newContext();
const page = await context.newPage();

page.on("console", (msg) => {
  if (msg.type() === "error" && !msg.text().includes("favicon.ico")) {
    consoleErrors.push(msg.text());
  }
});
page.on("response", (res) => {
  if (res.url().includes("favicon.ico")) return;
  if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
});

await context.addInitScript(() => {
  try {
    localStorage.removeItem("save-spend-demo-guide-dismissed");
  } catch {
    /* ignore */
  }
});

async function inventory(label) {
  return page.evaluate((viewportLabel) => {
    const text = (el) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
    const buttons = [...document.querySelectorAll("button")].map((b) => ({
      text: text(b),
      className: b.className,
      disabled: b.disabled,
      type: b.type,
    }));
    const inputs = [...document.querySelectorAll("input")].map((i) => {
      const labelEl = i.closest("label");
      return {
        type: i.type,
        testId: i.getAttribute("data-testid"),
        value: i.value,
        placeholder: i.placeholder,
        label: text(labelEl)?.replace(i.value, "").trim() || i.getAttribute("aria-label"),
        required: i.required,
      };
    });
    const headings = [...document.querySelectorAll("h1,h2,h3")].map((h) => text(h));
    const statusLike = [
      ...document.querySelectorAll("[class*='pace'], .panel-message, .success, .error"),
    ]
      .map((el) => ({ className: el.className, text: text(el) }))
      .filter((x) => x.text);
    const overflow = {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
    return {
      viewportLabel,
      brand: text(document.querySelector(".brand")),
      lede: text(document.querySelector(".lede")),
      headings,
      buttons,
      inputs,
      statusLike,
      balance: text(document.querySelector('[data-testid="current-balance"]')),
      income: text(document.querySelector('[data-testid="monthly-income"]')),
      spending: text(document.querySelector('[data-testid="monthly-spending"]')),
      savings: text(document.querySelector('[data-testid="monthly-savings"]')),
      pace: text(document.querySelector('[data-testid="goal-on-pace"]')),
      gap: text(document.querySelector('[data-testid="goal-gap"]')),
      requiredMonthly: text(document.querySelector('[data-testid="goal-required-monthly"]')),
      recGap: text(document.querySelector('[data-testid="rec-gap"]')),
      recCuts: text(document.querySelector('[data-testid="rec-total-cuts"]')),
      recUnresolved: text(document.querySelector('[data-testid="rec-unresolved"]')),
      recEmpty: text(document.querySelector('[data-testid="rec-empty"]')),
      recList: text(document.querySelector('[data-testid="rec-list"]')),
      demoGuide: text(document.querySelector('[data-testid="demo-guide"]')),
      monthValue: document.querySelector('input[type="month"]')?.value ?? null,
      overflow,
      bodySnippet: text(document.body).slice(0, 2500),
    };
  }, label);
}

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.getByTestId("current-balance").waitFor({ timeout: 15_000 });

const desktopBefore = await inventory("desktop-first-load");
await page.screenshot({ path: join(evidenceDir, "desktop-first-load.png"), fullPage: true });

// Attempt invalid goal to observe error guidance
await page.getByTestId("goal-target-input").fill("-10");
await page.getByTestId("goal-save-button").click();
await page.waitForTimeout(400);
const desktopInvalid = await inventory("desktop-invalid-goal");
await page.screenshot({ path: join(evidenceDir, "desktop-invalid-goal.png"), fullPage: true });

// Restore a plausible goal and observe recommendations messaging
await page.getByTestId("goal-target-input").fill("50000.00");
await page.getByTestId("goal-saved-input").fill("1200.00");
await page.getByTestId("goal-date-input").fill("2026-11-30");
await page.getByTestId("goal-save-button").click();
await page.getByTestId("goal-status").waitFor({ timeout: 10_000 });
await page.waitForTimeout(500);
const desktopAfterSave = await inventory("desktop-after-save");
await page.screenshot({ path: join(evidenceDir, "desktop-after-save.png"), fullPage: true });

// Keyboard tab order sample
const tabOrder = [];
for (let i = 0; i < 12; i += 1) {
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    return {
      tag: el.tagName,
      testId: el.getAttribute("data-testid"),
      text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 80),
      type: el.getAttribute("type"),
      className: el.className,
    };
  });
  tabOrder.push(focused);
}

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.getByTestId("current-balance").waitFor({ timeout: 15_000 });
const mobile = await inventory("mobile-first-load");
await page.screenshot({ path: join(evidenceDir, "mobile-first-load.png"), fullPage: true });

const api = {
  account: await (await fetch("http://127.0.0.1:3001/account")).json(),
  analyticsJuly: await (await fetch("http://127.0.0.1:3001/analytics?month=2026-07")).json(),
  goal: await (await fetch("http://127.0.0.1:3001/savings-goal")).json(),
  recommendations: await (await fetch("http://127.0.0.1:3001/recommendations")).json(),
};

const report = {
  at: new Date().toISOString(),
  baseUrl,
  consoleErrors,
  failedRequests,
  tabOrder,
  api,
  desktopBefore,
  desktopInvalid,
  desktopAfterSave,
  mobile,
};

writeFileSync(join(evidenceDir, "audit-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
