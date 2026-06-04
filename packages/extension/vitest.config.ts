import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Extension tests need a DOM environment for chrome.* stub injection
    environment: "jsdom",
    setupFiles: ["src/test-setup.ts"],
    include: ["src/__tests__/**/*.test.ts", "src/__tests__/**/*.spec.ts"],
    exclude: [
      "tests/e2e/**", // Playwright handles these
      "tests/security/**", // Playwright handles these
      "**/node_modules/**",
      "**/dist/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.spec.ts", "src/test-setup.ts"],
    },
  },
});
