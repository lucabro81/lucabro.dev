import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:4321";
const isExternalTarget = !!process.env.BASE_URL;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  globalSetup: isExternalTarget ? undefined : "./tests/global-setup.ts",
  globalTeardown: isExternalTarget ? undefined : "./tests/global-teardown.ts",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  webServer: isExternalTarget
    ? undefined
    : {
        command: "npm run dev -- --port 4321",
        url: "http://localhost:4321",
        reuseExistingServer: false,
      },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox",  use: { ...devices["Desktop Firefox"] } },
    { name: "webkit",   use: { ...devices["Desktop Safari"] } },
  ],
});
