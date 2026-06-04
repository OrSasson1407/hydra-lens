# HydraLens Demo App

A purpose-built HTML page that intentionally introduces hydration mismatches for
testing and demonstrating HydraLens.

## What it demonstrates

| Category     | What happens after 500 ms                                                                                |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| **Security** | 5 elements expose fake JWT, AWS, Stripe, Slack, Google API tokens in `data-*` attrs — client clears them |
| **Critical** | 5 `<h3>` greetings change text from "Guest N (Server)" to "User N (Client)"                              |
| **Critical** | 5 `<button>` elements flip `aria-expanded` from `false` → `true`                                         |
| **Warning**  | 5 theme-box divs swap `class` from `theme-light` → `theme-dark`                                          |
| **Info**     | 2 `<time>` `datetime` attrs change to the current timestamp                                              |
| **Info**     | 3 avatar `src` attrs swap the `?v=1` cache-bust param                                                    |

## Serving the demo app

```bash
# From repo root — requires `serve` (installed via npm/pnpm)
npx serve demo-app -p 3000

# Or with Node's built-in http server
node -e "require('http').createServer(require('fs').createReadStream('demo-app/index.html')).listen(3000)"
```

Then open `http://localhost:3000` in Chrome with HydraLens installed, or point
the CLI at it:

```bash
node packages/cli/dist/index.js http://localhost:3000
```

## Expected CLI output

```
[HydraLens] Headless scanner starting...
  Scanning http://localhost:3000 ... 18 issues (13 blocking) in ~800ms

========== SCAN SUMMARY ==========
URL                                                | Issues | Blocking
--------------------------------------------------+---------+---------
http://localhost:3000                             | 18     | 13

Total: 18 issues, 13 blocking across 1 URL(s).
[HydraLens] FAILED: 13 issue(s) at or above threshold 'critical'.
```

## Using as a test fixture

The Playwright e2e and system tests spin up this app via the `webServer` option
in `playwright.config.ts` and `packages/extension/playwright.config.ts`. Port
3000 is used by the root config (system tests); port 3001 by the extension
config.
