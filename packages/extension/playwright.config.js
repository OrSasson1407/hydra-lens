import { defineConfig } from "@playwright/test";
import path from "path";
const extensionPath = path.resolve(__dirname, "dist");
export default defineConfig({
    testDir: "./tests",
    timeout: 60_000,
    retries: process.env.CI ? 2 : 0,
    workers: 1, // Extension tests must be serial — only one Chrome instance can load the extension
    reporter: [
        ["list"],
        ["html", { open: "never", outputFolder: "../../playwright-report/extension" }],
    ],
    outputDir: "../../test-results/extension",
    use: {
        // Chromium with extension loaded
        browserName: "chromium",
        channel: "chrome",
        headless: false, // Chrome extensions require non-headless mode in Playwright
        launchOptions: {
            args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
        },
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        baseURL: "http://localhost:3001",
    },
    projects: [
        { name: "e2e", testMatch: "e2e/**/*.spec.ts" },
        { name: "security", testMatch: "security/**/*.spec.ts" },
    ],
    webServer: {
        command: "npx serve ../../demo-app -p 3001 -s",
        port: 3001,
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
    },
});
//# sourceMappingURL=playwright.config.js.map