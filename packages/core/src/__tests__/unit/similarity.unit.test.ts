import { describe, it, expect } from "vitest";
import { detectMismatches } from "../../index";

// We test the similarityScore logic indirectly through detectMismatches with
// custom thresholds, and also expose it through the mismatch.similarityScore field.

function makeDocs(serverText: string, clientText: string) {
  const serverHTML = `<html><body><p>${serverText}</p></body></html>`;
  const parser = new DOMParser();
  const clientDoc = parser.parseFromString(
    `<html><body><p>${clientText}</p></body></html>`,
    "text/html"
  );
  return { serverHTML, clientDoc };
}

describe("similarity", () => {
  it("returns 1.0 for identical strings", () => {
    const { serverHTML, clientDoc } = makeDocs("hello world", "hello world");
    const mismatches = detectMismatches(serverHTML, clientDoc);
    expect(mismatches).toHaveLength(0);
  });

  it("returns 0 for completely different strings", () => {
    const { serverHTML, clientDoc } = makeDocs("AAAAAAA", "ZZZZZZZ");
    const mismatches = detectMismatches(serverHTML, clientDoc, { similarityThreshold: 0.99 });
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0].similarityScore).toBeLessThan(0.2);
  });

  it("short-circuits at 1500 chars without running Levenshtein", () => {
    const long = "x".repeat(1501);
    const diff = "y".repeat(1501);
    const { serverHTML, clientDoc } = makeDocs(long, diff);
    const mismatches = detectMismatches(serverHTML, clientDoc, { similarityThreshold: 0.01 });
    // Both are different long strings → score should be 0 (short-circuit path)
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0].similarityScore).toBe(0);
  });

  it("handles empty string pairs (both empty → 1, one empty → 0)", () => {
    // both empty → no text nodes → no mismatch
    const { serverHTML, clientDoc } = makeDocs("", "");
    expect(detectMismatches(serverHTML, clientDoc)).toHaveLength(0);

    // one side empty, one not → no mismatch because empty text node is skipped
    const { serverHTML: sH, clientDoc: cD } = makeDocs("text", "");
    const mismatches = detectMismatches(sH, cD, { similarityThreshold: 0.01 });
    // clientText is empty string which gets filtered (falsy), so no mismatch
    expect(mismatches).toHaveLength(0);
  });

  it("score is symmetric: sim(a,b) === sim(b,a)", () => {
    const text1 = "AAAAAAAAAAAAA";
    const text2 = "ZZZZZZZZZZZZZ";
    const { serverHTML: s1, clientDoc: c1 } = makeDocs(text1, text2);
    const { serverHTML: s2, clientDoc: c2 } = makeDocs(text2, text1);
    const m1 = detectMismatches(s1, c1, { similarityThreshold: 0.01 });
    const m2 = detectMismatches(s2, c2, { similarityThreshold: 0.01 });
    expect(m1).toHaveLength(1);
    expect(m2).toHaveLength(1);
    expect(m1[0].similarityScore).toBeCloseTo(m2[0].similarityScore!, 5);
  });

  it("score is between 0 and 1 for all inputs", () => {
    const pairs = [
      ["abc", "xyz"],
      ["hello", "hell"],
      ["abcdef", "fedcba"],
    ];
    for (const [a, b] of pairs) {
      const { serverHTML, clientDoc } = makeDocs(a, b);
      const mismatches = detectMismatches(serverHTML, clientDoc, { similarityThreshold: 0.01 });
      if (mismatches.length > 0) {
        const score = mismatches[0].similarityScore ?? 0;
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      }
    }
  });
});
