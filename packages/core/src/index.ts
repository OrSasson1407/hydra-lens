export type Severity = "critical" | "warning" | "info" | "security";

export interface Mismatch {
  selector: string;
  serverText: string;
  clientText: string;
  serverAttrValue?: string;
  attributeName?: string;
  severity: Severity;
  severityReason: string;
  componentName: string | null;
  advice: string;
  fixSnippet: string;
  similarityScore?: number;
}

export interface DetectOptions {
  maxDepth?: number;
  similarityThreshold?: number;
  securityOnly?: boolean;
}

// ── ADVICE DATABASE ───────────────────────────────────────────────────────────
const ADVICE_DATABASE: Record<string, Record<string, { advice: string; snippet: string }>> = {
  ReactComponent: {
    "text-mismatch": {
      advice:
        "State mismatch detected. Use 'useEffect' to set initial client state only AFTER mounting.",
      snippet:
        "const [isClient, setIsClient] = useState(false);\nuseEffect(() => setIsClient(true), []);\nreturn <div>{isClient ? clientValue : serverValue}</div>;",
    },
    "attribute-mismatch": {
      advice: "Use 'suppressHydrationWarning' if this dynamic attribute is intentional.",
      snippet: "<div suppressHydrationWarning={true} className={dynamicClass} />",
    },
  },
  VueComponent: {
    "text-mismatch": {
      advice:
        "Avoid accessing browser-only APIs (window/localStorage) during SSR. Use onMounted() for client-only logic.",
      snippet:
        "const value = ref('');\nonMounted(() => { value.value = localStorage.getItem('key') ?? ''; });",
    },
    "attribute-mismatch": {
      advice: "Use v-if with a client-only flag to prevent SSR/CSR attribute mismatches.",
      snippet: "const isClient = ref(false);\nonMounted(() => { isClient.value = true; });",
    },
  },
  SvelteComponent: {
    "text-mismatch": {
      advice: "Use onMount() to defer browser-only logic and avoid SSR mismatches.",
      snippet:
        "import { onMount } from 'svelte';\nlet value = '';\nonMount(() => { value = localStorage.getItem('key') ?? ''; });",
    },
    "attribute-mismatch": {
      advice: "Use a mounted flag to suppress SSR attribute differences.",
      snippet: "let mounted = false;\nonMount(() => { mounted = true; });",
    },
  },
  SolidComponent: {
    "text-mismatch": {
      advice: "Use createEffect or isServer to guard browser-only logic in SolidJS.",
      snippet:
        "import { isServer } from 'solid-js/web';\nconst value = isServer ? '' : localStorage.getItem('key') ?? '';",
    },
    "attribute-mismatch": {
      advice: "Wrap dynamic attributes in createEffect to run only on the client.",
      snippet: "createEffect(() => { el.setAttribute('data-val', computedValue()); });",
    },
  },
  AngularComponent: {
    "text-mismatch": {
      advice: "Use isPlatformBrowser() to guard browser-only code and avoid SSR mismatches.",
      snippet:
        "constructor(@Inject(PLATFORM_ID) private platformId: Object) {}\nngOnInit() { if (isPlatformBrowser(this.platformId)) { /* client only */ } }",
    },
    "attribute-mismatch": {
      advice: "Move dynamic bindings into ngAfterViewInit or use TransferState to sync SSR data.",
      snippet: "// Use TransferState to pass server data to the client without re-fetching.",
    },
  },
  NextComponent: {
    "text-mismatch": {
      advice:
        "Use `suppressHydrationWarning` on the element or move dynamic content into a `useEffect` to avoid Next.js SSR/CSR mismatches.",
      snippet:
        "const [mounted, setMounted] = useState(false);\nuseEffect(() => setMounted(true), []);\nif (!mounted) return <div>{serverFallback}</div>;",
    },
    "attribute-mismatch": {
      advice: "Wrap dynamic attributes with `suppressHydrationWarning` or defer them via `useEffect`.",
      snippet: "<div suppressHydrationWarning data-dynamic={clientValue} />",
    },
  },
  NuxtComponent: {
    "text-mismatch": {
      advice:
        "Use `<ClientOnly>` wrapper or check `process.client` to prevent Nuxt SSR/CSR text mismatches.",
      snippet:
        "<ClientOnly>\n  <template #default>{{ clientValue }}</template>\n  <template #fallback>{{ serverFallback }}</template>\n</ClientOnly>",
    },
    "attribute-mismatch": {
      advice: "Use `<ClientOnly>` or a `mounted` ref to suppress Nuxt attribute mismatches.",
      snippet: "const mounted = ref(false);\nonMounted(() => { mounted.value = true; });",
    },
  },
  Unknown: {
    "text-mismatch": {
      advice:
        "Text content differs between server and client. Check for dates, locales, or random values rendered at build time.",
      snippet: "// Ensure dynamic values are deferred to client-side or made deterministic.",
    },
    "attribute-mismatch": {
      advice:
        "An attribute value differs between SSR and CSR. Common causes: timestamps, nonces, or session-based values.",
      snippet:
        "// Review initialization logic and defer non-deterministic attributes to client mount.",
    },
  },
};

