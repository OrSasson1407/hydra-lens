import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // CLI tests run in node — no jsdom (CLI is a Node.js process, not a browser)
    environment: 'node',
    include: [
      'src/__tests__/**/*.test.ts',
      'src/__tests__/**/*.spec.ts',
    ],
    exclude: [
      'tests/e2e/**',   // Playwright handles these
      '**/node_modules/**',
      '**/dist/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    },
  },
});
