# HydraLens Privacy Policy

**Last updated: June 2026**

## Summary

HydraLens does not collect, transmit, or store any personal data.
All processing happens locally on your device.

## Chrome Extension

- **What it reads:** The DOM of the page you are actively inspecting,
  and the server-rendered HTML of that same page fetched via `fetch()`.
- **Why:** To compare the server HTML against the live DOM and detect
  hydration mismatches.
- **What it stores:** Ignored selectors and scan history are saved in
  `chrome.storage.local` — your browser, your device, never sent anywhere.
- **What it never does:** HydraLens never reads pages you are not actively
  scanning, never transmits any page content off-device, and never tracks
  browsing history.

## Why `<all_urls>` permission is requested

The extension's content script must be injected into any page the developer
chooses to inspect. It is only activated by an explicit user action (clicking
the toolbar button, opening the DevTools panel, or pressing Alt+Shift+H).
The permission is not used to passively observe browsing.

## CLI Tool

The CLI tool (`@hydra-lens/cli`) runs entirely on your local machine or CI
runner. It opens a headless browser, fetches the URLs you specify, and writes
results to stdout or a local JSON file. No data is sent to any external server.

## Contact

For privacy questions open an issue at
https://github.com/OrSasson1407/hydra-lens/issues