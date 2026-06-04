// @ts-nocheck
﻿import { test, expect } from '@playwright/test';

test.describe('Security: DevTools Panel XSS Hardening', () => {
  const xssPayloads = [
    '<img src="x" onerror="alert(1)">',
    'javascript:alert(1)',
    '<svg/onload=alert(1)>',
    '"><script>alert(document.domain)</script>',
    'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='
  ];

  for (const payload of xssPayloads) {
    test(`injecting "${payload}" into selector/advice does NOT execute script in panel`, async ({ page }) => {
      // TODO: Simulate HydraLens background script sending malicious payloads to DevTools UI
      // Verify no dialog/alert is triggered
      // Verify textContent safely renders the raw string without execution
    });
  }
});
