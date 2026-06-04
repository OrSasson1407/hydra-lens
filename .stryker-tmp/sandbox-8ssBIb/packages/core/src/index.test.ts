/**
 * @vitest-environment jsdom
 */
// @ts-nocheck

import { describe, it, expect } from "vitest";
import { classifyAttributeMismatch, getComponentName, detectMismatches } from "./index";

describe("Heuristics: classifyAttributeMismatch", () => {
  it("should detect exposed AWS keys as security severity", () => {
    const result = classifyAttributeMismatch("data-key", "AKIAFAKE1234567890XX", "");
    expect(result.severity).toBe("security");
    expect(result.reason).toContain("AWS Access Key");
  });

  it("should detect exposed JWT tokens as security severity", () => {
    const jwt =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ";
    const result = classifyAttributeMismatch("data-token", jwt, "");
    expect(result.severity).toBe("security");
    expect(result.reason).toContain("JWT Token");
  });

  it("should classify ARIA attribute mismatches as critical", () => {
    const result = classifyAttributeMismatch("aria-hidden", "true", "false");
    expect(result.severity).toBe("critical");
    expect(result.reason).toContain("Accessibility");
  });

  it("should ignore cache-busting timestamps on src attributes (info severity)", () => {
    const result = classifyAttributeMismatch("src", "/image.png?v=123", "/image.png?v=456");
    expect(result.severity).toBe("info");
    expect(result.reason).toContain("Cache-busting");
  });

  it("should classify generic attribute mismatches as warning", () => {
    const result = classifyAttributeMismatch("class", "btn-red", "btn-blue");
    expect(result.severity).toBe("warning");
  });

  it("should NOT flag long base64 strings as high-entropy secrets (false positive fix)", () => {
    const base64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const result = classifyAttributeMismatch("src", `data:image/png;base64,${base64}`, "different");
    expect(result.severity).not.toBe("security");
  });
});

describe("Heuristics: getComponentName (Framework Detection)", () => {
  it("should detect React roots", () => {
    const el = document.createElement("div");
    el.setAttribute("data-reactroot", "");
    expect(getComponentName(el)).toBe("ReactComponent");
  });

  it("should detect React internal fibers", () => {
    const el = document.createElement("div");
    (el as any).__reactFiber$x2z = {};
    expect(getComponentName(el)).toBe("ReactComponent");
  });

  it("should detect Vue applications", () => {
    const el = document.createElement("div");
    (el as any).__vue_app__ = {};
    expect(getComponentName(el)).toBe("VueComponent");
  });

  it("should detect Angular contexts", () => {
    const el = document.createElement("div");
    el.setAttribute("ng-version", "15.0.0");
    expect(getComponentName(el)).toBe("AngularComponent");
  });

  it("should detect Svelte components", () => {
    const el = document.createElement("div");
    (el as any).__svelte_meta = {};
    expect(getComponentName(el)).toBe("SvelteComponent");
  });

  it("should detect SolidJS components", () => {
    const el = document.createElement("div");
    (el as any)._$owner = {};
    expect(getComponentName(el)).toBe("SolidComponent");
  });

  it("should return null for vanilla elements", () => {
    const el = document.createElement("div");
    el.className = "vanilla-js";
    expect(getComponentName(el)).toBeNull();
  });
});

describe("detectMismatches (integration)", () => {
  function makeClientDoc(html: string): Document {
    const doc = document.implementation.createHTMLDocument();
    doc.documentElement.innerHTML = html;
    return doc;
  }

  it("flags a text mismatch between server and client", () => {
    const serverHTML = "<html><body><p id='msg'>Hello server</p></body></html>";
    const clientDoc = makeClientDoc("<head></head><body><p id='msg'>Hello client</p></body>");
    const results = detectMismatches(serverHTML, clientDoc);
    expect(results.some((m) => m.severityReason === "Text content mismatch")).toBe(true);
  });

  it("does not flag identical content", () => {
    const serverHTML = "<html><body><p id='msg'>Same text</p></body></html>";
    const clientDoc = makeClientDoc("<head></head><body><p id='msg'>Same text</p></body>");
    const results = detectMismatches(serverHTML, clientDoc);
    expect(results.length).toBe(0);
  });

  it("flags an attribute mismatch", () => {
    const serverHTML = '<html><body><div data-color="red"></div></body></html>';
    const clientDoc = makeClientDoc('<head></head><body><div data-color="blue"></div></body>');
    const results = detectMismatches(serverHTML, clientDoc);
    expect(results.some((m) => m.attributeName === "data-color")).toBe(true);
  });

  it("respects securityOnly option — skips non-security findings", () => {
    const serverHTML = '<html><body><div data-color="red"></div></body></html>';
    const clientDoc = makeClientDoc('<head></head><body><div data-color="blue"></div></body>');
    const results = detectMismatches(serverHTML, clientDoc, { securityOnly: true });
    expect(results.length).toBe(0);
  });

  it("sync and async detectors return the same results in the same order", async () => {
    const { detectMismatchesAsync } = await import("./index");
    const serverHTML =
      '<html><body><p>Server A</p><p>Server B</p><div class="x" data-val="s"></div></body></html>';
    const clientDoc = makeClientDoc(
      '<head></head><body><p>Client A</p><p>Client B</p><div class="x" data-val="c"></div></body>'
    );
    const sync = detectMismatches(serverHTML, clientDoc);
    const async_ = await detectMismatchesAsync(serverHTML, clientDoc);
    expect(sync.map((m) => m.selector)).toEqual(async_.map((m) => m.selector));
    expect(sync.map((m) => m.severityReason)).toEqual(async_.map((m) => m.severityReason));
  });
});
