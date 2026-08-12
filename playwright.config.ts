import { defineConfig, devices } from "@playwright/test";

const webUrl = process.env.WEB_URL ?? "http://127.0.0.1:5173";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: webUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    ...(process.env.CHROME_PATH
      ? {
          launchOptions: {
            executablePath: process.env.CHROME_PATH,
          },
        }
      : {}),
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
