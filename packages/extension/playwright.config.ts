import { defineConfig } from "@playwright/test";
import path from "path";

const extensionPath = path.resolve(__dirname, "dist");

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "../../playwright-report/extension" }],
  ],
  outputDir: "../../test-results/extension",

  use: {
    browserName: "chromium",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    baseURL: "http://localhost:3001",
  },

  projects: [
    {
      name: "e2e",
      testMatch: "e2e/**/*.spec.ts",
      use: {
        channel: "chrome",
        headless: false,
        launchOptions: {
          args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
          ],
        },
      },
    },
    {
      name: "security",
      testMatch: "security/**/*.spec.ts",
      use: {
        channel: "chrome", // 👈 ADD THIS LINE
        headless: true,
      },
    },
  ],

  webServer: {
    command: "npx serve ../../demo-app -p 3001 -s",
    port: 3001,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
