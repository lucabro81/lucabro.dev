import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:4321";
const isExternalTarget = !!process.env.BASE_URL;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  webServer: isExternalTarget
    ? undefined
    : {
        // --ignore-lock: Astro >= 7.4 auto-backgrounds `preview` when it detects
        // an AI agent, leaving a stale server that later runs silently reuse.
        // The flag keeps it in the foreground so Playwright owns its lifecycle.
        command: "npm run build && npm run preview -- --port 4321 --ignore-lock",
        url: "http://localhost:4321",
        reuseExistingServer: !process.env.CI,
      },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox",  use: { ...devices["Desktop Firefox"] } },
    { name: "webkit",   use: { ...devices["Desktop Safari"] } },
  ],
});
