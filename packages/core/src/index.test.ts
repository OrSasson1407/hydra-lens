import { expect, it, describe } from "vitest";
import { getComponentName, getCssPath, classifyAttributeMismatch, detectMismatches } from "./index";

describe("getComponentName", () => {
  it("returns null for plain elements", () => {
    const el = document.createElement("div");
    expect(getComponentName(el)).toBeNull();
  });
});

describe("getCssPath", () => {
  it("uses data-testid when available", () => {
    const el = document.createElement("div");
    el.setAttribute("data-testid", "hero-banner");
    expect(getCssPath(el)).toBe("[data-testid=\"hero-banner\"]");
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

describe("classifyAttributeMismatch", () => {
  it("flags security leaks", () => {
    const res = classifyAttributeMismatch("data-token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ", "");
    expect(res.severity).toBe("security");
  });

  it("flags critical accessibility issues", () => {
    const res = classifyAttributeMismatch("aria-label", "Open", "Close");
    expect(res.severity).toBe("critical");
  });

  it("flags info for cache-busted src", () => {
    const res = classifyAttributeMismatch("src", "image.png?v=123", "image.png?v=456");
    expect(res.severity).toBe("info");
  });

  it("returns warning for standard attributes", () => {
    const res = classifyAttributeMismatch("class", "text-red", "text-blue");
    expect(res.severity).toBe("warning");
  });
});

describe("detectMismatches", () => {
  it("detects text and attribute mismatches", () => {
    const serverHTML = `<div data-testid="container"><h1 class="title">Server</h1><a href="/srv">Link</a></div>`;
    
    const clientDoc = document.implementation.createHTMLDocument();
    clientDoc.body.innerHTML = `<div data-testid="container"><h1 class="title">Client</h1><a href="/cli">Link</a></div>`;
    
    const results = detectMismatches(serverHTML, clientDoc);
    expect(results.length).toBeGreaterThan(0);
    
    // Should find the h1 text mismatch (critical) and 'a' href mismatch
    const textMismatch = results.find(r => r.serverText === "Server");
    expect(textMismatch).toBeDefined();
    
    const attrMismatch = results.find(r => r.attributeName === "href");
    expect(attrMismatch).toBeDefined();
    expect(attrMismatch?.serverAttrValue).toBe("/srv");
  });

  it("ignores internal framework scripts", () => {
    const serverHTML = `<script src="/_next/static/chunk.js"></script>`;
    const clientDoc = document.implementation.createHTMLDocument();
    clientDoc.body.innerHTML = `<script src="/_next/static/chunk-different.js"></script>`;
    
    const results = detectMismatches(serverHTML, clientDoc);
    expect(results.length).toBe(0);
  });
});
