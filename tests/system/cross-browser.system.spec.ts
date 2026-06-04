import { test, expect } from '@playwright/test';

test.describe('Cross browser compatibility', () => {
  test('CLI scanner produces same results in Chromium and WebKit', async () => { /* TODO */ });
  test('extension overlay positions are correct in Chromium 120+', async () => { /* TODO */ });
  test('Shadow DOM host is not interfered with by page CSS resets', async () => { /* TODO */ });
});
