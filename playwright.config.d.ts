/**
 * Root Playwright config.
 * Each package has its own playwright.config.ts for fine-grained control,
 * but this root config covers the system-level tests in tests/system/.
 *
 * Per-package configs:
 *   packages/cli/playwright.config.ts      → CLI e2e  (pnpm test:e2e:cli)
 *   packages/extension/playwright.config.ts → extension e2e (pnpm test:e2e:extension)
 *
 * This config:
 *   tests/system/                           → cross-browser / performance / SSR
 *   packages/extension/tests/security/     → XSS hardening (pnpm test:e2e:xss)
 */
declare const _default: import("@playwright/test").PlaywrightTestConfig<{}, {}>;
export default _default;
//# sourceMappingURL=playwright.config.d.ts.map