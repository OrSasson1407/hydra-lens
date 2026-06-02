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
}

const ADVICE_DATABASE: Record<string, Record<string, { advice: string; snippet: string }>> = {
  ReactComponent: {
    "text-mismatch": {
      advice: "State mismatch detected. Ensure you are using 'useEffect' to set initial client state only AFTER mounting.",
      snippet: "const [isClient, setIsClient] = useState(false);\nuseEffect(() => setIsClient(true), []);\nreturn <div>{isClient ? clientValue : serverValue}</div>;",
    },
    "attribute-mismatch": {
      advice: "Use 'suppressHydrationWarning' if this dynamic attribute is intended.",
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
      advice: "Avoid binding dynamic values that differ between server and client at render time.",
      snippet: "// Move dynamic bindings into ngAfterViewInit or use TransferState to sync SSR data.",
    },
  },
  Unknown: {
    "text-mismatch": {
      advice: "Text content differs between server and client render. Check for date, locale, or random values rendered at build time.",
      snippet: "// Ensure any dynamic value is either deferred to client-side or made deterministic.",
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

const SECRET_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/, label: "JWT Token" },
  { pattern: /AKIA[0-9A-Z]{16}/, label: "AWS Access Key" },
  { pattern: /sk_(live|test)_[a-zA-Z0-9]{24,}/, label: "Stripe Secret Key" },
  { pattern: /ghp_[a-zA-Z0-9]{36}/, label: "GitHub Personal Access Token" },
  { pattern: /AIza[0-9A-Za-z_-]{35}/, label: "Google API Key" },
];

export function getComponentName(el: Element): string | null {
  if (el.hasAttribute("data-reactroot") || el.closest("[data-reactroot]")) return "ReactComponent";
  const key = Object.keys(el).find((k) => k.startsWith("__reactFiber") || k.startsWith("__reactInternalInstance"));
  if (key) return "ReactComponent";
  if (el.hasAttribute("data-v-") || Object.keys(el).some((k) => k.startsWith("__vue"))) return "VueComponent";
  if (el.hasAttribute("ng-version") || el.closest("[ng-version]")) return "AngularComponent";
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
  return { severity: "warning", reason: `Attribute '${attrName}' differs between SSR and CSR` };
}

const IGNORED_TAGS = new Set(["script", "style", "noscript", "meta", "link"]);
const IGNORED_SRC_PATTERNS = [/_next\/static/, /__webpack/, /chunk\.[a-z0-9]+\.js/];

export function detectMismatches(serverHTML: string, clientDoc: Document): Mismatch[] {
  const parser = new DOMParser();
  const serverDoc = parser.parseFromString(serverHTML, "text/html");
  const mismatches: Mismatch[] = [];

  function walk(serverEl: Element, clientEl: Element | null) {
    if (!clientEl) return;
    if (IGNORED_TAGS.has(serverEl.tagName.toLowerCase())) return;

    const serverText = Array.from(serverEl.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent?.trim())
      .join("")
      .trim();
    const clientText = Array.from(clientEl.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent?.trim())
      .join("")
      .trim();

    const componentName = getComponentName(clientEl);

    if (serverText && clientText && serverText !== clientText) {
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
      });
    }

    for (const attr of Array.from(serverEl.attributes)) {
      const serverVal = attr.value;
      const clientVal = clientEl.getAttribute(attr.name);
      if (clientVal === null || serverVal === clientVal) continue;

      if (attr.name === "src") {
        if (IGNORED_SRC_PATTERNS.some((p) => p.test(serverVal))) continue;
      }

      const { severity, reason } = classifyAttributeMismatch(attr.name, serverVal, clientVal);
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
      walk(serverChildren[i], clientChildren[i] ?? null);
    }
  }

  walk(serverDoc.body, clientDoc.body);
  return mismatches;
}
