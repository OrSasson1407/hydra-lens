import { defineWorkspace } from "vitest/config";
export default defineWorkspace([
  {
    test: {
      name: "core",
      root: "./packages/core",
      environment: "jsdom",
      setupFiles: ["src/test-setup.ts"],
      include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    },
  },
  {
    test: {
      name: "extension",
      root: "./packages/extension",
      environment: "jsdom",
      setupFiles: ["src/test-setup.ts"],
      include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    },
  },
]);
