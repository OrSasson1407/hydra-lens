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

// ── A: ADVICE DATABASE ───────────────────────────────────────────────────────
const ADVICE_DATABASE: Record<string, Record<string, { advice: string; snippet: string }>> = {
  ReactComponent: {
    "text-mismatch": {
      advice: "State mismatch detected. Use 'useEffect' to set initial client state only AFTER mounting.",
      snippet: "const [isClient, setIsClient] = useState(false);\nuseEffect(() => setIsClient(true), []);\nreturn <div>{isClient ? clientValue : serverValue}</div>;",
    },
    "attribute-mismatch": {
      advice: "Use 'suppressHydrationWarning' if this dynamic attribute is intentional.",
      snippet: "<div suppressHydrationWarning={true} className={dynamicClass} />",
    },
  },
  VueComponent: {
    "text-mismatch": {
      advice: "Avoid accessing browser-only APIs (window/localStorage) during SSR. Use onMounted() for client-only logic.",
      snippet: "const value = ref('');\nonMounted(() => { value.value = localStorage.getItem('key') ?? ''; });",
    },
    "attribute-mismatch": {
      advice: "Use v-if with a client-only flag to prevent SSR/CSR attribute mismatches.",
      snippet: "const isClient = ref(false);\nonMounted(() => { isClient.value = true; });",
    },
  },
  AngularComponent: {
    "text-mismatch": {
      advice: "Use isPlatformBrowser() to guard browser-only code and avoid SSR mismatches.",
      snippet: "constructor(@Inject(PLATFORM_ID) private platformId: Object) {}\nngOnInit() { if (isPlatformBrowser(this.platformId)) { /* client only */ } }",
    },
    "attribute-mismatch": {
      advice: "Move dynamic bindings into ngAfterViewInit or use TransferState to sync SSR data.",
      snippet: "// Use TransferState to pass server data to the client without re-fetching.",
    },
  },
  Unknown: {
    "text-mismatch": {
      advice: "Text content differs between server and client. Check for dates, locales, or random values rendered at build time.",
      snippet: "// Ensure dynamic values are deferred to client-side or made deterministic.",
    },
    "attribute-mismatch": {
      advice: "An attribute value differs between SSR and CSR. Common causes: timestamps, nonces, or session-based values.",
      snippet: "// Review initialization logic and defer non-deterministic attributes to client mount.",
    },
  },
};

export function getFix(componentName: string | null, reason: string): { advice: string; snippet: string } {
  const key = componentName ?? "Unknown";
  const db = ADVICE_DATABASE[key] ?? ADVICE_DATABASE["Unknown"];
  const type = reason.toLowerCase().includes("text") ? "text-mismatch" : "attribute-mismatch";
  return db[type] ?? { advice: "Review your initialization logic.", snippet: "// No specific snippet available." };
}

// ── I: EXPANDED SECRET PATTERNS ──────────────────────────────────────────────
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
  {
    pattern: /(?<![a-zA-Z0-9/+=])[a-zA-Z0-9/+=]{40,}(?![a-zA-Z0-9/+=])/,
    label: "High-entropy string (possible secret)",
  },
];

// ── C: TIMESTAMP / DATE PATTERNS TO AUTO-IGNORE ──────────────────────────────
const TIMESTAMP_PATTERNS: RegExp[] = [
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/,
  /^\d{10,13}$/,
  /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s/i,
];

function isTimestampValue(val: string): boolean {
  return TIMESTAMP_PATTERNS.some((p) => p.test(val.trim()));
}

