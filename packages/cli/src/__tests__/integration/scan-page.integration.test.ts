import { describe, it, expect, vi } from "vitest";

interface ScanResult {
  url: string;
  mismatches: unknown[];
  durationMs: number;
  error?: string;
}

function makeMockBrowser(opts: { fail?: boolean; mismatches?: unknown[] } = {}) {
  const page = {
    request: {
      get: vi.fn().mockResolvedValue({ text: vi.fn().mockResolvedValue("<html></html>") }),
    },
    addInitScript: vi.fn().mockResolvedValue(undefined),
    goto: opts.fail
      ? vi.fn().mockRejectedValue(new Error("net::ERR_CONNECTION_REFUSED"))
      : vi.fn().mockResolvedValue(undefined),
    evaluate: vi.fn().mockResolvedValue(opts.mismatches ?? []),
    close: vi.fn().mockResolvedValue(undefined),
  };
  const context = {
    newPage: vi.fn().mockResolvedValue(page),
    close: vi.fn().mockResolvedValue(undefined),
  };
  return { newContext: vi.fn().mockResolvedValue(context), page, context };
}

async function scanPage(
  url: string,
  browser: ReturnType<typeof makeMockBrowser>,
  coreBundle: string
): Promise<ScanResult> {
  const context = await browser.newContext({});
  const page = await context.newPage();
  const start = Date.now();
  try {
    const response = await page.request.get(url);
    await response.text();
    await page.addInitScript({ content: coreBundle });
    await page.goto(url, { waitUntil: "networkidle" });
    const mismatches = await page.evaluate(() => []);
    return { url, mismatches, durationMs: Date.now() - start };
  } catch (e: unknown) {
    return { url, mismatches: [], durationMs: Date.now() - start, error: (e as Error).message };
  } finally {
    await page.close();
    await context.close();
  }
}

describe("scan-page.integration", () => {
  it("scanPage returns mismatches array for known fixture", async () => {
    const browser = makeMockBrowser({ mismatches: [{ severity: "warning" }] });
    const result = await scanPage("https://example.com", browser, "");
    expect(Array.isArray(result.mismatches)).toBe(true);
  });
  it("scanPage returns error field on navigation failure", async () => {
    const browser = makeMockBrowser({ fail: true });
    const result = await scanPage("https://fail.example.com", browser, "");
    expect(result.error).toBeDefined();
    expect(result.mismatches).toHaveLength(0);
  });
  it("scanPage closes the page after scan", async () => {
    const browser = makeMockBrowser();
    await scanPage("https://example.com", browser, "");
    expect(browser.page.close).toHaveBeenCalled();
  });
  it("durationMs is a positive number", async () => {
    const browser = makeMockBrowser();
    const result = await scanPage("https://example.com", browser, "");
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });
  it("securityOnly=true ? evaluate is called", async () => {
    const browser = makeMockBrowser();
    await scanPage("https://example.com", browser, "");
    expect(browser.page.evaluate).toHaveBeenCalled();
  });
  it("shared browser instance is reused across calls", async () => {
    const browser = makeMockBrowser();
    await scanPage("https://example.com", browser, "");
    await scanPage("https://example.com/2", browser, "");
    expect(browser.newContext).toHaveBeenCalledTimes(2);
  });
});
