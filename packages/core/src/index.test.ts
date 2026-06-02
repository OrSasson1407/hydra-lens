import { expect, it, describe } from "vitest";
import {
  getComponentName,
  getCssPath,
  classifyAttributeMismatch,
  detectMismatches,
  getFix,
} from "./index";

// ── getComponentName ──────────────────────────────────────────────────────────
describe("getComponentName", () => {
  it("returns null for plain elements", () => {
    const el = document.createElement("div");
    expect(getComponentName(el)).toBeNull();
  });

  it("detects React via data-reactroot", () => {
    const el = document.createElement("div");
    el.setAttribute("data-reactroot", "");
    expect(getComponentName(el)).toBe("ReactComponent");
  });

  it("detects Vue via __vue_app__ property", () => {
    const el = document.createElement("div");
    (el as any).__vue_app__ = {};
    expect(getComponentName(el)).toBe("VueComponent");
  });

  it("detects Angular via __ngContext__ property", () => {
    const el = document.createElement("div");
    (el as any).__ngContext__ = [];
    expect(getComponentName(el)).toBe("AngularComponent");
  });
});

// ── getCssPath ────────────────────────────────────────────────────────────────
describe("getCssPath", () => {
  it("uses data-testid when available", () => {
    const el = document.createElement("div");
    el.setAttribute("data-testid", "hero-banner");
    expect(getCssPath(el)).toBe('[data-testid="hero-banner"]');
  });

  it("uses id when available", () => {
    const el = document.createElement("div");
    el.id = "main-nav";
    expect(getCssPath(el)).toBe("#main-nav");
  });

  it("generates fallback nth-child paths", () => {
    const parent = document.createElement("div");
    const child1 = document.createElement("p");
    const child2 = document.createElement("p");
    parent.appendChild(child1);
    parent.appendChild(child2);
    expect(getCssPath(child2)).toBe("div > p:nth-child(2)");
  });
});

// ── classifyAttributeMismatch ─────────────────────────────────────────────────
describe("classifyAttributeMismatch", () => {
  it("flags JWT tokens as security", () => {
    const res = classifyAttributeMismatch(
      "data-token",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0",
      ""
    );
    expect(res.severity).toBe("security");
  });

  it("flags AWS keys as security", () => {
    const res = classifyAttributeMismatch("data-key", "AKIAIOSFODNN7EXAMPLE", "");
    expect(res.severity).toBe("security");
  });

  it("flags critical accessibility issues", () => {
    const res = classifyAttributeMismatch("aria-label", "Open", "Close");
    expect(res.severity).toBe("critical");
  });

  it("flags role mismatch as critical", () => {
    const res = classifyAttributeMismatch("role", "button", "link");
    expect(res.severity).toBe("critical");
  });

  it("flags info for cache-busted src", () => {
    const res = classifyAttributeMismatch("src", "image.png?v=123", "image.png?v=456");
    expect(res.severity).toBe("info");
  });

  it("returns warning for standard class mismatch", () => {
    const res = classifyAttributeMismatch("class", "text-red", "text-blue");
    expect(res.severity).toBe("warning");
  });
});

// ── getFix ────────────────────────────────────────────────────────────────────
describe("getFix", () => {
  it("returns React text-mismatch advice", () => {
    const fix = getFix("ReactComponent", "Text content mismatch");
    expect(fix.advice).toContain("useEffect");
    expect(fix.snippet).toContain("useState");
  });

  it("returns React attribute-mismatch advice", () => {
    const fix = getFix("ReactComponent", "Attribute mismatch");
    expect(fix.snippet).toContain("suppressHydrationWarning");
  });

  it("returns Vue advice", () => {
    const fix = getFix("VueComponent", "Text content mismatch");
    expect(fix.advice).toContain("onMounted");
  });

  it("returns Angular advice", () => {
    const fix = getFix("AngularComponent", "Text content mismatch");
    expect(fix.advice).toContain("isPlatformBrowser");
  });

  it("returns fallback for unknown component", () => {
    const fix = getFix(null, "Text content mismatch");
    expect(fix.advice).toBeTruthy();
    expect(fix.snippet).toBeTruthy();
  });

  it("returned fixSnippet is a non-empty string", () => {
    const fix = getFix("ReactComponent", "Text content mismatch");
    expect(typeof fix.snippet).toBe("string");
    expect(fix.snippet.length).toBeGreaterThan(0);
  });
});

// ── detectMismatches ──────────────────────────────────────────────────────────
describe("detectMismatches", () => {
  it("detects text and attribute mismatches", () => {
    const serverHTML = `<div data-testid="container"><h1 class="title">Server</h1><a href="/srv">Link</a></div>`;
    const clientDoc = document.implementation.createHTMLDocument();
    clientDoc.body.innerHTML = `<div data-testid="container"><h1 class="title">Client</h1><a href="/cli">Link</a></div>`;

    const results = detectMismatches(serverHTML, clientDoc);
    expect(results.length).toBeGreaterThan(0);

    const textMismatch = results.find((r) => r.serverText === "Server");
    expect(textMismatch).toBeDefined();
    expect(textMismatch?.advice).toBeTruthy();
    expect(textMismatch?.fixSnippet).toBeTruthy();

    const attrMismatch = results.find((r) => r.attributeName === "href");
    expect(attrMismatch).toBeDefined();
    expect(attrMismatch?.serverAttrValue).toBe("/srv");
  });

  it("ignores internal framework scripts (_next, webpack)", () => {
    const serverHTML = `<script src="/_next/static/chunk.js"></script>`;
    const clientDoc = document.implementation.createHTMLDocument();
    clientDoc.body.innerHTML = `<script src="/_next/static/chunk-different.js"></script>`;
    expect(detectMismatches(serverHTML, clientDoc).length).toBe(0);
  });

  it("returns empty array for identical HTML", () => {
    const html = `<div id="app"><h1>Hello</h1><p class="body">World</p></div>`;
    const clientDoc = document.implementation.createHTMLDocument();
    clientDoc.body.innerHTML = html;
    expect(detectMismatches(html, clientDoc).length).toBe(0);
  });

  it("returns empty array for empty DOM", () => {
    const clientDoc = document.implementation.createHTMLDocument();
    clientDoc.body.innerHTML = "";
    expect(detectMismatches("", clientDoc).length).toBe(0);
  });

  it("ignores <style> and <noscript> tags", () => {
    const serverHTML = `<style>.foo { color: red }</style><noscript>enable js</noscript>`;
    const clientDoc = document.implementation.createHTMLDocument();
    clientDoc.body.innerHTML = `<style>.foo { color: blue }</style><noscript>please enable js</noscript>`;
    expect(detectMismatches(serverHTML, clientDoc).length).toBe(0);
  });

  it("each mismatch has non-empty advice and fixSnippet", () => {
    const serverHTML = `<div data-testid="box"><span>Server text</span></div>`;
    const clientDoc = document.implementation.createHTMLDocument();
    clientDoc.body.innerHTML = `<div data-testid="box"><span>Client text</span></div>`;

    const results = detectMismatches(serverHTML, clientDoc);
    results.forEach((m) => {
      expect(m.advice.length).toBeGreaterThan(0);
      expect(m.fixSnippet.length).toBeGreaterThan(0);
    });
  });
});
