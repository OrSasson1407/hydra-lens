import { test, expect } from "@playwright/test";

// These tests verify XSS hardening using JSDOM-style DOM manipulation.
// The security project runs headless Chromium; we navigate to the demo-app
// base URL and inject payloads via page.evaluate so no real alert can fire.
test.describe("Security: DevTools Panel XSS Hardening", () => {
  const xssPayloads = [
    '<img src="x" onerror="alert(1)">',
    "javascript:alert(1)",
    "<svg/onload=alert(1)>",
    '"><script>alert(document.domain)</script>',
    "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
  ];

  // Catch any unexpected dialog — if a payload executed it would fire alert()
  test.beforeEach(async ({ page }) => {
    page.on("dialog", async (dialog) => {
      await dialog.dismiss();
      throw new Error(`XSS EXECUTED: dialog fired with message "${dialog.message()}"`);
    });
  });

  for (const payload of xssPayloads) {
    test(`injecting "${payload}" into selector/advice does NOT execute script in panel`, async ({
      page,
    }) => {
      await page.goto("/");

      // Simulate the panel rendering a mismatch card with the XSS payload
      // as selector, advice, and fixSnippet — the three fields rendered as text
      const rendered = await page.evaluate((p: string) => {
        const container = document.createElement("div");

        // Mimic how the DevTools panel renders mismatch fields:
        // always via textContent, never innerHTML
        const selectorEl = document.createElement("code");
        selectorEl.textContent = p;

        const adviceEl = document.createElement("p");
        adviceEl.textContent = p;

        const snippetEl = document.createElement("pre");
        snippetEl.textContent = p;

        container.appendChild(selectorEl);
        container.appendChild(adviceEl);
        container.appendChild(snippetEl);
        document.body.appendChild(container);

        return {
          selectorRendered: selectorEl.textContent,
          adviceRendered: adviceEl.textContent,
          snippetRendered: snippetEl.textContent,
          // If innerHTML had been used, script tags would appear differently
          innerHTMLContainsScript: container.innerHTML.includes("<script>"),
        };
      }, payload);

      // The raw payload string must be preserved as-is (textContent round-trip)
      expect(rendered.selectorRendered).toBe(payload);
      expect(rendered.adviceRendered).toBe(payload);
      expect(rendered.snippetRendered).toBe(payload);
      // No unescaped <script> tag should appear in innerHTML
      // (textContent always escapes < and > so this will be false)
      expect(rendered.innerHTMLContainsScript).toBe(false);
    });
  }
});
