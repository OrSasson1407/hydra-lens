# Architecture

## Package Dependency Graph

```
@hydra-lens/core   (pure logic, no browser APIs)
       ▲                    ▲
       │                    │
packages/extension    packages/cli
(Chrome Extension)    (Playwright CLI)
```

`@hydra-lens/core` has zero runtime dependencies and no DOM globals — it is safe
to import in Node, browser, and Playwright contexts alike.

---

## core — Detection Pipeline

```
serverHTML (string)
    │
    ▼
DOMParser.parseFromString()   ← runs in browser / jsdom
    │
    ▼
walk(serverDoc, clientDoc)
    │
    ▼
processNode(serverEl, clientEl, depth, opts, push)
    ├─ text mismatch check   →  similarityScore()
    ├─ attribute loop        →  classifyAttributeMismatch()
    │                            ├─ SECRET_PATTERNS scan
    │                            ├─ aria-* / role check
    │                            ├─ src/href cache-bust check
    │                            └─ timestamp auto-ignore
    └─ returns children for next iteration
    │
    ▼
getFix(componentName, reason)  →  ADVICE_DATABASE lookup
    │
    ▼
Mismatch[]
```

### Sync vs Async

`detectMismatches` uses recursive DFS (simple, synchronous).  
`detectMismatchesAsync` uses an explicit stack with `setTimeout(0)` yields every
15 ms — keeps the main thread responsive on very large DOMs.

Both call the **same** `processNode()` function, so detection results are
identical.

---

## extension — Message Flow

```
content.ts  (runs in page context)
   │  chrome.runtime.sendMessage({ type: "SCAN_RESULT", ... })
   ▼
background.ts  (service worker)
   │  chrome.storage.session.set(...)   ← persists results
   │  chrome.runtime.sendMessage to devtools port
   ▼
panel.ts  (DevTools panel)
   │  renders mismatch table, severity filters, ignore button
   ▼
popup.ts  (toolbar popup)
      renders scan history, export buttons, auto-scan toggle
```

### Shadow DOM Isolation

The overlay `<div>` elements are appended to a **closed** Shadow Root attached
to `document.body`. This prevents page styles from leaking into overlays and
prevents overlay styles from affecting the page.

### Session Persistence

`chrome.storage.session` is used (not `localStorage`) because:

- It is cleared when the browser closes (no stale results across restarts)
- It is shared between the background service worker and the DevTools panel
  without a message round-trip

---

## cli — Browser Lifecycle

```
main()
  │
  ├─ chromium.launch()          ← ONE browser instance for the whole run
  │
  ├─ pLimit(tasks, concurrency) ← N pages in parallel
  │     └─ scanPage(url, browser, coreBundle)
  │           ├─ browser.newPage()
  │           ├─ page.request.get(url)   → serverHTML
  │           ├─ page.addInitScript(coreBundle)
  │           ├─ page.goto(url)
  │           └─ page.evaluate(detectMismatches)
  │
  └─ browser.close()
```

The core bundle (`packages/core/dist/index.global.js`) is injected via
`addInitScript` so it is available as `window.__hydraLens` before any page
script runs.

---

## Adding a New Package

1. Create `packages/<name>/package.json` with `"name": "@hydra-lens/<name>"`
2. Add it to `pnpm-workspace.yaml`
3. Add a `build:<name>` script to the root `package.json`
4. Depend on `@hydra-lens/core` via `"workspace:*"` if needed
