# Contributing to HydraLens

Thank you for your interest in contributing!

---

## Prerequisites

| Tool              | Minimum version              |
| ----------------- | ---------------------------- |
| Node.js           | 18                           |
| pnpm              | 8                            |
| Chromium / Chrome | Latest stable                |
| Playwright        | Installed via `pnpm install` |

---

## Repo Setup

```bash
git clone https://github.com/your-org/hydra-lens.git
cd hydra-lens
pnpm install
pnpm build:core
pnpm build:extension
```

Load the extension:  
Chrome → `chrome://extensions` → Developer mode → **Load unpacked** →
`packages/extension/dist`

---

## Running Tests

```bash
# Unit tests only (fast, no browser)
pnpm test:unit

# Integration tests
pnpm test:integration

# Security tests
pnpm test:security

# End-to-end: CLI
pnpm test:e2e:cli

# End-to-end: Extension
pnpm test:e2e:extension

# Full suite (mirrors CI)
pnpm test:all
```

See [docs/TESTING.md](docs/TESTING.md) for the full guide including coverage and
mocking patterns.

---

## Branch Naming

```
feat/<short-description>
fix/<short-description>
docs/<short-description>
chore/<short-description>
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(core): add SolidJS advice entry
fix(cli): reset isScanning on fatal error
docs: add HEURISTICS.md
```

---

## PR Checklist

Before opening a pull request, confirm:

- [ ] All test layers pass locally (`pnpm test:all`)
- [ ] New behaviour has unit + integration test coverage
- [ ] `docs/` updated if behaviour visible to users changed
- [ ] No secrets or real credentials in test fixtures
- [ ] `CHANGELOG.md` unreleased section updated

---

## Adding a New Framework

1. **Detect** — add a fingerprint branch in `getComponentName()` in
   `packages/core/src/index.ts`
2. **Advise** — add a `<FrameworkName>Component` entry in `ADVICE_DATABASE` with
   `text-mismatch` and `attribute-mismatch` keys
3. **Test** — add a unit test in
   `packages/core/src/__tests__/unit/framework-detection.unit.test.ts`
4. **Integration test** — add a fixture HTML file and an integration test in
   `packages/core/src/__tests__/integration/`
5. Update `docs/HEURISTICS.md` → Framework Detection section
6. Update `README.md` → Supported Frameworks table

---

## Adding a New Secret Pattern

1. Add `{ pattern: /your-regex/, label: "Human-readable label" }` to
   `SECRET_PATTERNS` in `packages/core/src/index.ts`
2. Add a unit test in `packages/core/src/__tests__/unit/classify.unit.test.ts`
3. Add a security test in
   `packages/core/src/__tests__/security/payload-obfuscation.sec.test.ts`
4. Document the pattern in `docs/HEURISTICS.md` → Secret Patterns table

---

## Code Style

- ESLint + Prettier — configs at repo root
- Run `pnpm lint` before committing
- TypeScript strict mode is on; no `any` except where unavoidable (comment why)
