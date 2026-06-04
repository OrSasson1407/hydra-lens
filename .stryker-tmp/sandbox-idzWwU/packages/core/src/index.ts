// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
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
const ADVICE_DATABASE: Record<string, Record<string, {
  advice: string;
  snippet: string;
}>> = stryMutAct_9fa48("0") ? {} : (stryCov_9fa48("0"), {
  ReactComponent: stryMutAct_9fa48("1") ? {} : (stryCov_9fa48("1"), {
    "text-mismatch": stryMutAct_9fa48("2") ? {} : (stryCov_9fa48("2"), {
      advice: stryMutAct_9fa48("3") ? "" : (stryCov_9fa48("3"), "State mismatch detected. Use 'useEffect' to set initial client state only AFTER mounting."),
      snippet: stryMutAct_9fa48("4") ? "" : (stryCov_9fa48("4"), "const [isClient, setIsClient] = useState(false);\nuseEffect(() => setIsClient(true), []);\nreturn <div>{isClient ? clientValue : serverValue}</div>;")
    }),
    "attribute-mismatch": stryMutAct_9fa48("5") ? {} : (stryCov_9fa48("5"), {
      advice: stryMutAct_9fa48("6") ? "" : (stryCov_9fa48("6"), "Use 'suppressHydrationWarning' if this dynamic attribute is intentional."),
      snippet: stryMutAct_9fa48("7") ? "" : (stryCov_9fa48("7"), "<div suppressHydrationWarning={true} className={dynamicClass} />")
    })
  }),
  VueComponent: stryMutAct_9fa48("8") ? {} : (stryCov_9fa48("8"), {
    "text-mismatch": stryMutAct_9fa48("9") ? {} : (stryCov_9fa48("9"), {
      advice: stryMutAct_9fa48("10") ? "" : (stryCov_9fa48("10"), "Avoid accessing browser-only APIs (window/localStorage) during SSR. Use onMounted() for client-only logic."),
      snippet: stryMutAct_9fa48("11") ? "" : (stryCov_9fa48("11"), "const value = ref('');\nonMounted(() => { value.value = localStorage.getItem('key') ?? ''; });")
    }),
    "attribute-mismatch": stryMutAct_9fa48("12") ? {} : (stryCov_9fa48("12"), {
      advice: stryMutAct_9fa48("13") ? "" : (stryCov_9fa48("13"), "Use v-if with a client-only flag to prevent SSR/CSR attribute mismatches."),
      snippet: stryMutAct_9fa48("14") ? "" : (stryCov_9fa48("14"), "const isClient = ref(false);\nonMounted(() => { isClient.value = true; });")
    })
  }),
  SvelteComponent: stryMutAct_9fa48("15") ? {} : (stryCov_9fa48("15"), {
    "text-mismatch": stryMutAct_9fa48("16") ? {} : (stryCov_9fa48("16"), {
      advice: stryMutAct_9fa48("17") ? "" : (stryCov_9fa48("17"), "Use onMount() to defer browser-only logic and avoid SSR mismatches."),
      snippet: stryMutAct_9fa48("18") ? "" : (stryCov_9fa48("18"), "import { onMount } from 'svelte';\nlet value = '';\nonMount(() => { value = localStorage.getItem('key') ?? ''; });")
    }),
    "attribute-mismatch": stryMutAct_9fa48("19") ? {} : (stryCov_9fa48("19"), {
      advice: stryMutAct_9fa48("20") ? "" : (stryCov_9fa48("20"), "Use a mounted flag to suppress SSR attribute differences."),
      snippet: stryMutAct_9fa48("21") ? "" : (stryCov_9fa48("21"), "let mounted = false;\nonMount(() => { mounted = true; });")
    })
  }),
  SolidComponent: stryMutAct_9fa48("22") ? {} : (stryCov_9fa48("22"), {
    "text-mismatch": stryMutAct_9fa48("23") ? {} : (stryCov_9fa48("23"), {
      advice: stryMutAct_9fa48("24") ? "" : (stryCov_9fa48("24"), "Use createEffect or isServer to guard browser-only logic in SolidJS."),
      snippet: stryMutAct_9fa48("25") ? "" : (stryCov_9fa48("25"), "import { isServer } from 'solid-js/web';\nconst value = isServer ? '' : localStorage.getItem('key') ?? '';")
    }),
    "attribute-mismatch": stryMutAct_9fa48("26") ? {} : (stryCov_9fa48("26"), {
      advice: stryMutAct_9fa48("27") ? "" : (stryCov_9fa48("27"), "Wrap dynamic attributes in createEffect to run only on the client."),
      snippet: stryMutAct_9fa48("28") ? "" : (stryCov_9fa48("28"), "createEffect(() => { el.setAttribute('data-val', computedValue()); });")
    })
  }),
  AngularComponent: stryMutAct_9fa48("29") ? {} : (stryCov_9fa48("29"), {
    "text-mismatch": stryMutAct_9fa48("30") ? {} : (stryCov_9fa48("30"), {
      advice: stryMutAct_9fa48("31") ? "" : (stryCov_9fa48("31"), "Use isPlatformBrowser() to guard browser-only code and avoid SSR mismatches."),
      snippet: stryMutAct_9fa48("32") ? "" : (stryCov_9fa48("32"), "constructor(@Inject(PLATFORM_ID) private platformId: Object) {}\nngOnInit() { if (isPlatformBrowser(this.platformId)) { /* client only */ } }")
    }),
    "attribute-mismatch": stryMutAct_9fa48("33") ? {} : (stryCov_9fa48("33"), {
      advice: stryMutAct_9fa48("34") ? "" : (stryCov_9fa48("34"), "Move dynamic bindings into ngAfterViewInit or use TransferState to sync SSR data."),
      snippet: stryMutAct_9fa48("35") ? "" : (stryCov_9fa48("35"), "// Use TransferState to pass server data to the client without re-fetching.")
    })
  }),
  Unknown: stryMutAct_9fa48("36") ? {} : (stryCov_9fa48("36"), {
    "text-mismatch": stryMutAct_9fa48("37") ? {} : (stryCov_9fa48("37"), {
      advice: stryMutAct_9fa48("38") ? "" : (stryCov_9fa48("38"), "Text content differs between server and client. Check for dates, locales, or random values rendered at build time."),
      snippet: stryMutAct_9fa48("39") ? "" : (stryCov_9fa48("39"), "// Ensure dynamic values are deferred to client-side or made deterministic.")
    }),
    "attribute-mismatch": stryMutAct_9fa48("40") ? {} : (stryCov_9fa48("40"), {
      advice: stryMutAct_9fa48("41") ? "" : (stryCov_9fa48("41"), "An attribute value differs between SSR and CSR. Common causes: timestamps, nonces, or session-based values."),
      snippet: stryMutAct_9fa48("42") ? "" : (stryCov_9fa48("42"), "// Review initialization logic and defer non-deterministic attributes to client mount.")
    })
  })
});
export function getFix(componentName: string | null, reason: string): {
  advice: string;
  snippet: string;
} {
  if (stryMutAct_9fa48("43")) {
    {}
  } else {
    stryCov_9fa48("43");
    const key = stryMutAct_9fa48("44") ? componentName && "Unknown" : (stryCov_9fa48("44"), componentName ?? (stryMutAct_9fa48("45") ? "" : (stryCov_9fa48("45"), "Unknown")));
    const db = stryMutAct_9fa48("46") ? ADVICE_DATABASE[key] && ADVICE_DATABASE["Unknown"] : (stryCov_9fa48("46"), ADVICE_DATABASE[key] ?? ADVICE_DATABASE[stryMutAct_9fa48("47") ? "" : (stryCov_9fa48("47"), "Unknown")]);
    const type = (stryMutAct_9fa48("48") ? reason.toUpperCase().includes("text") : (stryCov_9fa48("48"), reason.toLowerCase().includes(stryMutAct_9fa48("49") ? "" : (stryCov_9fa48("49"), "text")))) ? stryMutAct_9fa48("50") ? "" : (stryCov_9fa48("50"), "text-mismatch") : stryMutAct_9fa48("51") ? "" : (stryCov_9fa48("51"), "attribute-mismatch");
    return stryMutAct_9fa48("52") ? db[type] && {
      advice: "Review your initialization logic.",
      snippet: "// No specific snippet available."
    } : (stryCov_9fa48("52"), db[type] ?? (stryMutAct_9fa48("53") ? {} : (stryCov_9fa48("53"), {
      advice: stryMutAct_9fa48("54") ? "" : (stryCov_9fa48("54"), "Review your initialization logic."),
      snippet: stryMutAct_9fa48("55") ? "" : (stryCov_9fa48("55"), "// No specific snippet available.")
    })));
  }
}

