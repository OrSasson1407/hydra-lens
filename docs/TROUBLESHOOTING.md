# Troubleshooting

---

## "Panel shows nothing after scan"

**Symptom**: You click Scan Now, the popup shows a result count, but the
DevTools panel is blank.

**Cause**: The panel opened before the background service worker stored the
results in `chrome.storage.session`, or the panel has a stale session key.

**Fix**:

1. Close the DevTools window entirely
2. Re-open DevTools → HydraLens tab
3. Click **Rescan** in the panel

If the problem persists, go to `chrome://extensions` → HydraLens → **Service
Worker** → Inspect, and check the console for storage errors.

---

## "Scan is locked / won't start"

**Symptom**: Clicking Scan Now shows a spinning indicator that never finishes.
Reloading the tab does not help.

**Cause**: The `isScanning` flag in `chrome.storage.local` was set to `true` by
a previous scan that crashed before it could reset itself.

**Fix**:

1. Open DevTools → HydraLens panel
2. Click **Force Reset** (or open the extension background inspector and run):
   ```js
   chrome.storage.local.set({ isScanning: false });
   ```

---

## "Hundreds of false-positive security warnings"

**Symptom**: Almost every element is flagged as a security issue.

**Cause**: You are running an older build (< v1.0.0) that included the
high-entropy catch-all pattern.

**Fix**: Update to v1.0.0+. The catch-all pattern was removed in
[#42](https://github.com/your-org/hydra-lens/pull/42) because it matched base64
images, font hashes, and minified JS.

---

## "Overlays are in the wrong position after scrolling"

**Symptom**: After scrolling the page, color-coded overlays drift away from the
elements they annotate.

**Cause**: A previous version accumulated stale `scroll` event listeners on SPA
navigations, causing double-updates that overshot the correct position.

**Fix**: Update to v1.0.0+. The overlay system now uses `ResizeObserver` and a
single `scroll` listener attached to `window` with proper cleanup on navigation.

---

## "Authenticated page returns login HTML"

**Symptom**: The CLI or extension reports mismatches that look like a login page
(form fields, redirect text).

**Cause**: Server HTML is fetched without authentication cookies. The server
returns the login page rather than the protected content.

**Workaround**: For the CLI, you can pre-authenticate using a Playwright
`storageState` file (full support planned). For the extension, log in normally —
the content script runs in the authenticated page context and only the initial
server-HTML fetch is unauthenticated.

---

## "CLI runs very slowly on large sitemaps"

**Symptom**: Scanning a 500-URL sitemap takes 20+ minutes.

**Cause**: Default concurrency is 4 parallel pages.

**Fix**:

```bash
node packages/cli/dist/index.js --sitemap https://example.com/sitemap.xml --concurrency 16
```

Watch memory usage — each page consumes ~50 MB. On a 4 GB CI runner, keep
concurrency ≤ 8.

---

## "Core bundle not found"

**Symptom**: CLI throws `Error: Could not find @hydra-lens/core bundle`.

**Cause**: `pnpm build:core` was not run before the CLI.

**Fix**:

```bash
pnpm build:core
node packages/cli/dist/index.js http://localhost:3000
```

---

## Chrome Extension Won't Load

**Symptom**: `chrome://extensions` shows an error when loading the unpacked
extension.

**Checklist**:

1. Did you select `packages/extension/dist` (the **build output**) and not
   `packages/extension/src`?
2. Is `manifest.json` present in that folder? If not, run
   `pnpm build:extension`.
3. Does the manifest version say `"manifest_version": 3`? Manifest V2 extensions
   are no longer accepted in Chrome 127+.
4. Are there any `content_security_policy` errors? Check the extension error
   details on `chrome://extensions`.