export function getFix(
  componentName: string | null,
  reason: string
): { advice: string; snippet: string } {
  const key = componentName ?? "Unknown";
  const db = ADVICE_DATABASE[key] ?? ADVICE_DATABASE["Unknown"];
  const type = reason.toLowerCase().includes("text") ? "text-mismatch" : "attribute-mismatch";
  return (
    db[type] ?? {
      advice: "Review your initialization logic.",
      snippet: "// No specific snippet available.",
    }
  );
}

// ── SECRET PATTERNS ───────────────────────────────────────────────────────────
// NOTE: The catch-all high-entropy pattern is intentionally removed — it produced
// massive false-positive noise on base64 image data, font hashes, and minified JS.
const SECRET_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/, label: "JWT Token" },
  { pattern: /AKIA[0-9A-Z]{16}/, label: "AWS Access Key" },
  { pattern: /sk_(live|test)_[a-zA-Z0-9]{24,}/, label: "Stripe Secret Key" },
  { pattern: /ghp_[a-zA-Z0-9]{36}/, label: "GitHub Personal Access Token" },
  { pattern: /AIza[0-9A-Za-z_-]{35}/, label: "Google API Key" },
  { pattern: /xox[baprs]-[0-9A-Za-z-]{10,}/, label: "Slack Token" },
  { pattern: /AC[a-z0-9]{32}/, label: "Twilio Account SID" },
  { pattern: /SK[a-z0-9]{32}/, label: "SendGrid API Key" },
  { pattern: /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/, label: "Private Key (PEM)" },
];

// ── TIMESTAMP / DATE PATTERNS TO AUTO-IGNORE ─────────────────────────────────
const TIMESTAMP_PATTERNS: RegExp[] = [
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/,
  /^\d{10,13}$/,
  /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s/i,
];

function isTimestampValue(val: string): boolean {
  return TIMESTAMP_PATTERNS.some((p) => p.test(val.trim()));
}

// ── FRAMEWORK-INTERNAL ATTRIBUTE PREFIXES TO IGNORE ──────────────────────────
const IGNORED_ATTR_PREFIXES = [
  "data-reactid",
  "data-nextjs-",
  "data-n-head",
  "data-hid",
  "data-server-rendered",
  "data-react-",
  "data-v-",
  "data-sveltekit-",
  "data-n-",
  "__ng",
  "ng-version",
];

function isFrameworkInternalAttr(name: string): boolean {
  return IGNORED_ATTR_PREFIXES.some((prefix) => name.startsWith(prefix));
}

