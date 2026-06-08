export default {
  testRunner: "vitest",
  plugins: ["@stryker-mutator/vitest-runner"],
  vitest: {
    configFile: "vitest.workspace.ts",
  },
  reporters: ["html", "clear-text", "progress"],
  coverageAnalysis: "perTest",
  mutate: [
    "packages/core/src/**/*.ts",
    "!packages/core/src/**/*.test.ts",
    "!packages/core/src/test-setup.ts",
    "packages/extension/src/**/*.ts",
    "!packages/extension/src/**/*.test.ts",
    "!packages/extension/src/test-setup.ts",
  ],
  thresholds: {
    high: 90,
    low: 80,
    break: 75,
  },
};
