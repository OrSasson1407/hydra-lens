# HydraLens CLI

Playwright-powered headless scanner for CI/CD hydration checks.

## Quick Start

```bash
# Build first
pnpm build:core

# Scan a URL
node packages/cli/dist/index.js http://localhost:3000

# Scan with sitemap, parallel, output JSON
node packages/cli/dist/index.js \
  --sitemap https://example.com/sitemap.xml \
  --concurrency 8 \
  --output report.json
```

## Exit Codes

| Code | Meaning               |
| ---- | --------------------- |
| `0`  | No blocking issues    |
| `1`  | Blocking issues found |
| `2`  | Fatal error           |

## CI Example (GitHub Actions)

```yaml
- name: Hydration check
  run: node packages/cli/dist/index.js https://staging.example.com
```

See [docs/CLI-USAGE.md](../../docs/CLI-USAGE.md) for the complete flags
reference, JSON report schema, and concurrency tuning guide.
