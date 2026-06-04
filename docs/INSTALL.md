# Installation

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | ≥ 18 |
| pnpm | ≥ 8 |
| Chrome / Chromium | Latest stable |

---

## 1. Chrome Web Store _(once published)_

Search for **HydraLens** in the Chrome Web Store and click **Add to Chrome**.

---

## 2. Developer Mode (Load Unpacked)

Use this method to run from source or to test a local build.

```bash
git clone https://github.com/your-org/hydra-lens.git
cd hydra-lens
pnpm install
pnpm build:core
pnpm build:extension
```

Then in Chrome:

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select `packages/extension/dist`

Expected: HydraLens icon appears in the Chrome toolbar.

---

## 3. CLI via npm / pnpm

```bash
# npm
npm install -g @hydra-lens/cli

# pnpm
pnpm add -g @hydra-lens/cli
```

Verify:

```bash
hydra-lens --help
```

---

## 4. Build from Source (Monorepo)

```bash
pnpm install          # install all workspace deps
pnpm build:core       # compile @hydra-lens/core first (CLI depends on it)
pnpm build:extension  # compile Chrome extension
```

Build output locations:

| Package | Output |
|---------|--------|
| `@hydra-lens/core` | `packages/core/dist/` |
| Extension | `packages/extension/dist/` |
| CLI | `packages/cli/dist/` |

---

## Verify Installation

**Extension** — open any SSR page, click the HydraLens popup icon; the badge should show a scan count within a few seconds.

**CLI**:

```bash
node packages/cli/dist/index.js http://localhost:3000
# Expected: "[HydraLens] Headless scanner starting..." followed by results
```
