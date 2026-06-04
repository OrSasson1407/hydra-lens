# Architecture

- `@hydra-lens/core`: Pure logic, no DOM dependencies (easily testable).
- `packages/extension`: Chrome Extension UI & Content Scripts.
- `packages/cli`: Playwright runner for automated CI.

## Adding new heuristics

Add patterns to `SECRET_PATTERNS` in `packages/core/src/index.ts`.