// ── FUZZY SIMILARITY (Levenshtein-based) ─────────────────────────────────────
function editDistance(a: string, b: string): number {
  const m = a.length,
    n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function similarityScore(a: string, b: string): number {
  if (!a && !b) return 1;
  if (a.length > 1500 || b.length > 1500) return a === b ? 1 : 0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - editDistance(a, b) / maxLen;
}

// ── FRAMEWORK DETECTION ───────────────────────────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
export function getComponentName(el: Element): string | null {
  if (el.hasAttribute("data-reactroot") || el.closest("[data-reactroot]")) return "ReactComponent";
  const keys = Object.keys(el as any);
  if (keys.some((k) => k.startsWith("__reactFiber") || k.startsWith("__reactInternalInstance")))
    return "ReactComponent";
  if ((el as any).__vue_app__ || keys.some((k) => k.startsWith("__vue"))) return "VueComponent";
  if ((el as any).__ngContext__ || el.hasAttribute("ng-version") || el.closest("[ng-version]"))
    return "AngularComponent";
  // Svelte: components leave a __svelte property on the DOM node
  if (keys.some((k) => k.startsWith("__svelte"))) return "SvelteComponent";
  // SolidJS: leaves _$owner on reactive nodes
  if ((el as any)._$owner !== undefined) return "SolidComponent";
  // Next.js: sets __NEXT_DATA__ on window and data-nextjs-* attributes
  if (el.closest("[data-nextjs-scroll-focus-boundary]") || (typeof window !== "undefined" && (window as any).__NEXT_DATA__))
    return "NextComponent";
  // Nuxt: sets __nuxt on window and data-server-rendered on root
  if (el.hasAttribute("data-server-rendered") || (typeof window !== "undefined" && (window as any).__nuxt))
    return "NuxtComponent";
  return null;
}

export function getCssPath(el: Element): string {
  if (el.hasAttribute("data-testid")) return `[data-testid="${el.getAttribute("data-testid")}"]`;
  if (el.id) return `#${el.id}`;
  const parent = el.parentElement;
  if (!parent) return el.tagName.toLowerCase();
  const siblings = Array.from(parent.children);
  const index = siblings.indexOf(el) + 1;
  return `${getCssPath(parent)} > ${el.tagName.toLowerCase()}:nth-child(${index})`;
}

export function classifyAttributeMismatch(
  attrName: string,
  serverVal: string,
  clientVal: string
): { severity: Severity; reason: string } {
  for (const { pattern, label } of SECRET_PATTERNS) {
    if (pattern.test(serverVal) || pattern.test(clientVal)) {
      return { severity: "security", reason: `Potential ${label} exposed in attribute` };
    }
  }
  if (attrName.startsWith("aria-") || attrName === "role") {
    return {
      severity: "critical",
      reason: "Accessibility attribute mismatch may break screen readers",
    };
  }
  if (attrName === "src" || attrName === "href") {
    const isCacheBust =
      /[?&](v|version|hash|t|ts|cb)=/.test(serverVal) ||
      /[?&](v|version|hash|t|ts|cb)=/.test(clientVal);
    if (isCacheBust)
      return { severity: "info", reason: "Cache-busting parameter differs (expected)" };
  }
  if (isTimestampValue(serverVal) || isTimestampValue(clientVal)) {
    return {
      severity: "info",
      reason: "Timestamp or date value differs between SSR and CSR (expected)",
    };
  }
  return { severity: "warning", reason: `Attribute '${attrName}' differs between SSR and CSR` };
}

const IGNORED_TAGS = new Set(["script", "style", "noscript", "link"]);
const IGNORED_SRC_PATTERNS = [/_next\/static/, /__webpack/, /chunk\.[a-z0-9]+\.js/];

// ── SHARED NODE PROCESSOR ─────────────────────────────────────────────────────
// Single implementation used by both sync and async detectors to keep behaviour
// identical and avoid the DFS-order divergence that existed before this fix.
function processNode(
  serverEl: Element,
  clientEl: Element | null,
  depth: number,
  options: Required<DetectOptions>,
  push: (m: Mismatch) => void
): Array<{ serverEl: Element; clientEl: Element | null; depth: number }> {
  if (!clientEl || depth > options.maxDepth || IGNORED_TAGS.has(serverEl.tagName.toLowerCase()))
    return [];

  const componentName = getComponentName(clientEl);

  // Text mismatch
  if (!options.securityOnly) {
    const serverText = Array.from(serverEl.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent?.trim() ?? "")
      .join("")
      .trim();
    const clientText = Array.from(clientEl.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent?.trim() ?? "")
      .join("")
      .trim();

    if (serverText && clientText && serverText !== clientText) {
      const score = similarityScore(serverText, clientText);
      if (score < options.similarityThreshold) {
        const fix = getFix(componentName, "Text content mismatch");
        push({
          selector: getCssPath(clientEl),
          serverText,
          clientText,
          severity: "critical",
          severityReason: "Text content mismatch",
          componentName,
          advice: fix.advice,
          fixSnippet: fix.snippet,
          similarityScore: Math.round(score * 100) / 100,
        });
      }
    }
  }

  // Attribute mismatches
  for (const attr of Array.from(serverEl.attributes)) {
    const serverVal = attr.value;
    const clientVal = clientEl.getAttribute(attr.name);
    if (clientVal === null || serverVal === clientVal) continue;
    if (isFrameworkInternalAttr(attr.name)) continue;
    if (attr.name === "src" && IGNORED_SRC_PATTERNS.some((p) => p.test(serverVal))) continue;

    const { severity, reason } = classifyAttributeMismatch(attr.name, serverVal, clientVal);
    if (options.securityOnly && severity !== "security") continue;

    const fix = getFix(componentName, reason);
    push({
      selector: getCssPath(clientEl),
      serverText: "",
      clientText: "",
      serverAttrValue: serverVal,
      attributeName: attr.name,
      severity,
      severityReason: reason,
      componentName,
      advice: fix.advice,
      fixSnippet: fix.snippet,
    });
  }

  // Return children in forward order (consistent left-to-right DFS for both sync & async)
  const serverChildren = Array.from(serverEl.children);
  const clientChildren = Array.from(clientEl.children);
  return serverChildren.map((sc, i) => ({
    serverEl: sc,
    clientEl: clientChildren[i] ?? null,
    depth: depth + 1,
  }));
}

// ── SYNC DETECTOR ─────────────────────────────────────────────────────────────
export function detectMismatches(
  serverHTML: string,
  clientDoc: Document,
  options: DetectOptions = {}
): Mismatch[] {
  const opts: Required<DetectOptions> = {
    maxDepth: options.maxDepth ?? Infinity,
    similarityThreshold: options.similarityThreshold ?? 0.6,
    securityOnly: options.securityOnly ?? false,
  };

  const parser = new DOMParser();
  const serverDoc = parser.parseFromString(serverHTML, "text/html");
  const mismatches: Mismatch[] = [];

  function walk(serverEl: Element, clientEl: Element | null, depth: number) {
    const children = processNode(serverEl, clientEl, depth, opts, (m) => mismatches.push(m));
    for (const child of children) walk(child.serverEl, child.clientEl, child.depth);
  }

  walk(serverDoc.documentElement, clientDoc.documentElement, 0);
  return mismatches;
}

// ── ASYNC YIELDING DETECTOR ───────────────────────────────────────────────────
export async function detectMismatchesAsync(
  serverHTML: string,
  clientDoc: Document,
  options: DetectOptions = {}
): Promise<Mismatch[]> {
  const opts: Required<DetectOptions> = {
    maxDepth: options.maxDepth ?? Infinity,
    similarityThreshold: options.similarityThreshold ?? 0.6,
    securityOnly: options.securityOnly ?? false,
  };

  const parser = new DOMParser();
  const serverDoc = parser.parseFromString(serverHTML, "text/html");
  const mismatches: Mismatch[] = [];

  // Stack stores work items; children are pushed in reverse so pop() gives left-to-right order
  const stack: { serverEl: Element; clientEl: Element | null; depth: number }[] = [
    { serverEl: serverDoc.documentElement, clientEl: clientDoc.documentElement, depth: 0 },
  ];

  let lastYield = performance.now();

  while (stack.length > 0) {
    // Yield before processing each node so the threshold applies per-node, not per-batch
    if (performance.now() - lastYield > 15) {
      await new Promise<void>((r) => setTimeout(r, 0));
      lastYield = performance.now();
    }

    const current = stack.pop()!;
    const children = processNode(current.serverEl, current.clientEl, current.depth, opts, (m) =>
      mismatches.push(m)
    );

    // Push in reverse so that stack.pop() processes left-to-right (same order as sync walk)
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push(children[i]);
    }
  }

  return mismatches;
}


