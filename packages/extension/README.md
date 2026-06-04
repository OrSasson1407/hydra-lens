# HydraLens Extension

Chrome DevTools extension for real-time hydration mismatch detection.

## Development

```bash
# From repo root
pnpm install
pnpm build:core
pnpm build:extension
```

Load `packages/extension/dist` as an unpacked extension in Chrome.

## Package Structure

```
packages/extension/
├── src/
│   ├── scripts/
│   │   ├── background.ts   Service worker — stores scan results, relays messages
│   │   └── content.ts      Injected into pages — fetches SSR HTML, runs scan, draws overlays
│   ├── devtools/
│   │   ├── devtools.ts     Registers the DevTools panel
│   │   └── panel.ts        Mismatch table, severity filters, ignore button
│   └── popup/
│       ├── popup.ts        Toolbar popup — scan history, export, auto-scan toggle
│       └── popup.html
├── public/
│   └── manifest.json       Manifest V3
└── vite.config.ts
```

## Key Behaviours

- Results stored in `chrome.storage.session` — survive DevTools close/reopen,
  cleared on tab close
- Overlays rendered inside a closed Shadow Root — immune to page styles
- Auto-scan fires on both full loads and SPA navigations via History API
  patching
- Export formats: Jira wiki markup, GitHub Markdown (table + snippets), raw JSON

See [docs/EXTENSION-USAGE.md](../../docs/EXTENSION-USAGE.md) for the full user
guide.
