# Changelog

All notable changes to HydraLens are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Fixed

- `extension/content.ts`: added `credentials: "include"` to SSR fetch so authenticated dashboards are scanned correctly instead of returning a login redirect
- `cli/index.ts`: sitemap parser now detects `<sitemapindex>` root and recursively fetches child sitemaps instead of treating their URLs as pages
- `cli/package.json`: removed `private: true` and added `bin` field so `pnpm add -g @hydra-lens/cli` registers the `hydra-lens` executable
- `cli/tsup.config.ts`: added `#!/usr/bin/env node` shebang banner; disabled source maps in CLI build
- `root package.json`: `build:cli` added to build pipeline between core and extension
- `extension/devtools.ts`: guard against scanning `chrome://`, `edge://`, and `about://` URLs which extensions are forbidden from inspecting
- `core/index.ts`: Shannon entropy + attribute-name proximity check replaces the removed catch-all regex — high-entropy values in `key/token/secret/auth/pwd` attributes are flagged as security issues without false-positiving on base64 images
- `cli/index.ts`: async update notifier checks npm registry on startup and prints a one-line hint when a newer version is available

---

## [1.0.0] — 2025-06-04

### Added

- Svelte and SolidJS entries in `ADVICE_DATABASE` with `onMount` /
  `createEffect` fix snippets
- `--concurrency N` flag for CLI parallel page scanning (default: 4)
- `--security-only` flag to restrict CLI output to secret leaks only
- Session-persisted scan results in DevTools panel (survive panel close/reopen)
- `detectMismatchesAsync` async yielding variant for non-blocking scans on large
  DOMs
- Nine secret patterns: JWT, AWS, Stripe, GitHub PAT, Google API, Slack, Twilio,
  SendGrid, PEM keys

### Changed

- CLI now shares a single Playwright `Browser` instance across all URLs (was
  per-URL)
- `processNode()` extracted as shared logic used by both sync and async
  detectors
- Overlay repositioning now uses `ResizeObserver` — fixed drift on scroll/resize
- Popup redesigned: scan history (last 5), export buttons (Jira / Markdown /
  JSON), auto-scan toggle

### Fixed

- DFS traversal order divergence between sync and async detectors
- `isScanning` flag never reset on extension re-install — panel showed spinner
  forever
- Overlay positions wrong after SPA navigation (stale listener accumulation)
- High-entropy catch-all pattern removed — was producing thousands of false
  positives on base64 and font hashes

### Security

- Removed catch-all entropy heuristic that could surface base64 image data as
  "secrets"

---

## [0.5.0] — 2025-01-01

### Added

- `getFix()` wired into `detectMismatches` — every mismatch now has advice + fix
  snippet
- Vue and Angular entries in `ADVICE_DATABASE`
- Full DevTools panel with severity filters and Ignore button
- CLI rewritten to inject compiled core bundle via `addInitScript`
- Auto-scan on both SPA navigations and full page loads; toggle in popup

### Fixed

- Overlay repositioning on scroll, window resize, and element resize

[Unreleased]: https://github.com/OrSasson1407/hydra-lens/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/OrSasson1407/hydra-lens/compare/v0.5.0...v1.0.0
[0.5.0]: https://github.com/OrSasson1407/hydra-lens/releases/tag/v0.5.0
