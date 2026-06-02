import { chromium } from "playwright";
import { detectMismatches } from "@hydra-lens/core";
import * as fs from "fs";
import * as path from "path";

// Resolve the compiled core bundle so we inject real, minification-safe code.
// The build system compiles @hydra-lens/core to packages/core/dist/index.js.
// We read it once and inject it as a script tag into every page context.
function getCoreBundlePath(): string {
  const candidates = [
    path.resolve(__dirname, "../../core/dist/index.js"),
    path.resolve(__dirname, "../node_modules/@hydra-lens/core/dist/index.js"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    "Could not find @hydra-lens/core bundle. Run `pnpm build:core` first."
  );
}

async function runScan(url: string) {
  console.log("[HydraLens] Headless scanner starting...");
  console.log(`[HydraLens] Target: ${url}`);

  const coreBundle = fs.readFileSync(getCoreBundlePath(), "utf-8");

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // 1. Fetch raw SSR HTML before any JS runs
    const response = await page.request.get(url);
    const serverHTML = await response.text();

    // 2. Inject the real core bundle into every page context BEFORE navigation
    await page.addInitScript({ content: coreBundle });

    // 3. Navigate and wait for hydration to complete
    await page.goto(url, { waitUntil: "networkidle" });

    // 4. Run detectMismatches inside the page — core is already available
    const mismatches = await page.evaluate((html: string) => {
      // @ts-ignore — injected by addInitScript
      return window.__hydraLens.detectMismatches(html, document);
    }, serverHTML);

    console.log(`\n[HydraLens] Scan complete. Found ${mismatches.length} mismatches.`);

    // Pretty-print a summary table
    if (mismatches.length > 0) {
      console.log("\nSeverity  | Selector");
      console.log("----------|---------");
      (mismatches as any[]).forEach((m) => {
        console.log(`${m.severity.toUpperCase().padEnd(9)} | ${m.selector}`);
      });
      console.log("");
    }

    const criticals = (mismatches as any[]).filter(
      (m) => m.severity === "critical" || m.severity === "security"
    );

    if (criticals.length > 0) {
      console.error(`[HydraLens] FAILED: ${criticals.length} critical/security issue(s) found.`);
      process.exit(1);
    } else {
      console.log("[HydraLens] PASSED: No critical issues found.");
      process.exit(0);
    }
  } catch (e) {
    console.error("[HydraLens] Scan failed:", e);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

const target = process.argv[2] || "http://localhost:3000";
runScan(target);
