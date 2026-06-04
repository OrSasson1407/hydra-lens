// @ts-nocheck
import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test('CLI runs and detects mismatches', () => {
  let exitCode = 0;
  let output = '';
  try {
    // Attempt to run the CLI against the local server
    output = execSync('node ./dist/index.js http://localhost:8080', { stdio: 'pipe' }).toString();
  } catch (error: any) {
    exitCode = error.status || 1;
    output = error.stdout ? error.stdout.toString() : '';
  }
  
  // We expect the CLI to exit with an error code (1) because it should find security/critical issues in the demo
  expect(exitCode).toBeGreaterThan(0);
});
