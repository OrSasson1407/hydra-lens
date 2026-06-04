import { test, expect } from '@playwright/test';

test.describe('Extension basic scan', () => {
  test('extension loads without errors in Chromium', async () => { /* TODO */ });
  test('popup opens and shows auto-scan toggle', async () => { /* TODO */ });
  test('"Scan Now" button triggers a scan', async () => { /* TODO */ });
  test('overlays appear in page after scan on fixture', async () => { /* TODO */ });
  test('overlay count matches number of active mismatches', async () => { /* TODO */ });
  test('overlay tooltip shows severity label and component name', async () => { /* TODO */ });
});
