# Changelog

All notable changes to HydraLens are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

_Changes merged but not yet released._

---

## [1.0.0] — 2025-06-04

### Added
- Svelte and SolidJS entries in `ADVICE_DATABASE` with `onMount` / `createEffect` fix snippets
- `--concurrency N` flag for CLI parallel page scanning (default: 4)
- `--security-only` flag to restrict CLI output to secret leaks only
- Session-persisted scan results in DevTools panel (survive panel close/reopen)
- `detectMismatchesAsync` async yielding variant for non-blocking scans on large DOMs
- Nine secret patterns: JWT, AWS, Stripe, GitHub PAT, Google API, Slack, Twilio, SendGrid, PEM keys

### Changed
- CLI now shares a single Playwright `Browser` instance across all URLs (was per-URL)
- `processNode()` extracted as shared logic used by both sync and async detectors
- Overlay repositioning now uses `ResizeObserver` — fixed drift on scroll/resize
- Popup redesigned: scan history (last 5), export buttons (Jira / Markdown / JSON), auto-scan toggle

### Fixed
- DFS traversal order divergence between sync and async detectors
- `isScanning` flag never reset on extension re-install — panel showed spinner forever
- Overlay positions wrong after SPA navigation (stale listener accumulation)
- High-entropy catch-all pattern removed — was producing thousands of false positives on base64 and font hashes

### Security
- Removed catch-all entropy heuristic that could surface base64 image data as "secrets"

---

## [0.5.0] — 2025-01-01

### Added
- `getFix()` wired into `detectMismatches` — every mismatch now has advice + fix snippet
- Vue and Angular entries in `ADVICE_DATABASE`
- Full DevTools panel with severity filters and Ignore button
- CLI rewritten to inject compiled core bundle via `addInitScript`
- Auto-scan on both SPA navigations and full page loads; toggle in popup

### Fixed
- Overlay repositioning on scroll, window resize, and element resize

[Unreleased]: https://github.com/your-org/hydra-lens/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-org/hydra-lens/compare/v0.5.0...v1.0.0
[0.5.0]: https://github.com/your-org/hydra-lens/releases/tag/v0.5.0
