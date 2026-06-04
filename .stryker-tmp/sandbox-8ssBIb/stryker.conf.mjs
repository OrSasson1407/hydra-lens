// @ts-nocheck
export default {
  testRunner: 'vitest',
  reporters: ['html', 'clear-text', 'progress'],
  coverageAnalysis: 'perTest',
  mutate: [
    'packages/core/src/**/*.ts',
    '!packages/core/src/**/*.test.ts',
    'packages/extension/src/**/*.ts',
    '!packages/extension/src/**/*.test.ts'
  ],
  thresholds: {
    high: 90,
    low: 80,
    break: 75
  }
};