// ── D: FRAMEWORK-INTERNAL ATTRIBUTE PREFIXES TO IGNORE ───────────────────────
const IGNORED_ATTR_PREFIXES = [
  "data-reactid",
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

// ── B: FUZZY SIMILARITY (Levenshtein-based) ───────────────────────────────────
function editDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function similarityScore(a: string, b: string): number {
  if (!a && !b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - editDistance(a, b) / maxLen;
}

// ── COMPONENT DETECTION ───────────────────────────────────────────────────────
export function getComponentName(el: Element): string | null {
  if (el.hasAttribute("data-reactroot") || el.closest("[data-reactroot]")) return "ReactComponent";
  const keys = Object.keys(el as any);
  if (keys.some((k) => k.startsWith("__reactFiber") || k.startsWith("__reactInternalInstance"))) return "ReactComponent";
  if ((el as any).__vue_app__ || keys.some((k) => k.startsWith("__vue"))) return "VueComponent";
  if ((el as any).__ngContext__ || el.hasAttribute("ng-version") || el.closest("[ng-version]")) return "AngularComponent";
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
    return { severity: "critical", reason: "Accessibility attribute mismatch may break screen readers" };
  }
  if (attrName === "src" || attrName === "href") {
    const isCacheBust = /[?&](v|version|hash|t|ts|cb)=/.test(serverVal) || /[?&](v|version|hash|t|ts|cb)=/.test(clientVal);
    if (isCacheBust) return { severity: "info", reason: "Cache-busting parameter differs (expected)" };
  }
  if (isTimestampValue(serverVal) || isTimestampValue(clientVal)) {
    return { severity: "info", reason: "Timestamp or date value differs between SSR and CSR (expected)" };
  }
  return { severity: "warning", reason: `Attribute '${attrName}' differs between SSR and CSR` };
}

const IGNORED_TAGS = new Set(["script", "style", "noscript", "meta", "link"]);
const IGNORED_SRC_PATTERNS = [/_next\/static/, /__webpack/, /chunk\.[a-z0-9]+\.js/];

// ── A+B+C+D: detectMismatches with options ────────────────────────────────────
export function detectMismatches(
  serverHTML: string,
  clientDoc: Document,
  options: DetectOptions = {}
): Mismatch[] {
  const {
    maxDepth = Infinity,
    similarityThreshold = 0.6,
    securityOnly = false,
  } = options;

  const parser = new DOMParser();
  const serverDoc = parser.parseFromString(serverHTML, "text/html");
  const mismatches: Mismatch[] = [];

  function walk(serverEl: Element, clientEl: Element | null, depth: number) {
    if (!clientEl) return;
    if (depth > maxDepth) return;
    if (IGNORED_TAGS.has(serverEl.tagName.toLowerCase())) return;

    const componentName = getComponentName(clientEl);

    // Text mismatch
    if (!securityOnly) {
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
        // B: only flag if texts are sufficiently different
        if (score < similarityThreshold) {
          const reason = "Text content mismatch";
          const fix = getFix(componentName, reason);
          mismatches.push({
            selector: getCssPath(clientEl),
            serverText,
            clientText,
            severity: "critical",
            severityReason: reason,
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

      // D: skip framework-internal attributes
      if (isFrameworkInternalAttr(attr.name)) continue;

      if (attr.name === "src") {
        if (IGNORED_SRC_PATTERNS.some((p) => p.test(serverVal))) continue;
      }

      const { severity, reason } = classifyAttributeMismatch(attr.name, serverVal, clientVal);

      // J: securityOnly mode — skip non-security findings
      if (securityOnly && severity !== "security") continue;

      const fix = getFix(componentName, reason);
      mismatches.push({
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

    const serverChildren = Array.from(serverEl.children);
    const clientChildren = Array.from(clientEl.children);
    for (let i = 0; i < serverChildren.length; i++) {
      walk(serverChildren[i], clientChildren[i] ?? null, depth + 1);
    }
  }

  walk(serverDoc.body, clientDoc.body, 0);
  return mismatches;
}

// ── ASYNC YIELDING DETECTOR ───────────────────────────────────────────────────
export async function detectMismatchesAsync(
  serverHTML: string,
  clientDoc: Document,
  options: DetectOptions = {}
): Promise<Mismatch[]> {
  const { maxDepth = Infinity, similarityThreshold = 0.6, securityOnly = false } = options;
  const parser = new DOMParser();
  const serverDoc = parser.parseFromString(serverHTML, "text/html");
  const mismatches: Mismatch[] = [];

  const stack: { serverEl: Element; clientEl: Element | null; depth: number }[] = [
    { serverEl: serverDoc.body, clientEl: clientDoc.body, depth: 0 }
  ];

  let lastYield = performance.now();

  while (stack.length > 0) {
    if (performance.now() - lastYield > 15) {
      await new Promise(r => setTimeout(r, 0)); // Yield main thread
      lastYield = performance.now();
    }

    const current = stack.pop();
    if (!current) continue;
    const { serverEl, clientEl, depth } = current;

    if (!clientEl || depth > maxDepth || IGNORED_TAGS.has(serverEl.tagName.toLowerCase())) continue;

    const componentName = getComponentName(clientEl);

    // Text Mismatch
    if (!securityOnly) {
      const sText = Array.from(serverEl.childNodes).filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent?.trim() ?? "").join("").trim();
      const cText = Array.from(clientEl.childNodes).filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent?.trim() ?? "").join("").trim();
      if (sText && cText && sText !== cText) {
        const score = similarityScore(sText, cText);
        if (score < similarityThreshold) {
          const fix = getFix(componentName, "Text content mismatch");
          mismatches.push({ selector: getCssPath(clientEl), serverText: sText, clientText: cText, severity: "critical", severityReason: "Text content mismatch", componentName, advice: fix.advice, fixSnippet: fix.snippet, similarityScore: Math.round(score * 100) / 100 });
        }
      }
    }

    // Attribute Mismatch
    for (const attr of Array.from(serverEl.attributes)) {
      const serverVal = attr.value;
      const clientVal = clientEl.getAttribute(attr.name);
      if (clientVal === null || serverVal === clientVal || isFrameworkInternalAttr(attr.name)) continue;
      if (attr.name === "src" && IGNORED_SRC_PATTERNS.some(p => p.test(serverVal))) continue;

      const { severity, reason } = classifyAttributeMismatch(attr.name, serverVal, clientVal);
      if (securityOnly && severity !== "security") continue;
      const fix = getFix(componentName, reason);
      mismatches.push({ selector: getCssPath(clientEl), serverText: "", clientText: "", serverAttrValue: serverVal, attributeName: attr.name, severity, severityReason: reason, componentName, advice: fix.advice, fixSnippet: fix.snippet });
    }

    // Queue children (reverse order for correct left-to-right DFS)
    const serverChildren = Array.from(serverEl.children);
    const clientChildren = Array.from(clientEl.children);
    for (let i = serverChildren.length - 1; i >= 0; i--) {
      stack.push({ serverEl: serverChildren[i], clientEl: clientChildren[i] ?? null, depth: depth + 1 });
    }
  }
  return mismatches;
}
