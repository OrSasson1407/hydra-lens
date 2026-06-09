import { describe, it, expect } from "vitest";

const THRESHOLD_LEVELS: Record<string, string[]> = {
  security: ["security"],
  critical: ["security", "critical"],
  warning: ["security", "critical", "warning"],
  info: ["security", "critical", "warning", "info"],
};

function parseArgs(argv: string[]) {
  const args = argv;
  const getFlag = (name: string) => { const i = args.indexOf(name); return i !== -1 && args[i+1] ? args[i+1] : undefined; };
  const hasFlag = (name: string) => args.includes(name);
  const urlArgs = args.filter(a => a.startsWith("http"));
  const outputFile = getFlag("--output");
  const thresholdArg = getFlag("--threshold") ?? "critical";
  const securityOnly = hasFlag("--security-only");
  const sitemapUrl = getFlag("--sitemap");
  const concurrencyArg = parseInt(getFlag("--concurrency") ?? "4", 10);
  const failSeverities = THRESHOLD_LEVELS[thresholdArg] ?? THRESHOLD_LEVELS["critical"];
  return { urlArgs, outputFile, thresholdArg, securityOnly, sitemapUrl, concurrencyArg, failSeverities };
}

describe("arg-parsing", () => {
  it("--threshold warning ? failSeverities includes warning", () => {
    const { failSeverities } = parseArgs(["--threshold", "warning"]);
    expect(failSeverities).toContain("warning");
    expect(failSeverities).toContain("critical");
    expect(failSeverities).toContain("security");
  });
  it("--threshold info ? all four levels included", () => {
    const { failSeverities } = parseArgs(["--threshold", "info"]);
    expect(failSeverities).toEqual(["security", "critical", "warning", "info"]);
  });
  it("unknown threshold ? defaults to critical", () => {
    const { failSeverities } = parseArgs(["--threshold", "bogus"]);
    expect(failSeverities).toEqual(["security", "critical"]);
  });
  it("--security-only flag is detected", () => {
    const { securityOnly } = parseArgs(["--security-only"]);
    expect(securityOnly).toBe(true);
  });
  it("--output flag captures next arg as filename", () => {
    const { outputFile } = parseArgs(["--output", "report.json"]);
    expect(outputFile).toBe("report.json");
  });
  it("--concurrency 8 ? concurrencyArg is 8", () => {
    const { concurrencyArg } = parseArgs(["--concurrency", "8"]);
    expect(concurrencyArg).toBe(8);
  });
  it("--sitemap captures URL argument", () => {
    const { sitemapUrl } = parseArgs(["--sitemap", "https://example.com/sitemap.xml"]);
    expect(sitemapUrl).toBe("https://example.com/sitemap.xml");
  });
  it("URL args filtered from argv correctly", () => {
    const { urlArgs } = parseArgs(["https://example.com", "--threshold", "warning", "https://test.com"]);
    expect(urlArgs).toEqual(["https://example.com", "https://test.com"]);
  });
});
