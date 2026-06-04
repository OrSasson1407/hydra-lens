# HydraLens

[![CI](https://github.com/your-org/hydra-lens/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/hydra-lens/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@hydra-lens/core)](https://www.npmjs.com/package/@hydra-lens/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**HydraLens** is a Chrome DevTools extension and headless CLI for debugging
React, Vue, Svelte, Solid, and Angular hydration mismatches in real-time.

> 📸 _Demo GIF placeholder — add `docs/assets/demo.gif` and update this line_

---

## Quick Start

```bash
pnpm install
pnpm build:core
pnpm build:extension
```

Load `packages/extension/dist` as an **Unpacked Extension** in Chrome:  
`chrome://extensions` → Developer mode → **Load unpacked**

---

## Features

| Feature                       | Extension | CLI | Core |
| ----------------------------- | :-------: | :-: | :--: |
| Real-time DOM overlay         |    ✅     |  —  |  —   |
| Framework-aware fix advice    |    ✅     | ✅  |  ✅  |
| Security secret scanner       |    ✅     | ✅  |  ✅  |
| Severity filtering            |    ✅     | ✅  |  ✅  |
| Ignore selector (persisted)   |    ✅     |  —  |  —   |
| Scan history (last 5)         |    ✅     |  —  |  —   |
| Auto-scan on navigation       |    ✅     |  —  |  —   |
| Export Jira / Markdown / JSON |    ✅     | ✅  |  —   |
| Sitemap crawl                 |     —     | ✅  |  —   |
| Parallel concurrency pool     |     —     | ✅  |  —   |
| CI exit-code integration      |     —     | ✅  |  —   |

## Supported Frameworks

React · Vue · Svelte · SolidJS · Angular

---

## Architecture

Three packages share a single detection core:

| Package              | Purpose                                                             |
| -------------------- | ------------------------------------------------------------------- |
| `@hydra-lens/core`   | Pure detection logic — no DOM/browser deps; fully unit tested       |
| `packages/extension` | Chrome Extension: content script, DevTools panel, popup, background |
| `packages/cli`       | Playwright headless runner for CI/CD pipelines                      |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full design.

---

## Documentation

- [Installation](docs/INSTALL.md)
- [CLI Usage](docs/CLI-USAGE.md)
- [Extension Usage](docs/EXTENSION-USAGE.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Detection Heuristics](docs/HEURISTICS.md)
- [Testing Guide](docs/TESTING.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Changelog](CHANGELOG.md)

---

## Adding New Heuristics

- **New secret pattern** → `SECRET_PATTERNS` in `packages/core/src/index.ts`
- **New framework advice** → `ADVICE_DATABASE` in `packages/core/src/index.ts`
- **New severity rule** → `classifyAttributeMismatch` in
  `packages/core/src/index.ts`

See [docs/HEURISTICS.md](docs/HEURISTICS.md) for the full guide.

---

## License

MIT — see [LICENSE](LICENSE). © 2025 HydraLens Contributors  
Full changelog: [CHANGELOG.md](CHANGELOG.md)
