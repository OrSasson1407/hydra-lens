# HydraLens ??
HydraLens is the ultimate hydration mismatch debugger for React, Vue, and Angular applications.

## Features
- **Real-time DOM Analysis:** Compare SSR HTML with client-side DOM.
- **Security Scanner:** Detects exposed API keys and tokens (JWT, AWS, Stripe).
- **CI/CD Ready:** Headless CLI scanner for pre-deploy checks.
- **DevTools Integration:** Dedicated panel for inspection, filtering, and history.

## Getting Started
1. `pnpm install`
2. `pnpm build:extension`
3. Load the `packages/extension/dist` folder into Chrome as an Unpacked Extension.

## Development
- `pnpm test` - Runs unit tests for the core engine.
- `pnpm build:extension` - Compiles the extension bundle.
