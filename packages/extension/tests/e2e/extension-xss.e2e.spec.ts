import { test, expect } from '@playwright/test';

test.describe('Extension XSS protections', () => {
  test('crafted selector with <script> tag → rendered as plain text in panel', async () => { /* TODO */ });
  test('crafted advice with img onerror → not executed in panel', async () => { /* TODO */ });
  test('crafted fixSnippet with event handler → not executed', async () => { /* TODO */ });
  test('panel CSP blocks inline script execution', async () => { /* TODO */ });
});
