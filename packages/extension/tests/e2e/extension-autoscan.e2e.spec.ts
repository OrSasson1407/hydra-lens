import { test, expect } from '@playwright/test';

test.describe('Extension background auto-scan', () => {
  test('auto-scan on page load → overlays appear without manual trigger', async () => { /* TODO */ });
  test('auto-scan disabled → no overlays on load', async () => { /* TODO */ });
  test('SPA navigation (pushState) triggers re-scan', async () => { /* TODO */ });
  test('Alt+Shift+H keyboard shortcut triggers scan', async () => { /* TODO */ });
});
