# 🔍 HydraLens

> **Detect React hydration mismatches in real-time — directly in the browser.**

HydraLens is a Chrome extension (with companion demo app) that compares server-rendered HTML against the live client DOM, flags every text mismatch, and overlays a visual diff directly on the page. It understands React's fiber tree, classifies mismatches by severity, and pinpoints the exact component responsible.

---

## Table of Contents

- [Why HydraLens?](#why-hydralens)
- [How It Works](#how-it-works)
- [Monorepo Structure](#monorepo-structure)
- [Packages](#packages)
  - [@hydra-lens/core](#hydra-lenscore)
  - [extension](#extension)
  - [demo-app](#demo-app)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Loading the Extension](#loading-the-extension)
  - [Running the Demo App](#running-the-demo-app)
- [Usage](#usage)
- [Severity Levels](#severity-levels)
- [Architecture](#architecture)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

---

## Why HydraLens?

Hydration mismatches are one of the most silent and painful bugs in server-rendered React apps (Next.js, Remix, etc.). They cause:

- Flickering UI on load
- SEO content replaced by client-side values
- Broken accessibility (wrong button/link text)
- Hard-to-reproduce bugs that vanish in DevTools

React logs a generic `Hydration failed` warning but gives you no visual context — you're left hunting through the DOM manually. **HydraLens surfaces exactly what changed, where it changed, and why it matters**, right on top of the page.

---

## How It Works

```
Browser Tab (your app)
        │
        ▼
[Content Script]  ──fetch()──▶  Server HTML (fresh, no-cache)
        │                               │
        │                     [DOMParser → serverDoc]
        │                               │
        ▼                               ▼
   Live clientDoc  ◀──── detectMismatches() ────▶  serverDoc
        │
        ▼
  Per-element CSS path matching
        │
        ▼
  Severity classification (critical / warning / info)
        │
        ▼
  React Fiber walk → component name resolution
        │
        ▼
  Overlay injected on mismatched elements
        │
        ▼
[Background Worker] ──relay──▶ [Popup UI] — results panel
```

1. When you click **Scan Page**, the content script fetches the current URL server-side (bypassing the cache).
2. Both the server HTML and the live DOM are parsed into document trees.
3. Every leaf text node in the server tree is matched against its CSS-path counterpart in the client DOM.
4. Differences are classified by severity, traced to their React component, and rendered as floating overlays with tooltips.
5. Results are relayed to the popup panel, where you can browse, click to scroll-to, and copy the CSS selector.

---

## Monorepo Structure

```
hydra-lens/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI pipeline
├── apps/
│   └── demo-app/              # Next.js 14 app with intentional hydration mismatches
├── packages/
│   ├── core/                  # Shared detection logic (framework-agnostic TypeScript)
│   └── extension/             # Chrome MV3 extension (popup + content + background)
├── .env.example               # Environment variable template
├── CHANGELOG.md               # Version history
├── LICENSE                    # MIT License
├── package.json               # Root workspace scripts
└── pnpm-workspace.yaml
```

This is a **pnpm workspace** monorepo. All packages share a single lockfile and can reference each other via workspace protocol.

---

## Packages

### `@hydra-lens/core`

**Path:** `packages/core`

The heart of HydraLens. A zero-dependency TypeScript library that exposes:

| Export | Description |
|--------|-------------|
| `detectMismatches(serverHTML, clientDoc)` | Main entry point. Returns a sorted array of `Mismatch` objects. |
| `classifySeverity(serverText, clientEl)` | Assigns `critical`, `warning`, or `info` based on tag type and content patterns. |
| `getReactComponentName(el)` | Walks the React fiber tree upward to find the nearest named user-land component. |
| `getCssPath(el)` | Generates a unique CSS selector path for any DOM element. |
| `Mismatch` | TypeScript interface describing a single detected mismatch. |
| `Severity` | `'critical' \| 'warning' \| 'info'` union type. |

**The `Mismatch` interface:**

```typescript
interface Mismatch {
  selector: string;        // CSS path to the element
  serverText: string;      // Text content from server HTML
  clientText: string;      // Text content from live DOM
  severity: Severity;      // 'critical' | 'warning' | 'info'
  severityReason: string;  // Human-readable explanation
  componentName: string | null; // React component name, if resolvable
}
```

---

### `extension`

**Path:** `packages/extension`

A **Chrome Manifest V3** extension built with Vite + TypeScript. Three scripts work together:

| Script | Role |
|--------|------|
| `background.ts` | Service worker. Relays messages between the popup and the active tab's content script. |
| `content.ts` | Injected into every page. Runs the scan, draws overlays, and reports results back. |
| `popup.ts` | Powers the extension popup UI: scan/clear buttons, severity summary, scrollable results list. |

**Permissions used:**

```json
["activeTab", "scripting", "tabs"]
```

No remote code execution, no broad host permissions, no data collection. Fonts are bundled locally — zero external network requests.

---

### `demo-app`

**Path:** `apps/demo-app`

A **Next.js 14** application purpose-built to showcase HydraLens. It ships two intentional hydration mismatches out of the box:

| Mismatch | Server renders | Client renders |
|----------|---------------|----------------|
| **#1 — Timestamp** | `"Server Rendered"` | `Date.now()` (via `useEffect`) |
| **#2 — Random float** | `0.500000` | `Math.random().toFixed(6)` (via `useEffect`) |

Both use the correct pattern: server and client agree during hydration, then `useEffect` updates the value client-side — giving HydraLens a genuine post-hydration diff to catch.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 8 — install with `npm install -g pnpm`
- **Google Chrome** (or any Chromium-based browser)

### Installation

```bash
# Clone the repository
git clone https://github.com/OrSasson1407/hydra-lens.git
cd hydra-lens

# Install all workspace dependencies
pnpm install
```

### Loading the Extension

**1. Build the extension:**

```bash
pnpm build:extension
```

The compiled output will be in `packages/extension/dist/`.

**2. Load into Chrome:**

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `packages/extension/dist/` directory

The HydraLens icon will appear in your toolbar.

### Running the Demo App

```bash
pnpm dev:demo
```

Open [http://localhost:3000](http://localhost:3000) in Chrome, then click the HydraLens extension icon and hit **Scan Page** to see it in action.

---

## Usage

1. **Navigate** to any server-rendered React app in Chrome.
2. **Click** the HydraLens icon in the toolbar.
3. **Click Scan Page** — HydraLens will fetch the server HTML and compare it against the live DOM.
4. Mismatched elements are **highlighted with coloured overlays** on the page:
   - 🔴 Red dashed border = Critical
   - 🟡 Amber dashed border = Warning
   - 🟢 Blue dashed border = Info
5. The **popup panel** lists every mismatch with:
   - Severity badge and React component name
   - Side-by-side SSR vs CSR diff
   - Reason for the severity classification
   - **Copy** button to copy the CSS selector
   - **Click** any row to scroll the element into view on the page
6. Click **Clear** to remove all overlays without refreshing.

---

## Severity Levels

HydraLens automatically classifies each mismatch so you know what to fix first:

| Level | Colour | When it applies |
|-------|--------|-----------------|
| **Critical** | 🔴 Red | Mismatch is inside a structurally important tag: `<a>`, `<button>`, `<h1>`–`<h6>`, `<label>`, `<title>`, `<nav>`, `<th>`. Wrong content here breaks navigation, accessibility, or SEO. |
| **Warning** | 🟡 Amber | Content differs but the tag isn't structurally critical. Likely a real bug worth investigating. |
| **Info** | 🟢 Blue | Server text matches a pattern that suggests an intentional dynamic value: Unix timestamps, time fragments (`12:34`), plain numbers, random floats. Almost certainly expected. |

Results in the popup are always sorted: Critical → Warning → Info.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Chrome Extension                      │
│                                                         │
│  ┌──────────┐   messages   ┌──────────────────────────┐ │
│  │  Popup   │◀────────────▶│  Background Service      │ │
│  │  (UI)    │              │  Worker (relay)          │ │
│  └──────────┘              └──────────┬───────────────┘ │
│                                       │ messages         │
│                            ┌──────────▼───────────────┐ │
│                            │  Content Script          │ │
│                            │  · fetch() server HTML   │ │
│                            │  · detectMismatches()    │ │  ◀── @hydra-lens/core
│                            │  · draw overlays         │ │
│                            └──────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

The background service worker exists purely as a message relay — Chrome MV3 prevents content scripts from communicating directly with popups. All detection logic lives in `@hydra-lens/core` and is imported by the content script at build time.

---

## Development

### Build everything

```bash
pnpm build
```

### Run individual packages

```bash
# Core library (type-check + compile)
pnpm build:core

# Extension (Vite dev/build)
pnpm dev:extension    # watch mode — rebuilds on save
pnpm build:extension  # production bundle

# Demo app (Next.js)
pnpm dev:demo
pnpm build:demo
```

### Developing the extension with live reload

Run `pnpm dev:extension` to start Vite in watch mode. After each rebuild, go to `chrome://extensions` and click the **refresh icon** on the HydraLens card, then reload the target tab.

### Project conventions

- All packages use **TypeScript strict mode**.
- The core package is intentionally **framework-agnostic** — it only depends on the standard DOM APIs.
- The extension uses **Chrome Manifest V3** (service workers, no background pages).
- No runtime dependencies — the extension ships zero third-party libraries.
- Fonts are bundled locally in `packages/extension/public/fonts/` — no CDN requests.

---

## Testing

Tests live in `packages/core/src/index.test.ts` and are powered by **Vitest** with a **jsdom** environment.

```bash
# Run tests once
pnpm --filter @hydra-lens/core test

# Watch mode
pnpm --filter @hydra-lens/core test:watch

# With coverage report
pnpm --filter @hydra-lens/core test:coverage
```

**Current coverage: 25/25 tests passing** across all four exported functions:

| Suite | Tests |
|-------|-------|
| `classifySeverity` | 11 |
| `getCssPath` | 5 |
| `detectMismatches` | 6 |
| `getReactComponentName` | 3 |

---

## Contributing

Contributions are welcome! To get started:

1. Fork the repository and create a feature branch.
2. Run `pnpm install` to set up the workspace.
3. Make your changes, ensuring TypeScript compiles without errors (`pnpm build`).
4. Run the test suite (`pnpm --filter @hydra-lens/core test`) and make sure all 25 pass.
5. Open a pull request with a clear description of the change.

Ideas for contributions:

- Attribute mismatch detection (`src`, `href`, `aria-*`)
- Ignore-list / allowlist for known-intentional mismatches
- Firefox / Safari WebExtension port
- Export results as JSON or copy-to-clipboard summary
- More granular severity rules
- Keyboard shortcut to trigger scan without opening popup

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for the full version history.

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

<div align="center">
  <sub>Built by <a href="https://github.com/OrSasson1407">Or Sasson</a> · For developers who care about hydration correctness.</sub>
</div>