// ── SECRET PATTERNS ───────────────────────────────────────────────────────────
// NOTE: The catch-all high-entropy pattern is intentionally removed — it produced
// massive false-positive noise on base64 image data, font hashes, and minified JS.
const SECRET_PATTERNS: {
  pattern: RegExp;
  label: string;
}[] = stryMutAct_9fa48("56") ? [] : (stryCov_9fa48("56"), [stryMutAct_9fa48("57") ? {} : (stryCov_9fa48("57"), {
  pattern: stryMutAct_9fa48("61") ? /eyJ[a-zA-Z0-9_-]{10,}\.[^a-zA-Z0-9_-]{10,}/ : stryMutAct_9fa48("60") ? /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]/ : stryMutAct_9fa48("59") ? /eyJ[^a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/ : stryMutAct_9fa48("58") ? /eyJ[a-zA-Z0-9_-]\.[a-zA-Z0-9_-]{10,}/ : (stryCov_9fa48("58", "59", "60", "61"), /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/),
  label: stryMutAct_9fa48("62") ? "" : (stryCov_9fa48("62"), "JWT Token")
}), stryMutAct_9fa48("63") ? {} : (stryCov_9fa48("63"), {
  pattern: stryMutAct_9fa48("65") ? /AKIA[^0-9A-Z]{16}/ : stryMutAct_9fa48("64") ? /AKIA[0-9A-Z]/ : (stryCov_9fa48("64", "65"), /AKIA[0-9A-Z]{16}/),
  label: stryMutAct_9fa48("66") ? "" : (stryCov_9fa48("66"), "AWS Access Key")
}), stryMutAct_9fa48("67") ? {} : (stryCov_9fa48("67"), {
  pattern: stryMutAct_9fa48("69") ? /sk_(live|test)_[^a-zA-Z0-9]{24,}/ : stryMutAct_9fa48("68") ? /sk_(live|test)_[a-zA-Z0-9]/ : (stryCov_9fa48("68", "69"), /sk_(live|test)_[a-zA-Z0-9]{24,}/),
  label: stryMutAct_9fa48("70") ? "" : (stryCov_9fa48("70"), "Stripe Secret Key")
}), stryMutAct_9fa48("71") ? {} : (stryCov_9fa48("71"), {
  pattern: stryMutAct_9fa48("73") ? /ghp_[^a-zA-Z0-9]{36}/ : stryMutAct_9fa48("72") ? /ghp_[a-zA-Z0-9]/ : (stryCov_9fa48("72", "73"), /ghp_[a-zA-Z0-9]{36}/),
  label: stryMutAct_9fa48("74") ? "" : (stryCov_9fa48("74"), "GitHub Personal Access Token")
}), stryMutAct_9fa48("75") ? {} : (stryCov_9fa48("75"), {
  pattern: stryMutAct_9fa48("77") ? /AIza[^0-9A-Za-z_-]{35}/ : stryMutAct_9fa48("76") ? /AIza[0-9A-Za-z_-]/ : (stryCov_9fa48("76", "77"), /AIza[0-9A-Za-z_-]{35}/),
  label: stryMutAct_9fa48("78") ? "" : (stryCov_9fa48("78"), "Google API Key")
}), stryMutAct_9fa48("79") ? {} : (stryCov_9fa48("79"), {
  pattern: stryMutAct_9fa48("82") ? /xox[baprs]-[^0-9A-Za-z-]{10,}/ : stryMutAct_9fa48("81") ? /xox[baprs]-[0-9A-Za-z-]/ : stryMutAct_9fa48("80") ? /xox[^baprs]-[0-9A-Za-z-]{10,}/ : (stryCov_9fa48("80", "81", "82"), /xox[baprs]-[0-9A-Za-z-]{10,}/),
  label: stryMutAct_9fa48("83") ? "" : (stryCov_9fa48("83"), "Slack Token")
}), stryMutAct_9fa48("84") ? {} : (stryCov_9fa48("84"), {
  pattern: stryMutAct_9fa48("86") ? /AC[^a-z0-9]{32}/ : stryMutAct_9fa48("85") ? /AC[a-z0-9]/ : (stryCov_9fa48("85", "86"), /AC[a-z0-9]{32}/),
  label: stryMutAct_9fa48("87") ? "" : (stryCov_9fa48("87"), "Twilio Account SID")
}), stryMutAct_9fa48("88") ? {} : (stryCov_9fa48("88"), {
  pattern: stryMutAct_9fa48("90") ? /SK[^a-z0-9]{32}/ : stryMutAct_9fa48("89") ? /SK[a-z0-9]/ : (stryCov_9fa48("89", "90"), /SK[a-z0-9]{32}/),
  label: stryMutAct_9fa48("91") ? "" : (stryCov_9fa48("91"), "SendGrid API Key")
}), stryMutAct_9fa48("92") ? {} : (stryCov_9fa48("92"), {
  pattern: stryMutAct_9fa48("93") ? /-----BEGIN (RSA |EC |DSA )PRIVATE KEY-----/ : (stryCov_9fa48("93"), /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/),
  label: stryMutAct_9fa48("94") ? "" : (stryCov_9fa48("94"), "Private Key (PEM)")
})]);

