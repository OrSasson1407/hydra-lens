import { chromium } from "playwright";
import { detectMismatches } from "@hydra-lens/core";
import * as fs   from "fs";
import * as path from "path";

// ?? Arg parsing ???????????????????????????????????????????????????????????????
const args = process.argv.slice(2);

function getFlag(name: string): string | undefined {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : undefined;
}
function hasFlag(name: string): boolean { return args.includes(name); }

const urlArgs       = args.filter((a) => a.startsWith("http"));
const outputFile    = getFlag("--output");
const thresholdArg  = getFlag("--threshold") ?? "critical";
const securityOnly  = hasFlag("--security-only");
const sitemapUrl    = getFlag("--sitemap");

const THRESHOLD_LEVELS: Record<string, string[]> = {
  security:  ["security"],
  critical:  ["security", "critical"],
  warning:   ["security", "critical", "warning"],
  info:      ["security", "critical", "warning", "info"],
};
const failSeverities = THRESHOLD_LEVELS[thresholdArg] ?? THRESHOLD_LEVELS["critical"];

// ?? Core bundle path ??????????????????????????????????????????????????????????
function getCoreBundlePath(): string {
  const candidates = [
    path.resolve(__dirname, "../../core/dist/index.global.js"),
    path.resolve(__dirname, "../node_modules/@hydra-lens/core/dist/index.global.js"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("Could not find @hydra-lens/core bundle. Run `pnpm build:core` first.");
}

// ?? Sitemap parser ????????????????????????????????????????????????????????????
async function fetchSitemapUrls(sitemapUrl: string): Promise<string[]> {
  const res  = await fetch(sitemapUrl);
  const text = await res.text();
  const matches = [...text.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map((m) => m[1].trim());
}

// ?? Single page scan ??????????????????????????????????????????????????????????
interface ScanResult {
  url: string;
  mismatches: any[];
  durationMs: number;
  error?: string;
}

async function scanPage(url: string, coreBundle: string): Promise<ScanResult> {
  const browser = await chromium.launch();
  const page    = await browser.newPage();
  const start   = Date.now();

  try {
    const response   = await page.request.get(url);
    const serverHTML = await response.text();

    await page.addInitScript({ content: coreBundle });
    await page.goto(url, { waitUntil: "networkidle" });

    const mismatches = await page.evaluate(
      ({ html, secOnly }: { html: string; secOnly: boolean }) => {
        // @ts-ignore
        return window.__hydraLens.detectMismatches(html, document, { securityOnly: secOnly });
      },
      { html: serverHTML, secOnly: securityOnly }
    );

    return { url, mismatches, durationMs: Date.now() - start };
  } catch (e: any) {
    return { url, mismatches: [], durationMs: Date.now() - start, error: e.message };
  } finally {
    await browser.close();
  }
}

// ?? Main ??????????????????????????????????????????????????????????????????????
async function main() {
  console.log("[HydraLens] Headless scanner starting...");
  if (securityOnly)  console.log("[HydraLens] Mode: security-only");
  if (thresholdArg)  console.log(`[HydraLens] Fail threshold: ${thresholdArg}+`);

  const coreBundle = fs.readFileSync(getCoreBundlePath(), "utf-8");

  // M: collect URLs — direct args, or from sitemap
  let urls = urlArgs.length > 0 ? urlArgs : ["http://localhost:3000"];
  if (sitemapUrl) {
    console.log(`[HydraLens] Fetching sitemap: ${sitemapUrl}`);
    const sitemapUrls = await fetchSitemapUrls(sitemapUrl);
    urls = [...new Set([...urls, ...sitemapUrls])];
    console.log(`[HydraLens] Found ${sitemapUrls.length} URLs in sitemap.`);
  }

  console.log(`[HydraLens] Scanning ${urls.length} URL(s)...\n`);

  const allResults: ScanResult[] = [];

  for (const url of urls) {
    process.stdout.write(`  Scanning ${url} ... `);
    const result = await scanPage(url, coreBundle);
    allResults.push(result);

    if (result.error) {
      console.log(`ERROR: ${result.error}`);
    } else {
      const failures = result.mismatches.filter((m: any) => failSeverities.includes(m.severity));
      console.log(`${result.mismatches.length} issues (${failures.length} blocking) in ${result.durationMs}ms`);
    }
  }

  // Summary table
  console.log("\n========== SCAN SUMMARY ==========");
  console.log(`${"URL".padEnd(50)} | Issues | Blocking`);
  console.log(`${"-".repeat(50)}-+--------+---------`);
  allResults.forEach((r) => {
    const blocking = r.mismatches.filter((m: any) => failSeverities.includes(m.severity)).length;
    console.log(`${r.url.slice(0, 50).padEnd(50)} | ${String(r.mismatches.length).padEnd(6)} | ${blocking}`);
  });

  const totalIssues   = allResults.reduce((s, r) => s + r.mismatches.length, 0);
  const totalBlocking = allResults.reduce((s, r) => s + r.mismatches.filter((m: any) => failSeverities.includes(m.severity)).length, 0);
  console.log(`\nTotal: ${totalIssues} issues, ${totalBlocking} blocking across ${urls.length} URL(s).`);

  // K: write JSON report
  if (outputFile) {
    fs.writeFileSync(outputFile, JSON.stringify(allResults, null, 2), "utf-8");
    console.log(`\n[HydraLens] Report written to: ${outputFile}`);
  }

  if (totalBlocking > 0) {
    console.error(`\n[HydraLens] FAILED: ${totalBlocking} issue(s) at or above threshold '${thresholdArg}'.`);
    process.exit(1);
  } else {
    console.log(`\n[HydraLens] PASSED: No blocking issues found.`);
    process.exit(0);
  }
}

main().catch((e) => { console.error("[HydraLens] Fatal:", e); process.exit(1); });

