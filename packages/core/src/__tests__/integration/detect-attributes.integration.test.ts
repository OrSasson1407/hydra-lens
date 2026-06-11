import { describe, it, expect } from "vitest";
import { detectMismatches } from "../../index";

function makeClient(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("detect-attributes.integration", () => {
  it("changed class attr → warning mismatch", () => {
    const server = `<html><body><div class="btn-red"></div></body></html>`;
    const client = makeClient(`<html><body><div class="btn-blue"></div></body></html>`);
    const mismatches = detectMismatches(server, client);
    expect(mismatches.some((m) => m.severity === "warning")).toBe(true);
  });

  it("changed aria-hidden → critical mismatch", () => {
    const server = `<html><body><div aria-hidden="true"></div></body></html>`;
    const client = makeClient(`<html><body><div aria-hidden="false"></div></body></html>`);
    const mismatches = detectMismatches(server, client);
    expect(
      mismatches.some((m) => m.severity === "critical" && m.attributeName === "aria-hidden")
    ).toBe(true);
  });

  it("changed aria-label → critical mismatch", () => {
    const server = `<html><body><button aria-label="Close"></button></body></html>`;
    const client = makeClient(`<html><body><button aria-label="Open"></button></body></html>`);
    const mismatches = detectMismatches(server, client);
    expect(
      mismatches.some((m) => m.severity === "critical" && m.attributeName === "aria-label")
    ).toBe(true);
  });

  it("AWS key in data attribute → security mismatch", () => {
    const server = `<html><body><div data-key="AKIAIOSFODNN7EXAMPLE"></div></body></html>`;
    const client = makeClient(
      `<html><body><div data-key="AKIAJSIE27AIIDH34OI2"></div></body></html>`
    );
    const mismatches = detectMismatches(server, client);
    expect(mismatches.some((m) => m.severity === "security")).toBe(true);
  });

  it("framework-internal data-reactid → ignored", () => {
    const server = `<html><body><div data-reactid="1"></div></body></html>`;
    const client = makeClient(`<html><body><div data-reactid="2"></div></body></html>`);
    const mismatches = detectMismatches(server, client);
    expect(mismatches.filter((m) => m.attributeName === "data-reactid")).toHaveLength(0);
  });

  it("webpack chunk src → ignored", () => {
    const server = `<html><body><script src="/chunk.abc123.js"></script></body></html>`;
    const client = makeClient(`<html><body><script src="/chunk.def456.js"></script></body></html>`);
    const mismatches = detectMismatches(server, client);
    expect(mismatches.filter((m) => m.attributeName === "src")).toHaveLength(0);
  });

  it("cache-bust ?v= on src → info only", () => {
    const server = `<html><body><img src="/logo.png?v=1"></body></html>`;
    const client = makeClient(`<html><body><img src="/logo.png?v=2"></body></html>`);
    const mismatches = detectMismatches(server, client);
    const srcMismatch = mismatches.find((m) => m.attributeName === "src");
    expect(srcMismatch?.severity).toBe("info");
  });

  it("attribute removed on client → not flagged (clientVal is null)", () => {
    const server = `<html><body><div data-extra="value"></div></body></html>`;
    const client = makeClient(`<html><body><div></div></body></html>`);
    const mismatches = detectMismatches(server, client);
    // clientVal is null → skipped by the implementation
    expect(mismatches.filter((m) => m.attributeName === "data-extra")).toHaveLength(0);
  });
});
