import { defineConfig, devices } from "@playwright/test";

/**
 * Root Playwright config.
 * Each package has its own playwright.config.ts for fine-grained control,
 * but this root config covers the system-level tests in tests/system/.
 *
 * Per-package configs:
 *   packages/cli/playwright.config.ts      → CLI e2e  (pnpm test:e2e:cli)
 *   packages/extension/playwright.config.ts → extension e2e (pnpm test:e2e:extension)
 *
 * This config:
 *   tests/system/                           → cross-browser / performance / SSR
 *   packages/extension/tests/security/     → XSS hardening (pnpm test:e2e:xss)
 */
export default defineConfig({
  testDir: "./tests/system",

  // Shared settings for all projects
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  outputDir: "test-results",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    // System tests: Chromium (primary)
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Cross-browser: Firefox
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testMatch: "**/cross-browser.system.spec.ts",
    },
    // Cross-browser: WebKit
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testMatch: "**/cross-browser.system.spec.ts",
    },
  ],

  // Spin up the demo app before the system test suite
  webServer: {
    command: "npx serve demo-app -p 3000 -s",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
