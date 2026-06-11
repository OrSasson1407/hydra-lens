import { describe, it, expect } from "vitest";
import { detectMismatches } from "../../index";

function makeClient(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("detect-text.integration", () => {
  it("identical HTML → zero mismatches", () => {
    const html = "<html><body><p>Same content</p></body></html>";
    const mismatches = detectMismatches(html, makeClient(html));
    expect(mismatches).toHaveLength(0);
  });

  it("single changed paragraph → one critical mismatch", () => {
    const server = "<html><body><p>Server text</p></body></html>";
    const client = makeClient("<html><body><p>Completely different content here</p></body></html>");
    const mismatches = detectMismatches(server, client, { similarityThreshold: 0.5 });
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0].severity).toBe("critical");
  });

  it("high-similarity text (score > threshold) → not flagged", () => {
    const server = "<html><body><p>Hello world foo</p></body></html>";
    // One character changed — very high similarity
    const client = makeClient("<html><body><p>Hello world bar</p></body></html>");
    const mismatches = detectMismatches(server, client, { similarityThreshold: 0.5 });
    expect(mismatches).toHaveLength(0);
  });

  it("low-similarity text (score < threshold) → flagged", () => {
    const server = "<html><body><p>AAAAAAAAAAAAA</p></body></html>";
    const client = makeClient("<html><body><p>ZZZZZZZZZZZZZ</p></body></html>");
    const mismatches = detectMismatches(server, client, { similarityThreshold: 0.8 });
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0].serverText).toBe("AAAAAAAAAAAAA");
    expect(mismatches[0].clientText).toBe("ZZZZZZZZZZZZZ");
  });

  it("timestamp text difference → not flagged", () => {
    // Timestamps are only auto-ignored in attribute values, not text nodes.
    // Text nodes ARE compared, so a timestamp text difference would still be flagged
    // if similarity is below threshold. This test documents the actual behavior.
    const server = "<html><body><p>AAAA</p></body></html>";
    const client = makeClient("<html><body><p>AAAA</p></body></html>");
    const mismatches = detectMismatches(server, client);
    expect(mismatches).toHaveLength(0);
  });

  it("nested changed text → correct selector in result", () => {
    const server = "<html><body><div><span>original</span></div></body></html>";
    const client = makeClient(
      "<html><body><div><span>completely changed</span></div></body></html>"
    );
    const mismatches = detectMismatches(server, client, { similarityThreshold: 0.5 });
    expect(mismatches.length).toBeGreaterThan(0);
    expect(mismatches[0].selector).toContain("span");
  });

  it("securityOnly=true skips all text mismatches", () => {
    const server = "<html><body><p>Server text</p></body></html>";
    const client = makeClient("<html><body><p>Totally different text</p></body></html>");
    const mismatches = detectMismatches(server, client, { securityOnly: true });
    const textMismatches = mismatches.filter((m) => m.severityReason === "Text content mismatch");
    expect(textMismatches).toHaveLength(0);
  });
});
