import { describe, it, expect } from "vitest";

describe("advice-db", () => {
  it("getFix returns correct React text-mismatch advice", () => {
    /* TODO */
  });
  it("getFix returns correct Vue attribute-mismatch advice", () => {
    /* TODO */
  });
  it("getFix returns Svelte advice for SvelteComponent", () => {
    /* TODO */
  });
  it("getFix returns Solid advice for SolidComponent", () => {
    /* TODO */
  });
  it("getFix falls back to Unknown for unrecognised framework", () => {
    /* TODO */
  });
  it("null componentName → Unknown bucket", () => {
    /* TODO */
  });
  it('reason containing "text" → text-mismatch key', () => {
    /* TODO */
  });
  it('reason without "text" → attribute-mismatch key', () => {
    /* TODO */
  });
});
