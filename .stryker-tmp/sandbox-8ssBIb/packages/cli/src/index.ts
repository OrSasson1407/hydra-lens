// @ts-nocheck
﻿import { chromium, Browser } from "playwright";
import { detectMismatches } from "@hydra-lens/core";
import * as fs   from "fs";
import * as path from "path";

// ── Arg parsing ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getFlag(name: string): string | undefined {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : undefined;
}
function hasFlag(name: string): boolean { return args.includes(name); }

const urlArgs      = args.filter((a) => a.startsWith("http"));
const outputFile   = getFlag("--output");
const thresholdArg = getFlag("--threshold") ?? "critical";
const securityOnly = hasFlag("--security-only");
const sitemapUrl   = getFlag("--sitemap");
// FIX: concurrency limit (default 4 parallel pages; override with --concurrency N)
const concurrencyArg = parseInt(getFlag("--concurrency") ?? "4", 10);

const THRESHOLD_LEVELS: Record<string, string[]> = {
  security: ["security"],
  critical: ["security", "critical"],
  warning:  ["security", "critical", "warning"],
  info:     ["security", "critical", "warning", "info"],
};
const failSeverities = THRESHOLD_LEVELS[thresholdArg] ?? THRESHOLD_LEVELS["critical"];

// ── Core bundle path ──────────────────────────────────────────────────────────
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

// ── Sitemap parser ────────────────────────────────────────────────────────────
async function fetchSitemapUrls(url: string): Promise<string[]> {
  const res  = await fetch(url);
  const text = await res.text();
  return [...text.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());
}

// ── Single page scan (uses a shared browser passed in) ───────────────────────
interface ScanResult {
  url: string;
  mismatches: any[];
  durationMs: number;
  error?: string;
}

// FIX: browser is now a parameter — callers share a single instance instead of
//      launching and destroying a new process for every URL in the list.
async function scanPage(url: string, browser: Browser, coreBundle: string): Promise<ScanResult> {
  const page  = await browser.newPage();
  const start = Date.now();
  try {
    const response   = await page.request.get(url);
    const serverHTML = await response.text();
    await page.addInitScript({ content: coreBundle });
    await page.goto(url, { waitUntil: "networkidle" });
    const mismatches = await page.evaluate(
      ({ html, secOnly }: { html: string; secOnly: boolean }) => {
        // 
        return window.__hydraLens.detectMismatches(html, document, { securityOnly: secOnly });
      },
      { html: serverHTML, secOnly: securityOnly }
    );
    return { url, mismatches, durationMs: Date.now() - start };
  } catch (e: any) {
    return { url, mismatches: [], durationMs: Date.now() - start, error: e.message };
  } finally {
    await page.close();
  }
}

// ── Concurrency pool helper ───────────────────────────────────────────────────
// Runs tasks with at most `limit` in flight at once — no external dep needed.
async function pLimit<T>(
  tasks: Array<() => Promise<T>>,
  limit: number
): Promise<T[]> {
  const results: T[]          = new Array(tasks.length);
  let   nextIndex             = 0;

  async function worker(): Promise<void> {
    while (nextIndex < tasks.length) {
      const i = nextIndex++;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log("[HydraLens] Headless scanner starting...");
  if (securityOnly)  console.log("[HydraLens] Mode: security-only");
  if (thresholdArg)  console.log(`[HydraLens] Fail threshold: ${thresholdArg}+`);
  console.log(`[HydraLens] Concurrency: ${concurrencyArg}`);

  const coreBundle = fs.readFileSync(getCoreBundlePath(), "utf-8");

  let urls = urlArgs.length > 0 ? urlArgs : ["http://localhost:3000"];
  if (sitemapUrl) {
    console.log(`[HydraLens] Fetching sitemap: ${sitemapUrl}`);
    const sitemapUrls = await fetchSitemapUrls(sitemapUrl);
    urls = [...new Set([...urls, ...sitemapUrls])];
    console.log(`[HydraLens] Found ${sitemapUrls.length} URLs in sitemap.`);
  }
  console.log(`[HydraLens] Scanning ${urls.length} URL(s)...\n`);

  // FIX: launch ONE browser for the entire run; pages are opened/closed per URL
  const browser = await chromium.launch();

  const tasks = urls.map((url) => async (): Promise<ScanResult> => {
    process.stdout.write(`  Scanning ${url} ... `);
    const result = await scanPage(url, browser, coreBundle);
    if (result.error) {
      console.log(`ERROR: ${result.error}`);
    } else {
      const failures = result.mismatches.filter((m: any) => failSeverities.includes(m.severity));
      console.log(`${result.mismatches.length} issues (${failures.length} blocking) in ${result.durationMs}ms`);
    }
    return result;
  });

  // FIX: run up to `concurrencyArg` scans in parallel instead of sequentially
  const allResults = await pLimit(tasks, concurrencyArg);

  await browser.close();

  // Summary table
  console.log("\n========== SCAN SUMMARY ==========");
  console.log(`${"URL".padEnd(50)} | Issues | Blocking`);
  console.log(`${"-".repeat(50)}-+--------+---------`);
  allResults.forEach((r) => {
    const blocking = r.mismatches.filter((m: any) => failSeverities.includes(m.severity)).length;
    console.log(`${r.url.slice(0, 50).padEnd(50)} | ${String(r.mismatches.length).padEnd(6)} | ${blocking}`);
  });

  const totalIssues   = allResults.reduce((s, r) => s + r.mismatches.length, 0);
  const totalBlocking = allResults.reduce(
    (s, r) => s + r.mismatches.filter((m: any) => failSeverities.includes(m.severity)).length,
    0
  );
  console.log(`\nTotal: ${totalIssues} issues, ${totalBlocking} blocking across ${urls.length} URL(s).`);

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
