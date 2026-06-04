# Testing Guide

HydraLens has five test layers. Each has a different scope and runner.

---

## Test Layer Overview

| Layer | Runner | What it tests |
|-------|--------|---------------|
| Unit | Vitest | Individual functions in `@hydra-lens/core` with no DOM |
| Integration | Vitest + jsdom | Multi-function flows against real HTML fixtures |
| Security | Vitest | Secret pattern matching; XSS payloads in attributes |
| Fuzz | Vitest + fast-check | Property-based testing of parser edge cases |
| E2E (CLI) | Playwright | Full CLI invocations against a local HTTP server |
| E2E (Extension) | Playwright | Chrome extension loaded unpacked, scan a test page |
| System | Playwright | Cross-browser; React/Vue SSR pages; performance |
| Benchmark | Vitest bench | Concurrency pool, DOM crawler, similarity engine |
| Mutation | Stryker | Mutation score of `@hydra-lens/core` |

---

## Running Each Layer

```bash
pnpm test:unit           # vitest run .unit.test.ts
pnpm test:integration    # vitest run .integration.test.ts
pnpm test:security       # vitest run .sec.test.ts
pnpm test:fuzz           # vitest run .fuzz.test.ts
pnpm test:e2e:cli        # playwright test packages/cli/tests/e2e
pnpm test:e2e:extension  # playwright test packages/extension/tests/e2e
pnpm test:system         # playwright test tests/system
pnpm test:bench          # vitest bench --run
pnpm test:mutate         # stryker run
pnpm test:all            # unit + integration + security + e2e:cli + e2e:extension + system
pnpm test:insane         # test:all + fuzz + bench + mutate
```

---

## Coverage

```bash
pnpm vitest run --coverage
```

Open `coverage/index.html` for the HTML report. The CI workflow enforces a minimum line coverage of **80%** on `@hydra-lens/core`.

---

## Test Fixtures

| File | Purpose |
|------|---------|
| `packages/cli/test-fixtures/index.html` | Minimal SSR HTML used by CLI integration tests |
| `packages/core/src/test-setup.ts` | jsdom environment bootstrapping for vitest |

---

## Adding a Test for a New Heuristic

1. **Unit test** — add to `packages/core/src/__tests__/unit/classify.unit.test.ts`:
   ```ts
   it("detects MyNewPattern as security", () => {
     const result = classifyAttributeMismatch("data-token", "MYPREFIX_abc123", "");
     expect(result.severity).toBe("security");
   });
   ```

2. **Integration test** — add fixture HTML and a test in `packages/core/src/__tests__/integration/`

3. **Security fuzz** — add a fast-check property in `packages/core/src/__tests__/fuzz/parser.fuzz.test.ts` to ensure the pattern never throws on arbitrary input

---

## Vitest vs Playwright — Which to Use

| Scenario | Use |
|----------|-----|
| Testing a pure function | Vitest |
| Testing DOM parsing logic | Vitest + jsdom |
| Testing the CLI binary end-to-end | Playwright |
| Testing the Chrome extension UI | Playwright (extension mode) |
| Testing across Firefox / WebKit | Playwright |

---

## Mocking chrome.* APIs

Unit and integration tests run in Node (via jsdom), not in a browser. `chrome.*` APIs are not available.

The project uses manual stubs in `packages/extension/src/__tests__/`:

```ts
globalThis.chrome = {
  storage: {
    session: { get: vi.fn(), set: vi.fn() },
    local:   { get: vi.fn(), set: vi.fn() },
  },
  runtime: { sendMessage: vi.fn(), onMessage: { addListener: vi.fn() } },
} as any;
```

---

## Known Flaky Tests

| Test file | Flakiness cause | Workaround |
|-----------|----------------|------------|
| `cli-concurrency.e2e.spec.ts` | Race on slow CI runners | Re-run with `--retries 2` |
| `extension-autoscan.e2e.spec.ts` | Extension load timing | Increase `waitForExtension` timeout in the spec |
