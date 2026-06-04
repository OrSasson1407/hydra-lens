# CLI Usage

HydraLens ships a headless CLI powered by Playwright for CI/CD pipelines.

---

## Flags Reference

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| _(positional)_ | `string[]` | `http://localhost:3000` | One or more URLs to scan |
| `--sitemap <url>` | string | — | Fetch a sitemap XML and scan all `<loc>` URLs |
| `--concurrency <n>` | number | `4` | Max parallel pages (see tuning advice below) |
| `--threshold <level>` | `security\|critical\|warning\|info` | `critical` | Lowest severity that triggers exit code 1 |
| `--security-only` | flag | off | Only report secret-pattern hits; ignore text/attribute mismatches |
| `--output <file>` | string | — | Write full JSON report to this path |

---

## Examples

### Basic scan

```bash
node packages/cli/dist/index.js http://localhost:3000
```

### Scan multiple URLs

```bash
node packages/cli/dist/index.js https://example.com/page-a https://example.com/page-b
```

### CI/CD — GitHub Actions

```yaml
- name: HydraLens hydration check
  run: node packages/cli/dist/index.js https://staging.example.com
  # Exits 1 if any critical or security issue is found
```

### Sitemap scan

```bash
node packages/cli/dist/index.js --sitemap https://example.com/sitemap.xml --concurrency 8
```

### Security-only scan with JSON report

```bash
node packages/cli/dist/index.js https://example.com --security-only --output report.json
```

---

## Concurrency Tuning

`--concurrency` controls how many Playwright pages run in parallel inside a single Chromium instance.

- **Local dev machine**: `4` (default) works well
- **CI runner (2 vCPU)**: `2`–`4`
- **Large sitemap on a 16-core machine**: up to `16`, but watch memory — each page uses ~50 MB

---

## JSON Report Structure

```jsonc
[
  {
    "url": "https://example.com",
    "durationMs": 1234,
    "error": null,               // string if the page failed to load
    "mismatches": [
      {
        "selector": "#root > main > h1",
        "serverText": "Hello Server",
        "clientText": "Hello Client",
        "severity": "critical",  // security | critical | warning | info
        "severityReason": "Text content mismatch",
        "componentName": "ReactComponent",
        "advice": "Use useEffect to set initial client state only after mounting.",
        "fixSnippet": "const [isClient, setIsClient] = useState(false);\n...",
        "similarityScore": 0.42
      }
    ]
  }
]
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | No issues at or above `--threshold` |
| `1` | One or more blocking issues found |
| `2` | Fatal error (browser failed to launch, build missing, etc.) |

---

## Authenticated Pages

The CLI fetches server HTML using an unauthenticated `page.request.get()` call. If the page redirects to a login screen, the server HTML will be the login page, not the actual content.

**Workaround**: Use `--output` to capture the JSON report and post-filter URLs that returned login-page signatures. Full cookie injection support is planned for a future release.
