# @hydra-lens/core

Pure detection logic for [HydraLens](https://github.com/your-org/hydra-lens) — no DOM or browser dependencies.

## Install

```bash
npm install @hydra-lens/core
# or
pnpm add @hydra-lens/core
```

## Usage

```ts
import { detectMismatches } from "@hydra-lens/core";

const mismatches = detectMismatches(serverHTML, document);
// => Mismatch[]
```

### With options

```ts
const mismatches = detectMismatches(serverHTML, document, {
  maxDepth: 10,                // default: Infinity
  similarityThreshold: 0.8,   // default: 0.6 (lower = fewer reports)
  securityOnly: false,        // default: false
});
```

### Async (non-blocking for large DOMs)

```ts
import { detectMismatchesAsync } from "@hydra-lens/core";

const mismatches = await detectMismatchesAsync(serverHTML, document);
```

## API

### `detectMismatches(serverHTML, clientDoc, options?): Mismatch[]`
### `detectMismatchesAsync(serverHTML, clientDoc, options?): Promise<Mismatch[]>`

Both return the same results. Use the async variant when scanning large pages in a content script to avoid blocking the main thread.

### `Mismatch`

```ts
interface Mismatch {
  selector: string;           // CSS path to the mismatched element
  serverText: string;
  clientText: string;
  serverAttrValue?: string;
  attributeName?: string;
  severity: "security" | "critical" | "warning" | "info";
  severityReason: string;
  componentName: string | null; // "ReactComponent" | "VueComponent" | etc.
  advice: string;
  fixSnippet: string;
  similarityScore?: number;   // 0–1, present for text mismatches
}
```

### `getFix(componentName, reason): { advice, snippet }`

Look up actionable advice and a copy-ready code snippet for a given framework and mismatch reason.

### `classifyAttributeMismatch(attrName, serverVal, clientVal): { severity, reason }`

Classify a single attribute difference without running a full DOM walk.

### `getComponentName(el): string | null`

Detect the framework that owns a DOM element.

## License

MIT
