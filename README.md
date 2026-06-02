# HydraLens

HydraLens is a Chrome DevTools extension and headless CLI for debugging **React, Vue, and Angular hydration mismatches** in real-time.

## Features

- **Real-time DOM Analysis** — compares SSR HTML with the live client DOM and highlights every mismatch with a color-coded overlay
- **Framework-aware Fix Advice** — each mismatch includes actionable advice and a copy-ready code snippet tailored to React, Vue, or Angular
- **Security Scanner** — detects exposed secrets in DOM attributes: JWT tokens, AWS keys, Stripe keys, GitHub tokens, Google API keys
- **Severity Filtering** — filter issues by Security / Critical / Warning / Info in the DevTools panel
- **Ignore Selector** — dismiss false positives per-selector; persisted across sessions
- **Scan History** — popup shows the last 5 scan results with timestamps and delta vs previous scan
- **Auto-scan Toggle** — automatically scans on full page loads and SPA navigations; can be disabled from the popup
- **Export Formats** — export results as Jira wiki markup, GitHub Markdown (table + fix snippets), or raw JSON
- **CI/CD Ready** — headless CLI using Playwright; exits with code 1 if critical/security issues are found

## Getting Started

```bash
pnpm install
pnpm build:core
pnpm build:extension
```

Load `packages/extension/dist` as an **Unpacked Extension** in Chrome (`chrome://extensions` → Developer mode → Load unpacked).

## Development

```bash
pnpm test          # run all unit tests
pnpm build         # build core + extension
```

## CLI Usage

```bash
# Scan a local dev server
node packages/cli/dist/index.js http://localhost:3000

# Use in CI (exits 1 on critical/security issues)
node packages/cli/dist/index.js https://staging.example.com
```

## Architecture

| Package | Purpose |
|---------|---------|
| `@hydra-lens/core` | Pure detection logic — no DOM/browser dependencies; fully unit tested |
| `packages/extension` | Chrome Extension: content script, DevTools panel, popup, background worker |
| `packages/cli` | Playwright headless runner for CI/CD pipelines |

## Adding New Heuristics

- **New secret patterns** → add to `SECRET_PATTERNS` in `packages/core/src/index.ts`
- **New framework advice** → add an entry to `ADVICE_DATABASE` in `packages/core/src/index.ts`
- **New severity rules** → extend `classifyAttributeMismatch` in `packages/core/src/index.ts`

## Changelog

### v0.5.0
- Wired `getFix()` into `detectMismatches` — every mismatch now has advice + fix snippet
- Added Vue and Angular entries to `ADVICE_DATABASE`
- Full DevTools panel implementation with severity filters and Ignore button
- Popup redesigned with scan history, export buttons (Jira / Markdown / JSON), and auto-scan toggle
- CLI rewritten to inject compiled core bundle via `addInitScript` (no more `toString()` hack)
- Auto-scan now fires on both SPA navigations and full page loads, with a toggle to disable
- Overlay repositioning fixed for scroll, window resize, and element resize (ResizeObserver)
- Expanded test suite: empty DOM, ignored tags, getFix wiring, framework detection edge cases
