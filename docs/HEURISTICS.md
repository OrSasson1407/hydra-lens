# Detection Heuristics

This document is the canonical reference for every rule HydraLens uses to detect
and classify mismatches.

---

## Severity Model

| Level      | Meaning                                              | Example                                    |
| ---------- | ---------------------------------------------------- | ------------------------------------------ |
| `security` | A known secret pattern is present in a DOM attribute | JWT token in `data-token`                  |
| `critical` | Mismatch will break functionality or accessibility   | Text content differs; `aria-label` differs |
| `warning`  | Mismatch is suspicious but may be intentional        | Generic attribute differs                  |
| `info`     | Mismatch is expected and can be safely ignored       | Timestamp; cache-bust query param          |

---

## Secret Patterns

| Label              | Pattern (simplified)                 | Rationale                      |
| ------------------ | ------------------------------------ | ------------------------------ |
| JWT Token          | `eyJ….<base64>.<base64>`             | Standard JWT header prefix     |
| AWS Access Key     | `AKIA` + 16 uppercase alphanums      | AWS documented prefix          |
| Stripe Secret Key  | `sk_live_` or `sk_test_` + 24+ chars | Stripe documented format       |
| GitHub PAT         | `ghp_` + 36 alphanums                | GitHub fine-grained PAT prefix |
| Google API Key     | `AIza` + 35 alphanums                | Google Cloud documented prefix |
| Slack Token        | `xox[baprs]-…`                       | Slack documented prefixes      |
| Twilio Account SID | `AC` + 32 lowercase hex              | Twilio documented format       |
| SendGrid API Key   | `SK` + 32 lowercase hex              | SendGrid documented format     |
| PEM Private Key    | `-----BEGIN … PRIVATE KEY-----`      | RFC 7468 PEM header            |

### Why the High-Entropy Catch-All Was Removed

An earlier version included a catch-all pattern that flagged any attribute value
with Shannon entropy > 4.5. It was removed because:

- Base64-encoded image data (`data-src="data:image/png;base64,..."`) triggered
  it on nearly every page
- Font subset hashes (used by Next.js, Nuxt) triggered thousands of false
  positives
- Minified JS identifiers in `data-*` attributes also matched

The named patterns above have a false-positive rate close to zero on real
production pages.

---

## Timestamp Auto-Ignore

Attribute values matching these patterns are classified as `info` rather than
`warning`:

| Pattern                       | Matches                              |
| ----------------------------- | ------------------------------------ |
| ISO 8601 date/datetime        | `2025-06-04`, `2025-06-04T12:00:00Z` |
| Unix timestamp (10–13 digits) | `1717488000`, `1717488000000`        |
| RFC 2822 date prefix          | `Mon, `, `Tue, `, …                  |

---

## Framework-Internal Attribute Ignore List

These attribute prefixes are skipped entirely (never reported):

- `data-reactid`, `data-react-*`
- `data-v-*` (Vue scoped styles)
- `data-sveltekit-*`
- `data-n-*` (Next.js internals)
- `__ng*`, `ng-version`

---

## Similarity Threshold

Text mismatches use Levenshtein edit distance normalized to `[0, 1]`:

```
score = 1 - editDistance(serverText, clientText) / max(len(serverText), len(clientText))
```

Default threshold: **0.6** — texts with similarity below 0.6 are reported.

- `1.0` = identical strings
- `0.9` = one character different in a 10-char string
- `0.0` = completely different

To tune: pass `similarityThreshold` in `DetectOptions`.

### 1500-Character Guard

Strings longer than 1500 characters bypass the edit distance calculation
(returns `1` if equal, `0` if not). This prevents O(n²) memory allocation on
large DOM nodes like inline SVG or JSON-LD blobs.

---

## Framework Detection Fingerprints

| Framework | Detection method                                                                                |
| --------- | ----------------------------------------------------------------------------------------------- |
| React     | `data-reactroot` attribute OR `__reactFiber*` / `__reactInternalInstance*` property on DOM node |
| Vue       | `__vue_app__` property OR `__vue*` property prefix                                              |
| Angular   | `__ngContext__` property OR `ng-version` attribute                                              |
| Svelte    | `__svelte*` property prefix                                                                     |
| SolidJS   | `_$owner` property present on node                                                              |
| Unknown   | None of the above                                                                               |

---

## src/href Ignore Patterns

The following `src` and `href` values are silently ignored to suppress
build-tool noise:

- `/_next/static/` (Next.js static assets)
- `/__webpack` (Webpack chunk URLs)
- `/chunk.[hash].js` (generic code-split chunks)

Cache-busting query parameters (`?v=`, `?hash=`, `?t=`, `?ts=`, `?cb=`) on
`src`/`href` are reported as `info`.
