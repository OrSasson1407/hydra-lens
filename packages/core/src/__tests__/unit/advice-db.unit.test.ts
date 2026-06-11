import { describe, it, expect } from "vitest";
import { getFix } from "../../index";

describe("advice-db", () => {
  it("getFix returns correct React text-mismatch advice", () => {
    const { advice } = getFix("ReactComponent", "Text content mismatch");
    expect(advice).toContain("useEffect");
  });

  it("getFix returns correct Vue attribute-mismatch advice", () => {
    const { advice } = getFix("VueComponent", "attribute differs");
    expect(advice).toContain("v-if");
  });

  it("getFix returns Svelte advice for SvelteComponent", () => {
    const { advice } = getFix("SvelteComponent", "Text content mismatch");
    expect(advice).toContain("onMount");
  });

  it("getFix returns Solid advice for SolidComponent", () => {
    const { advice } = getFix("SolidComponent", "Text content mismatch");
    expect(advice).toContain("createEffect");
  });

  it("getFix falls back to Unknown for unrecognised framework", () => {
    const { advice } = getFix("SomeUnknownFramework", "Text content mismatch");
    expect(typeof advice).toBe("string");
    expect(advice.length).toBeGreaterThan(0);
  });

  it("null componentName → Unknown bucket", () => {
    const { advice } = getFix(null, "Text content mismatch");
    expect(advice).toContain("dates");
  });

  it('reason containing "text" → text-mismatch key', () => {
    const react = getFix("ReactComponent", "Text content mismatch");
    expect(react.advice).toContain("useEffect");
  });

  it('reason without "text" → attribute-mismatch key', () => {
    const react = getFix("ReactComponent", "Attribute href differs");
    expect(react.advice).toContain("suppressHydrationWarning");
  });
});
