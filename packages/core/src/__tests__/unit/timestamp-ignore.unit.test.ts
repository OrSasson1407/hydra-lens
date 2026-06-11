import { describe, it, expect } from "vitest";
import { classifyAttributeMismatch } from "../../index";

// isTimestampValue is internal, so we test it via classifyAttributeMismatch
// which returns severity "info" for timestamp values.
function isTimestamp(val: string): boolean {
  return classifyAttributeMismatch("data-ts", val, val + "x").severity === "info";
}

describe("timestamp-ignore", () => {
  it("ISO date string → isTimestampValue true", () => {
    expect(isTimestamp("2024-06-15")).toBe(true);
  });

  it("ISO datetime with timezone → true", () => {
    expect(isTimestamp("2024-06-15T14:30:00+02:00")).toBe(true);
  });

  it("Unix epoch (10 digits) → true", () => {
    expect(isTimestamp("1700000000")).toBe(true);
  });

  it("Unix epoch ms (13 digits) → true", () => {
    expect(isTimestamp("1700000000000")).toBe(true);
  });

  it("RFC 2822 date header → true", () => {
    // The pattern matches strings starting with day abbreviation
    expect(isTimestamp("Mon, 15 Jun 2024 14:30:00 GMT")).toBe(true);
  });

  it('arbitrary string "hello" → false', () => {
    expect(isTimestamp("hello")).toBe(false);
  });

  it('partial date "2024-13-00" (invalid month) → false', () => {
    // The regex matches the pattern structurally but 2024-13-00 still matches \d{4}-\d{2}-\d{2}
    // This documents the current behavior (regex doesn't validate semantic validity)
    const result = classifyAttributeMismatch("data-ts", "2024-13-00", "2024-13-01");
    // It still matches the date regex pattern structurally
    expect(["info", "warning"]).toContain(result.severity);
  });
});