// ── TIMESTAMP / DATE PATTERNS TO AUTO-IGNORE ─────────────────────────────────
const TIMESTAMP_PATTERNS: RegExp[] = stryMutAct_9fa48("95") ? [] : (stryCov_9fa48("95"), [stryMutAct_9fa48("121") ? /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\D{2})?)?$/ : stryMutAct_9fa48("120") ? /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d)?)?$/ : stryMutAct_9fa48("119") ? /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/ : stryMutAct_9fa48("118") ? /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\D{2}:?\d{2})?)?$/ : stryMutAct_9fa48("117") ? /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d:?\d{2})?)?$/ : stryMutAct_9fa48("116") ? /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[^+-]\d{2}:?\d{2})?)?$/ : stryMutAct_9fa48("115") ? /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2}))?$/ : stryMutAct_9fa48("114") ? /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\D+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/ : stryMutAct_9fa48("113") ? /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d)?)?(Z|[+-]\d{2}:?\d{2})?)?$/ : stryMutAct_9fa48("112") ? /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+))?(Z|[+-]\d{2}:?\d{2})?)?$/ : stryMutAct_9fa48("111") ? /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\D{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/ : stryMutAct_9fa48("110") ? /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/ : stryMutAct_9fa48("109") ? /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)(Z|[+-]\d{2}:?\d{2})?)?$/ : stryMutAct_9fa48("108") ? /^\d{4}-\d{2}-\d{2}(T\d{2}:\D{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/ : stryMutAct_9fa48("107") ? /^\d{4}-\d{2}-\d{2}(T\d{2}:\d(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/ : stryMutAct_9fa48("106") ? /^\d{4}-\d{2}-\d{2}(T\D{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/ : stryMutAct_9fa48("105") ? /^\d{4}-\d{2}-\d{2}(T\d:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/ : stryMutAct_9fa48("104") ? /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)$/ : stryMutAct_9fa48("103") ? /^\d{4}-\d{2}-\D{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/ : stryMutAct_9fa48("102") ? /^\d{4}-\d{2}-\d(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/ : stryMutAct_9fa48("101") ? /^\d{4}-\D{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/ : stryMutAct_9fa48("100") ? /^\d{4}-\d-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/ : stryMutAct_9fa48("99") ? /^\D{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/ : stryMutAct_9fa48("98") ? /^\d-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/ : stryMutAct_9fa48("97") ? /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?/ : stryMutAct_9fa48("96") ? /\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/ : (stryCov_9fa48("96", "97", "98", "99", "100", "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "121"), /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/), stryMutAct_9fa48("125") ? /^\D{10,13}$/ : stryMutAct_9fa48("124") ? /^\d$/ : stryMutAct_9fa48("123") ? /^\d{10,13}/ : stryMutAct_9fa48("122") ? /\d{10,13}$/ : (stryCov_9fa48("122", "123", "124", "125"), /^\d{10,13}$/), stryMutAct_9fa48("127") ? /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\S/i : stryMutAct_9fa48("126") ? /(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s/i : (stryCov_9fa48("126", "127"), /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s/i)]);
function isTimestampValue(val: string): boolean {
  if (stryMutAct_9fa48("128")) {
    {}
  } else {
    stryCov_9fa48("128");
    return stryMutAct_9fa48("129") ? TIMESTAMP_PATTERNS.every(p => p.test(val.trim())) : (stryCov_9fa48("129"), TIMESTAMP_PATTERNS.some(stryMutAct_9fa48("130") ? () => undefined : (stryCov_9fa48("130"), p => p.test(stryMutAct_9fa48("131") ? val : (stryCov_9fa48("131"), val.trim())))));
  }
}

// ── FRAMEWORK-INTERNAL ATTRIBUTE PREFIXES TO IGNORE ──────────────────────────
const IGNORED_ATTR_PREFIXES = stryMutAct_9fa48("132") ? [] : (stryCov_9fa48("132"), [stryMutAct_9fa48("133") ? "" : (stryCov_9fa48("133"), "data-reactid"), stryMutAct_9fa48("134") ? "" : (stryCov_9fa48("134"), "data-react-"), stryMutAct_9fa48("135") ? "" : (stryCov_9fa48("135"), "data-v-"), stryMutAct_9fa48("136") ? "" : (stryCov_9fa48("136"), "data-sveltekit-"), stryMutAct_9fa48("137") ? "" : (stryCov_9fa48("137"), "data-n-"), stryMutAct_9fa48("138") ? "" : (stryCov_9fa48("138"), "__ng"), stryMutAct_9fa48("139") ? "" : (stryCov_9fa48("139"), "ng-version")]);
function isFrameworkInternalAttr(name: string): boolean {
  if (stryMutAct_9fa48("140")) {
    {}
  } else {
    stryCov_9fa48("140");
    return stryMutAct_9fa48("141") ? IGNORED_ATTR_PREFIXES.every(prefix => name.startsWith(prefix)) : (stryCov_9fa48("141"), IGNORED_ATTR_PREFIXES.some(stryMutAct_9fa48("142") ? () => undefined : (stryCov_9fa48("142"), prefix => stryMutAct_9fa48("143") ? name.endsWith(prefix) : (stryCov_9fa48("143"), name.startsWith(prefix)))));
  }
}

// ── FUZZY SIMILARITY (Levenshtein-based) ─────────────────────────────────────
function editDistance(a: string, b: string): number {
  if (stryMutAct_9fa48("144")) {
    {}
  } else {
    stryCov_9fa48("144");
    const m = a.length,
      n = b.length;
    const dp: number[][] = Array.from(stryMutAct_9fa48("145") ? {} : (stryCov_9fa48("145"), {
      length: stryMutAct_9fa48("146") ? m - 1 : (stryCov_9fa48("146"), m + 1)
    }), stryMutAct_9fa48("147") ? () => undefined : (stryCov_9fa48("147"), (_, i) => Array.from(stryMutAct_9fa48("148") ? {} : (stryCov_9fa48("148"), {
      length: stryMutAct_9fa48("149") ? n - 1 : (stryCov_9fa48("149"), n + 1)
    }), stryMutAct_9fa48("150") ? () => undefined : (stryCov_9fa48("150"), (_, j) => (stryMutAct_9fa48("153") ? i !== 0 : stryMutAct_9fa48("152") ? false : stryMutAct_9fa48("151") ? true : (stryCov_9fa48("151", "152", "153"), i === 0)) ? j : (stryMutAct_9fa48("156") ? j !== 0 : stryMutAct_9fa48("155") ? false : stryMutAct_9fa48("154") ? true : (stryCov_9fa48("154", "155", "156"), j === 0)) ? i : 0))));
    for (let i = 1; stryMutAct_9fa48("159") ? i > m : stryMutAct_9fa48("158") ? i < m : stryMutAct_9fa48("157") ? false : (stryCov_9fa48("157", "158", "159"), i <= m); stryMutAct_9fa48("160") ? i-- : (stryCov_9fa48("160"), i++)) for (let j = 1; stryMutAct_9fa48("163") ? j > n : stryMutAct_9fa48("162") ? j < n : stryMutAct_9fa48("161") ? false : (stryCov_9fa48("161", "162", "163"), j <= n); stryMutAct_9fa48("164") ? j-- : (stryCov_9fa48("164"), j++)) dp[i][j] = (stryMutAct_9fa48("167") ? a[i - 1] !== b[j - 1] : stryMutAct_9fa48("166") ? false : stryMutAct_9fa48("165") ? true : (stryCov_9fa48("165", "166", "167"), a[stryMutAct_9fa48("168") ? i + 1 : (stryCov_9fa48("168"), i - 1)] === b[stryMutAct_9fa48("169") ? j + 1 : (stryCov_9fa48("169"), j - 1)])) ? dp[stryMutAct_9fa48("170") ? i + 1 : (stryCov_9fa48("170"), i - 1)][stryMutAct_9fa48("171") ? j + 1 : (stryCov_9fa48("171"), j - 1)] : stryMutAct_9fa48("172") ? 1 - Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) : (stryCov_9fa48("172"), 1 + (stryMutAct_9fa48("173") ? Math.max(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) : (stryCov_9fa48("173"), Math.min(dp[stryMutAct_9fa48("174") ? i + 1 : (stryCov_9fa48("174"), i - 1)][j], dp[i][stryMutAct_9fa48("175") ? j + 1 : (stryCov_9fa48("175"), j - 1)], dp[stryMutAct_9fa48("176") ? i + 1 : (stryCov_9fa48("176"), i - 1)][stryMutAct_9fa48("177") ? j + 1 : (stryCov_9fa48("177"), j - 1)]))));
    return dp[m][n];
  }
}
function similarityScore(a: string, b: string): number {
  if (stryMutAct_9fa48("178")) {
    {}
  } else {
    stryCov_9fa48("178");
    if (stryMutAct_9fa48("181") ? !a || !b : stryMutAct_9fa48("180") ? false : stryMutAct_9fa48("179") ? true : (stryCov_9fa48("179", "180", "181"), (stryMutAct_9fa48("182") ? a : (stryCov_9fa48("182"), !a)) && (stryMutAct_9fa48("183") ? b : (stryCov_9fa48("183"), !b)))) return 1;
    if (stryMutAct_9fa48("186") ? a.length > 1500 && b.length > 1500 : stryMutAct_9fa48("185") ? false : stryMutAct_9fa48("184") ? true : (stryCov_9fa48("184", "185", "186"), (stryMutAct_9fa48("189") ? a.length <= 1500 : stryMutAct_9fa48("188") ? a.length >= 1500 : stryMutAct_9fa48("187") ? false : (stryCov_9fa48("187", "188", "189"), a.length > 1500)) || (stryMutAct_9fa48("192") ? b.length <= 1500 : stryMutAct_9fa48("191") ? b.length >= 1500 : stryMutAct_9fa48("190") ? false : (stryCov_9fa48("190", "191", "192"), b.length > 1500)))) return (stryMutAct_9fa48("195") ? a !== b : stryMutAct_9fa48("194") ? false : stryMutAct_9fa48("193") ? true : (stryCov_9fa48("193", "194", "195"), a === b)) ? 1 : 0;
    const maxLen = stryMutAct_9fa48("196") ? Math.min(a.length, b.length) : (stryCov_9fa48("196"), Math.max(a.length, b.length));
    if (stryMutAct_9fa48("199") ? maxLen !== 0 : stryMutAct_9fa48("198") ? false : stryMutAct_9fa48("197") ? true : (stryCov_9fa48("197", "198", "199"), maxLen === 0)) return 1;
    return stryMutAct_9fa48("200") ? 1 + editDistance(a, b) / maxLen : (stryCov_9fa48("200"), 1 - (stryMutAct_9fa48("201") ? editDistance(a, b) * maxLen : (stryCov_9fa48("201"), editDistance(a, b) / maxLen)));
  }
}

// ── FRAMEWORK DETECTION ───────────────────────────────────────────────────────
export function getComponentName(el: Element): string | null {
  if (stryMutAct_9fa48("202")) {
    {}
  } else {
    stryCov_9fa48("202");
    if (stryMutAct_9fa48("205") ? el.hasAttribute("data-reactroot") && el.closest("[data-reactroot]") : stryMutAct_9fa48("204") ? false : stryMutAct_9fa48("203") ? true : (stryCov_9fa48("203", "204", "205"), el.hasAttribute(stryMutAct_9fa48("206") ? "" : (stryCov_9fa48("206"), "data-reactroot")) || el.closest(stryMutAct_9fa48("207") ? "" : (stryCov_9fa48("207"), "[data-reactroot]")))) return stryMutAct_9fa48("208") ? "" : (stryCov_9fa48("208"), "ReactComponent");
    const keys = Object.keys(el as any);
    if (stryMutAct_9fa48("211") ? keys.every(k => k.startsWith("__reactFiber") || k.startsWith("__reactInternalInstance")) : stryMutAct_9fa48("210") ? false : stryMutAct_9fa48("209") ? true : (stryCov_9fa48("209", "210", "211"), keys.some(stryMutAct_9fa48("212") ? () => undefined : (stryCov_9fa48("212"), k => stryMutAct_9fa48("215") ? k.startsWith("__reactFiber") && k.startsWith("__reactInternalInstance") : stryMutAct_9fa48("214") ? false : stryMutAct_9fa48("213") ? true : (stryCov_9fa48("213", "214", "215"), (stryMutAct_9fa48("216") ? k.endsWith("__reactFiber") : (stryCov_9fa48("216"), k.startsWith(stryMutAct_9fa48("217") ? "" : (stryCov_9fa48("217"), "__reactFiber")))) || (stryMutAct_9fa48("218") ? k.endsWith("__reactInternalInstance") : (stryCov_9fa48("218"), k.startsWith(stryMutAct_9fa48("219") ? "" : (stryCov_9fa48("219"), "__reactInternalInstance"))))))))) return stryMutAct_9fa48("220") ? "" : (stryCov_9fa48("220"), "ReactComponent");
    if (stryMutAct_9fa48("223") ? (el as any).__vue_app__ && keys.some(k => k.startsWith("__vue")) : stryMutAct_9fa48("222") ? false : stryMutAct_9fa48("221") ? true : (stryCov_9fa48("221", "222", "223"), (el as any).__vue_app__ || (stryMutAct_9fa48("224") ? keys.every(k => k.startsWith("__vue")) : (stryCov_9fa48("224"), keys.some(stryMutAct_9fa48("225") ? () => undefined : (stryCov_9fa48("225"), k => stryMutAct_9fa48("226") ? k.endsWith("__vue") : (stryCov_9fa48("226"), k.startsWith(stryMutAct_9fa48("227") ? "" : (stryCov_9fa48("227"), "__vue"))))))))) return stryMutAct_9fa48("228") ? "" : (stryCov_9fa48("228"), "VueComponent");
    if (stryMutAct_9fa48("231") ? ((el as any).__ngContext__ || el.hasAttribute("ng-version")) && el.closest("[ng-version]") : stryMutAct_9fa48("230") ? false : stryMutAct_9fa48("229") ? true : (stryCov_9fa48("229", "230", "231"), (stryMutAct_9fa48("233") ? (el as any).__ngContext__ && el.hasAttribute("ng-version") : stryMutAct_9fa48("232") ? false : (stryCov_9fa48("232", "233"), (el as any).__ngContext__ || el.hasAttribute(stryMutAct_9fa48("234") ? "" : (stryCov_9fa48("234"), "ng-version")))) || el.closest(stryMutAct_9fa48("235") ? "" : (stryCov_9fa48("235"), "[ng-version]")))) return stryMutAct_9fa48("236") ? "" : (stryCov_9fa48("236"), "AngularComponent");
    // Svelte: components leave a __svelte property on the DOM node
    if (stryMutAct_9fa48("239") ? keys.every(k => k.startsWith("__svelte")) : stryMutAct_9fa48("238") ? false : stryMutAct_9fa48("237") ? true : (stryCov_9fa48("237", "238", "239"), keys.some(stryMutAct_9fa48("240") ? () => undefined : (stryCov_9fa48("240"), k => stryMutAct_9fa48("241") ? k.endsWith("__svelte") : (stryCov_9fa48("241"), k.startsWith(stryMutAct_9fa48("242") ? "" : (stryCov_9fa48("242"), "__svelte"))))))) return stryMutAct_9fa48("243") ? "" : (stryCov_9fa48("243"), "SvelteComponent");
    // SolidJS: leaves _$owner on reactive nodes
    if (stryMutAct_9fa48("246") ? (el as any)._$owner === undefined : stryMutAct_9fa48("245") ? false : stryMutAct_9fa48("244") ? true : (stryCov_9fa48("244", "245", "246"), (el as any)._$owner !== undefined)) return stryMutAct_9fa48("247") ? "" : (stryCov_9fa48("247"), "SolidComponent");
    return null;
  }
}
export function getCssPath(el: Element): string {
  if (stryMutAct_9fa48("248")) {
    {}
  } else {
    stryCov_9fa48("248");
    if (stryMutAct_9fa48("250") ? false : stryMutAct_9fa48("249") ? true : (stryCov_9fa48("249", "250"), el.hasAttribute(stryMutAct_9fa48("251") ? "" : (stryCov_9fa48("251"), "data-testid")))) return stryMutAct_9fa48("252") ? `` : (stryCov_9fa48("252"), `[data-testid="${el.getAttribute(stryMutAct_9fa48("253") ? "" : (stryCov_9fa48("253"), "data-testid"))}"]`);
    if (stryMutAct_9fa48("255") ? false : stryMutAct_9fa48("254") ? true : (stryCov_9fa48("254", "255"), el.id)) return stryMutAct_9fa48("256") ? `` : (stryCov_9fa48("256"), `#${el.id}`);
    const parent = el.parentElement;
    if (stryMutAct_9fa48("259") ? false : stryMutAct_9fa48("258") ? true : stryMutAct_9fa48("257") ? parent : (stryCov_9fa48("257", "258", "259"), !parent)) return stryMutAct_9fa48("260") ? el.tagName.toUpperCase() : (stryCov_9fa48("260"), el.tagName.toLowerCase());
    const siblings = Array.from(parent.children);
    const index = stryMutAct_9fa48("261") ? siblings.indexOf(el) - 1 : (stryCov_9fa48("261"), siblings.indexOf(el) + 1);
    return stryMutAct_9fa48("262") ? `` : (stryCov_9fa48("262"), `${getCssPath(parent)} > ${stryMutAct_9fa48("263") ? el.tagName.toUpperCase() : (stryCov_9fa48("263"), el.tagName.toLowerCase())}:nth-child(${index})`);
  }
}
export function classifyAttributeMismatch(attrName: string, serverVal: string, clientVal: string): {
  severity: Severity;
  reason: string;
} {
  if (stryMutAct_9fa48("264")) {
    {}
  } else {
    stryCov_9fa48("264");
    for (const {
      pattern,
      label
    } of SECRET_PATTERNS) {
      if (stryMutAct_9fa48("265")) {
        {}
      } else {
        stryCov_9fa48("265");
        if (stryMutAct_9fa48("268") ? pattern.test(serverVal) && pattern.test(clientVal) : stryMutAct_9fa48("267") ? false : stryMutAct_9fa48("266") ? true : (stryCov_9fa48("266", "267", "268"), pattern.test(serverVal) || pattern.test(clientVal))) {
          if (stryMutAct_9fa48("269")) {
            {}
          } else {
            stryCov_9fa48("269");
            return stryMutAct_9fa48("270") ? {} : (stryCov_9fa48("270"), {
              severity: stryMutAct_9fa48("271") ? "" : (stryCov_9fa48("271"), "security"),
              reason: stryMutAct_9fa48("272") ? `` : (stryCov_9fa48("272"), `Potential ${label} exposed in attribute`)
            });
          }
        }
      }
    }
    if (stryMutAct_9fa48("275") ? attrName.startsWith("aria-") && attrName === "role" : stryMutAct_9fa48("274") ? false : stryMutAct_9fa48("273") ? true : (stryCov_9fa48("273", "274", "275"), (stryMutAct_9fa48("276") ? attrName.endsWith("aria-") : (stryCov_9fa48("276"), attrName.startsWith(stryMutAct_9fa48("277") ? "" : (stryCov_9fa48("277"), "aria-")))) || (stryMutAct_9fa48("279") ? attrName !== "role" : stryMutAct_9fa48("278") ? false : (stryCov_9fa48("278", "279"), attrName === (stryMutAct_9fa48("280") ? "" : (stryCov_9fa48("280"), "role")))))) {
      if (stryMutAct_9fa48("281")) {
        {}
      } else {
        stryCov_9fa48("281");
        return stryMutAct_9fa48("282") ? {} : (stryCov_9fa48("282"), {
          severity: stryMutAct_9fa48("283") ? "" : (stryCov_9fa48("283"), "critical"),
          reason: stryMutAct_9fa48("284") ? "" : (stryCov_9fa48("284"), "Accessibility attribute mismatch may break screen readers")
        });
      }
    }
    if (stryMutAct_9fa48("287") ? attrName === "src" && attrName === "href" : stryMutAct_9fa48("286") ? false : stryMutAct_9fa48("285") ? true : (stryCov_9fa48("285", "286", "287"), (stryMutAct_9fa48("289") ? attrName !== "src" : stryMutAct_9fa48("288") ? false : (stryCov_9fa48("288", "289"), attrName === (stryMutAct_9fa48("290") ? "" : (stryCov_9fa48("290"), "src")))) || (stryMutAct_9fa48("292") ? attrName !== "href" : stryMutAct_9fa48("291") ? false : (stryCov_9fa48("291", "292"), attrName === (stryMutAct_9fa48("293") ? "" : (stryCov_9fa48("293"), "href")))))) {
      if (stryMutAct_9fa48("294")) {
        {}
      } else {
        stryCov_9fa48("294");
        const isCacheBust = stryMutAct_9fa48("297") ? /[?&](v|version|hash|t|ts|cb)=/.test(serverVal) && /[?&](v|version|hash|t|ts|cb)=/.test(clientVal) : stryMutAct_9fa48("296") ? false : stryMutAct_9fa48("295") ? true : (stryCov_9fa48("295", "296", "297"), (stryMutAct_9fa48("298") ? /[^?&](v|version|hash|t|ts|cb)=/ : (stryCov_9fa48("298"), /[?&](v|version|hash|t|ts|cb)=/)).test(serverVal) || (stryMutAct_9fa48("299") ? /[^?&](v|version|hash|t|ts|cb)=/ : (stryCov_9fa48("299"), /[?&](v|version|hash|t|ts|cb)=/)).test(clientVal));
        if (stryMutAct_9fa48("301") ? false : stryMutAct_9fa48("300") ? true : (stryCov_9fa48("300", "301"), isCacheBust)) return stryMutAct_9fa48("302") ? {} : (stryCov_9fa48("302"), {
          severity: stryMutAct_9fa48("303") ? "" : (stryCov_9fa48("303"), "info"),
          reason: stryMutAct_9fa48("304") ? "" : (stryCov_9fa48("304"), "Cache-busting parameter differs (expected)")
        });
      }
    }
    if (stryMutAct_9fa48("307") ? isTimestampValue(serverVal) && isTimestampValue(clientVal) : stryMutAct_9fa48("306") ? false : stryMutAct_9fa48("305") ? true : (stryCov_9fa48("305", "306", "307"), isTimestampValue(serverVal) || isTimestampValue(clientVal))) {
      if (stryMutAct_9fa48("308")) {
        {}
      } else {
        stryCov_9fa48("308");
        return stryMutAct_9fa48("309") ? {} : (stryCov_9fa48("309"), {
          severity: stryMutAct_9fa48("310") ? "" : (stryCov_9fa48("310"), "info"),
          reason: stryMutAct_9fa48("311") ? "" : (stryCov_9fa48("311"), "Timestamp or date value differs between SSR and CSR (expected)")
        });
      }
    }
    return stryMutAct_9fa48("312") ? {} : (stryCov_9fa48("312"), {
      severity: stryMutAct_9fa48("313") ? "" : (stryCov_9fa48("313"), "warning"),
      reason: stryMutAct_9fa48("314") ? `` : (stryCov_9fa48("314"), `Attribute '${attrName}' differs between SSR and CSR`)
    });
  }
}
const IGNORED_TAGS = new Set(stryMutAct_9fa48("315") ? [] : (stryCov_9fa48("315"), [stryMutAct_9fa48("316") ? "" : (stryCov_9fa48("316"), "script"), stryMutAct_9fa48("317") ? "" : (stryCov_9fa48("317"), "style"), stryMutAct_9fa48("318") ? "" : (stryCov_9fa48("318"), "noscript"), stryMutAct_9fa48("319") ? "" : (stryCov_9fa48("319"), "link")]));
const IGNORED_SRC_PATTERNS = stryMutAct_9fa48("320") ? [] : (stryCov_9fa48("320"), [/_next\/static/, /__webpack/, stryMutAct_9fa48("322") ? /chunk\.[^a-z0-9]+\.js/ : stryMutAct_9fa48("321") ? /chunk\.[a-z0-9]\.js/ : (stryCov_9fa48("321", "322"), /chunk\.[a-z0-9]+\.js/)]);

// ── SHARED NODE PROCESSOR ─────────────────────────────────────────────────────
// Single implementation used by both sync and async detectors to keep behaviour
// identical and avoid the DFS-order divergence that existed before this fix.
function processNode(serverEl: Element, clientEl: Element | null, depth: number, options: Required<DetectOptions>, push: (m: Mismatch) => void): Array<{
  serverEl: Element;
  clientEl: Element | null;
  depth: number;
}> {
  if (stryMutAct_9fa48("323")) {
    {}
  } else {
    stryCov_9fa48("323");
    if (stryMutAct_9fa48("326") ? (!clientEl || depth > options.maxDepth) && IGNORED_TAGS.has(serverEl.tagName.toLowerCase()) : stryMutAct_9fa48("325") ? false : stryMutAct_9fa48("324") ? true : (stryCov_9fa48("324", "325", "326"), (stryMutAct_9fa48("328") ? !clientEl && depth > options.maxDepth : stryMutAct_9fa48("327") ? false : (stryCov_9fa48("327", "328"), (stryMutAct_9fa48("329") ? clientEl : (stryCov_9fa48("329"), !clientEl)) || (stryMutAct_9fa48("332") ? depth <= options.maxDepth : stryMutAct_9fa48("331") ? depth >= options.maxDepth : stryMutAct_9fa48("330") ? false : (stryCov_9fa48("330", "331", "332"), depth > options.maxDepth)))) || IGNORED_TAGS.has(stryMutAct_9fa48("333") ? serverEl.tagName.toUpperCase() : (stryCov_9fa48("333"), serverEl.tagName.toLowerCase())))) return stryMutAct_9fa48("334") ? ["Stryker was here"] : (stryCov_9fa48("334"), []);
    const componentName = getComponentName(clientEl);

    // Text mismatch
    if (stryMutAct_9fa48("337") ? false : stryMutAct_9fa48("336") ? true : stryMutAct_9fa48("335") ? options.securityOnly : (stryCov_9fa48("335", "336", "337"), !options.securityOnly)) {
      if (stryMutAct_9fa48("338")) {
        {}
      } else {
        stryCov_9fa48("338");
        const serverText = stryMutAct_9fa48("340") ? Array.from(serverEl.childNodes).map(n => n.textContent?.trim() ?? "").join("").trim() : stryMutAct_9fa48("339") ? Array.from(serverEl.childNodes).filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent?.trim() ?? "").join("") : (stryCov_9fa48("339", "340"), Array.from(serverEl.childNodes).filter(stryMutAct_9fa48("341") ? () => undefined : (stryCov_9fa48("341"), n => stryMutAct_9fa48("344") ? n.nodeType !== Node.TEXT_NODE : stryMutAct_9fa48("343") ? false : stryMutAct_9fa48("342") ? true : (stryCov_9fa48("342", "343", "344"), n.nodeType === Node.TEXT_NODE))).map(stryMutAct_9fa48("345") ? () => undefined : (stryCov_9fa48("345"), n => stryMutAct_9fa48("346") ? n.textContent?.trim() && "" : (stryCov_9fa48("346"), (stryMutAct_9fa48("348") ? n.textContent.trim() : stryMutAct_9fa48("347") ? n.textContent : (stryCov_9fa48("347", "348"), n.textContent?.trim())) ?? (stryMutAct_9fa48("349") ? "Stryker was here!" : (stryCov_9fa48("349"), ""))))).join(stryMutAct_9fa48("350") ? "Stryker was here!" : (stryCov_9fa48("350"), "")).trim());
        const clientText = stryMutAct_9fa48("352") ? Array.from(clientEl.childNodes).map(n => n.textContent?.trim() ?? "").join("").trim() : stryMutAct_9fa48("351") ? Array.from(clientEl.childNodes).filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent?.trim() ?? "").join("") : (stryCov_9fa48("351", "352"), Array.from(clientEl.childNodes).filter(stryMutAct_9fa48("353") ? () => undefined : (stryCov_9fa48("353"), n => stryMutAct_9fa48("356") ? n.nodeType !== Node.TEXT_NODE : stryMutAct_9fa48("355") ? false : stryMutAct_9fa48("354") ? true : (stryCov_9fa48("354", "355", "356"), n.nodeType === Node.TEXT_NODE))).map(stryMutAct_9fa48("357") ? () => undefined : (stryCov_9fa48("357"), n => stryMutAct_9fa48("358") ? n.textContent?.trim() && "" : (stryCov_9fa48("358"), (stryMutAct_9fa48("360") ? n.textContent.trim() : stryMutAct_9fa48("359") ? n.textContent : (stryCov_9fa48("359", "360"), n.textContent?.trim())) ?? (stryMutAct_9fa48("361") ? "Stryker was here!" : (stryCov_9fa48("361"), ""))))).join(stryMutAct_9fa48("362") ? "Stryker was here!" : (stryCov_9fa48("362"), "")).trim());
        if (stryMutAct_9fa48("365") ? serverText && clientText || serverText !== clientText : stryMutAct_9fa48("364") ? false : stryMutAct_9fa48("363") ? true : (stryCov_9fa48("363", "364", "365"), (stryMutAct_9fa48("367") ? serverText || clientText : stryMutAct_9fa48("366") ? true : (stryCov_9fa48("366", "367"), serverText && clientText)) && (stryMutAct_9fa48("369") ? serverText === clientText : stryMutAct_9fa48("368") ? true : (stryCov_9fa48("368", "369"), serverText !== clientText)))) {
          if (stryMutAct_9fa48("370")) {
            {}
          } else {
            stryCov_9fa48("370");
            const score = similarityScore(serverText, clientText);
            if (stryMutAct_9fa48("374") ? score >= options.similarityThreshold : stryMutAct_9fa48("373") ? score <= options.similarityThreshold : stryMutAct_9fa48("372") ? false : stryMutAct_9fa48("371") ? true : (stryCov_9fa48("371", "372", "373", "374"), score < options.similarityThreshold)) {
              if (stryMutAct_9fa48("375")) {
                {}
              } else {
                stryCov_9fa48("375");
                const fix = getFix(componentName, stryMutAct_9fa48("376") ? "" : (stryCov_9fa48("376"), "Text content mismatch"));
                push(stryMutAct_9fa48("377") ? {} : (stryCov_9fa48("377"), {
                  selector: getCssPath(clientEl),
                  serverText,
                  clientText,
                  severity: stryMutAct_9fa48("378") ? "" : (stryCov_9fa48("378"), "critical"),
                  severityReason: stryMutAct_9fa48("379") ? "" : (stryCov_9fa48("379"), "Text content mismatch"),
                  componentName,
                  advice: fix.advice,
                  fixSnippet: fix.snippet,
                  similarityScore: stryMutAct_9fa48("380") ? Math.round(score * 100) * 100 : (stryCov_9fa48("380"), Math.round(stryMutAct_9fa48("381") ? score / 100 : (stryCov_9fa48("381"), score * 100)) / 100)
                }));
              }
            }
          }
        }
      }
    }

    // Attribute mismatches
    for (const attr of Array.from(serverEl.attributes)) {
      if (stryMutAct_9fa48("382")) {
        {}
      } else {
        stryCov_9fa48("382");
        const serverVal = attr.value;
        const clientVal = clientEl.getAttribute(attr.name);
        if (stryMutAct_9fa48("385") ? clientVal === null && serverVal === clientVal : stryMutAct_9fa48("384") ? false : stryMutAct_9fa48("383") ? true : (stryCov_9fa48("383", "384", "385"), (stryMutAct_9fa48("387") ? clientVal !== null : stryMutAct_9fa48("386") ? false : (stryCov_9fa48("386", "387"), clientVal === null)) || (stryMutAct_9fa48("389") ? serverVal !== clientVal : stryMutAct_9fa48("388") ? false : (stryCov_9fa48("388", "389"), serverVal === clientVal)))) continue;
        if (stryMutAct_9fa48("391") ? false : stryMutAct_9fa48("390") ? true : (stryCov_9fa48("390", "391"), isFrameworkInternalAttr(attr.name))) continue;
        if (stryMutAct_9fa48("394") ? attr.name === "src" || IGNORED_SRC_PATTERNS.some(p => p.test(serverVal)) : stryMutAct_9fa48("393") ? false : stryMutAct_9fa48("392") ? true : (stryCov_9fa48("392", "393", "394"), (stryMutAct_9fa48("396") ? attr.name !== "src" : stryMutAct_9fa48("395") ? true : (stryCov_9fa48("395", "396"), attr.name === (stryMutAct_9fa48("397") ? "" : (stryCov_9fa48("397"), "src")))) && (stryMutAct_9fa48("398") ? IGNORED_SRC_PATTERNS.every(p => p.test(serverVal)) : (stryCov_9fa48("398"), IGNORED_SRC_PATTERNS.some(stryMutAct_9fa48("399") ? () => undefined : (stryCov_9fa48("399"), p => p.test(serverVal))))))) continue;
        const {
          severity,
          reason
        } = classifyAttributeMismatch(attr.name, serverVal, clientVal);
        if (stryMutAct_9fa48("402") ? options.securityOnly || severity !== "security" : stryMutAct_9fa48("401") ? false : stryMutAct_9fa48("400") ? true : (stryCov_9fa48("400", "401", "402"), options.securityOnly && (stryMutAct_9fa48("404") ? severity === "security" : stryMutAct_9fa48("403") ? true : (stryCov_9fa48("403", "404"), severity !== (stryMutAct_9fa48("405") ? "" : (stryCov_9fa48("405"), "security")))))) continue;
        const fix = getFix(componentName, reason);
        push(stryMutAct_9fa48("406") ? {} : (stryCov_9fa48("406"), {
          selector: getCssPath(clientEl),
          serverText: stryMutAct_9fa48("407") ? "Stryker was here!" : (stryCov_9fa48("407"), ""),
          clientText: stryMutAct_9fa48("408") ? "Stryker was here!" : (stryCov_9fa48("408"), ""),
          serverAttrValue: serverVal,
          attributeName: attr.name,
          severity,
          severityReason: reason,
          componentName,
          advice: fix.advice,
          fixSnippet: fix.snippet
        }));
      }
    }

    // Return children in forward order (consistent left-to-right DFS for both sync & async)
    const serverChildren = Array.from(serverEl.children);
    const clientChildren = Array.from(clientEl.children);
    return serverChildren.map(stryMutAct_9fa48("409") ? () => undefined : (stryCov_9fa48("409"), (sc, i) => stryMutAct_9fa48("410") ? {} : (stryCov_9fa48("410"), {
      serverEl: sc,
      clientEl: stryMutAct_9fa48("411") ? clientChildren[i] && null : (stryCov_9fa48("411"), clientChildren[i] ?? null),
      depth: stryMutAct_9fa48("412") ? depth - 1 : (stryCov_9fa48("412"), depth + 1)
    })));
  }
}

// ── SYNC DETECTOR ─────────────────────────────────────────────────────────────
export function detectMismatches(serverHTML: string, clientDoc: Document, options: DetectOptions = {}): Mismatch[] {
  if (stryMutAct_9fa48("413")) {
    {}
  } else {
    stryCov_9fa48("413");
    const opts: Required<DetectOptions> = stryMutAct_9fa48("414") ? {} : (stryCov_9fa48("414"), {
      maxDepth: stryMutAct_9fa48("415") ? options.maxDepth && Infinity : (stryCov_9fa48("415"), options.maxDepth ?? Infinity),
      similarityThreshold: stryMutAct_9fa48("416") ? options.similarityThreshold && 0.6 : (stryCov_9fa48("416"), options.similarityThreshold ?? 0.6),
      securityOnly: stryMutAct_9fa48("417") ? options.securityOnly && false : (stryCov_9fa48("417"), options.securityOnly ?? (stryMutAct_9fa48("418") ? true : (stryCov_9fa48("418"), false)))
    });
    const parser = new DOMParser();
    const serverDoc = parser.parseFromString(serverHTML, stryMutAct_9fa48("419") ? "" : (stryCov_9fa48("419"), "text/html"));
    const mismatches: Mismatch[] = stryMutAct_9fa48("420") ? ["Stryker was here"] : (stryCov_9fa48("420"), []);
    function walk(serverEl: Element, clientEl: Element | null, depth: number) {
      if (stryMutAct_9fa48("421")) {
        {}
      } else {
        stryCov_9fa48("421");
        const children = processNode(serverEl, clientEl, depth, opts, stryMutAct_9fa48("422") ? () => undefined : (stryCov_9fa48("422"), m => mismatches.push(m)));
        for (const child of children) walk(child.serverEl, child.clientEl, child.depth);
      }
    }
    walk(serverDoc.documentElement, clientDoc.documentElement, 0);
    return mismatches;
  }
}

// ── ASYNC YIELDING DETECTOR ───────────────────────────────────────────────────
export async function detectMismatchesAsync(serverHTML: string, clientDoc: Document, options: DetectOptions = {}): Promise<Mismatch[]> {
  if (stryMutAct_9fa48("423")) {
    {}
  } else {
    stryCov_9fa48("423");
    const opts: Required<DetectOptions> = stryMutAct_9fa48("424") ? {} : (stryCov_9fa48("424"), {
      maxDepth: stryMutAct_9fa48("425") ? options.maxDepth && Infinity : (stryCov_9fa48("425"), options.maxDepth ?? Infinity),
      similarityThreshold: stryMutAct_9fa48("426") ? options.similarityThreshold && 0.6 : (stryCov_9fa48("426"), options.similarityThreshold ?? 0.6),
      securityOnly: stryMutAct_9fa48("427") ? options.securityOnly && false : (stryCov_9fa48("427"), options.securityOnly ?? (stryMutAct_9fa48("428") ? true : (stryCov_9fa48("428"), false)))
    });
    const parser = new DOMParser();
    const serverDoc = parser.parseFromString(serverHTML, stryMutAct_9fa48("429") ? "" : (stryCov_9fa48("429"), "text/html"));
    const mismatches: Mismatch[] = stryMutAct_9fa48("430") ? ["Stryker was here"] : (stryCov_9fa48("430"), []);

    // Stack stores work items; children are pushed in reverse so pop() gives left-to-right order
    const stack: {
      serverEl: Element;
      clientEl: Element | null;
      depth: number;
    }[] = stryMutAct_9fa48("431") ? [] : (stryCov_9fa48("431"), [stryMutAct_9fa48("432") ? {} : (stryCov_9fa48("432"), {
      serverEl: serverDoc.documentElement,
      clientEl: clientDoc.documentElement,
      depth: 0
    })]);
    let lastYield = performance.now();
    while (stryMutAct_9fa48("435") ? stack.length <= 0 : stryMutAct_9fa48("434") ? stack.length >= 0 : stryMutAct_9fa48("433") ? false : (stryCov_9fa48("433", "434", "435"), stack.length > 0)) {
      if (stryMutAct_9fa48("436")) {
        {}
      } else {
        stryCov_9fa48("436");
        // Yield before processing each node so the threshold applies per-node, not per-batch
        if (stryMutAct_9fa48("440") ? performance.now() - lastYield <= 15 : stryMutAct_9fa48("439") ? performance.now() - lastYield >= 15 : stryMutAct_9fa48("438") ? false : stryMutAct_9fa48("437") ? true : (stryCov_9fa48("437", "438", "439", "440"), (stryMutAct_9fa48("441") ? performance.now() + lastYield : (stryCov_9fa48("441"), performance.now() - lastYield)) > 15)) {
          if (stryMutAct_9fa48("442")) {
            {}
          } else {
            stryCov_9fa48("442");
            await new Promise<void>(stryMutAct_9fa48("443") ? () => undefined : (stryCov_9fa48("443"), r => setTimeout(r, 0)));
            lastYield = performance.now();
          }
        }
        const current = stack.pop()!;
        const children = processNode(current.serverEl, current.clientEl, current.depth, opts, stryMutAct_9fa48("444") ? () => undefined : (stryCov_9fa48("444"), m => mismatches.push(m)));

        // Push in reverse so that stack.pop() processes left-to-right (same order as sync walk)
        for (let i = stryMutAct_9fa48("445") ? children.length + 1 : (stryCov_9fa48("445"), children.length - 1); stryMutAct_9fa48("448") ? i < 0 : stryMutAct_9fa48("447") ? i > 0 : stryMutAct_9fa48("446") ? false : (stryCov_9fa48("446", "447", "448"), i >= 0); stryMutAct_9fa48("449") ? i++ : (stryCov_9fa48("449"), i--)) {
          if (stryMutAct_9fa48("450")) {
            {}
          } else {
            stryCov_9fa48("450");
            stack.push(children[i]);
          }
        }
      }
    }
    return mismatches;
  }
}