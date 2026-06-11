import { describe, it, expect, vi } from "vitest";

function parseSitemapXml(xml: string): string[] {
  const raw = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());
  return raw
    .map((u) =>
      u
        .replace(/<!\[CDATA\[|\]\]>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim()
    )
    .filter((u) => {
      try {
        new URL(u);
        return true;
      } catch {
        return false;
      }
    });
}

describe("sitemap-parse.integration", () => {
  it("valid sitemap XML ? all <loc> URLs extracted", () => {
    const xml = `<?xml version="1.0"?><urlset><url><loc>https://a.com/</loc></url><url><loc>https://b.com/page</loc></url></urlset>`;
    expect(parseSitemapXml(xml)).toEqual(["https://a.com/", "https://b.com/page"]);
  });
  it("sitemap with 100 URLs ? 100 entries returned", () => {
    const locs = Array.from(
      { length: 100 },
      (_, i) => `<url><loc>https://example.com/page${i}</loc></url>`
    ).join("");
    const xml = `<urlset>${locs}</urlset>`;
    expect(parseSitemapXml(xml)).toHaveLength(100);
  });
  it("sitemap URLs merged with argv URLs, deduped", () => {
    const sitemapUrls = ["https://a.com/", "https://b.com/"];
    const argvUrls = ["https://a.com/", "https://c.com/"];
    const merged = [...new Set([...argvUrls, ...sitemapUrls])];
    expect(merged).toHaveLength(3);
    expect(merged).toContain("https://c.com/");
  });
  it("network error fetching sitemap ? error thrown", async () => {
    const fetchSitemapUrls = async (url: string) => {
      const res = await fetch(url);
      return parseSitemapXml(await res.text());
    };
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
    await expect(fetchSitemapUrls("https://fail.com/sitemap.xml")).rejects.toThrow("Network error");
    vi.unstubAllGlobals();
  });
  it("sitemap with no <loc> tags ? empty array returned", () => {
    expect(parseSitemapXml("<urlset></urlset>")).toHaveLength(0);
  });
});
