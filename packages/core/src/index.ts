export type Severity = "critical" | "warning" | "info" | "security";

export interface Mismatch {
  selector: string;
  serverText: string;
  clientText: string;
  attributeName?: string;
  severity: Severity;
  severityReason: string;
  componentName: string | null;
  advice: string;
  fixSnippet: string; // NEW: Added fixSnippet
}

const ADVICE_DATABASE: Record<string, Record<string, { advice: string, snippet: string }>> = {
  "ReactComponent": {
    "text-mismatch": {
      advice: "State mismatch detected. Ensure you are using 'useEffect' to set initial client state only AFTER mounting.",
      snippet: "const [isClient, setIsClient] = useState(false);\nuseEffect(() => setIsClient(true), []);\nreturn <div>{isClient ? clientValue : serverValue}</div>;"
    },
    "attribute-mismatch": {
      advice: "Use 'suppressHydrationWarning' if this dynamic attribute is intended.",
      snippet: "<div suppressHydrationWarning={true} className={dynamicClass} />"
    }
  }
};

export function getFix(componentName: string | null, reason: string): { advice: string, snippet: string } {
  const fallback = { advice: "Review your initialization logic.", snippet: "// No specific snippet available." };
  if (!componentName || !ADVICE_DATABASE[componentName]) return fallback;
  
  const type = reason.includes("Text") ? "text-mismatch" : "attribute-mismatch";
  return ADVICE_DATABASE[componentName][type] || fallback;
}

// בתוך הפונקציה detectMismatches, נשתמש בזה:
// const fix = getFix(componentName, reason);
// mismatches.push({ ..., advice: fix.advice, fixSnippet: fix.snippet });
