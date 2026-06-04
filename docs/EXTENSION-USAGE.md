# Extension Usage

## Running a Scan

Two ways to trigger a scan:

1. **Popup button** — click the HydraLens toolbar icon, then **Scan Now**
2. **Keyboard shortcut** — `Alt+Shift+H` on any page

Results appear as color-coded overlays on the page and in the DevTools panel.

---

## Reading the Overlays

| Colour | Severity | Meaning |
|--------|----------|---------|
| 🔴 Red | Security | Potential secret (JWT, API key, etc.) exposed in a DOM attribute |
| 🟠 Orange | Critical | Text content or accessibility attribute mismatch |
| 🟡 Yellow | Warning | Non-critical attribute differs between SSR and CSR |
| 🔵 Blue | Info | Expected difference (timestamp, cache-bust param) |

Hover over an overlay to see the mismatch details and the fix snippet.

---

## DevTools Panel

Open Chrome DevTools → **HydraLens** tab.

| Control | Action |
|---------|--------|
| Severity filter buttons | Show only Security / Critical / Warning / Info |
| **Ignore** button (per row) | Suppress this selector in future scans (persisted) |
| **Rescan** button | Re-run the scan without reloading the page |
| **Export** dropdown | Download results as Jira markup, GitHub Markdown, or JSON |

---

## Auto-Scan Toggle

Auto-scan fires automatically on:

- Full page loads
- SPA navigations (pushState / replaceState / popstate)

To disable (useful on pages where scanning causes visual jitter):

Popup → toggle **Auto-scan** off.

The setting is persisted per-origin in `chrome.storage.local`.

---

## Ignore-Selector Workflow

If a selector produces a false positive on every scan:

1. In the DevTools panel, find the row for that selector
2. Click **Ignore**
3. The selector is stored and automatically suppressed on future scans

To clear all ignored selectors: Popup → **Clear ignored selectors**.

---

## Scan Result Persistence

Scan results are stored in `chrome.storage.session` and survive DevTools open/close cycles within the same browser session. They are cleared when:

- You close and reopen the tab
- The browser is restarted
- You click **Clear** in the popup

---

## Known Limitations

- **Unauthenticated fetch** — the content script fetches the SSR HTML without session cookies. Pages behind login walls will compare the login page against the live DOM.
- **Iframes** — cross-origin iframes are not scanned (browser security restriction).
- **CSP-blocked pages** — a strict `script-src` policy may prevent the content script from injecting. HydraLens degrades gracefully and shows a "scan blocked by CSP" notice.
- **Shadow DOM** — open Shadow DOM roots are scanned; closed roots are not accessible.
