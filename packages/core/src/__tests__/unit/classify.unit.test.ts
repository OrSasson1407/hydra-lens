import { describe, it, expect } from "vitest";
import { classifyAttributeMismatch } from "../../index";

describe("classify", () => {
  it("JWT token in server value → security", () => {
    const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0";
    const { severity } = classifyAttributeMismatch("data-token", jwt, "other");
    expect(severity).toBe("security");
  });

  it("AWS key in client value → security", () => {
    const { severity } = classifyAttributeMismatch("data-key", "AKIAIOSFODNN7EXAMPLE", "other");
    expect(severity).toBe("security");
  });

  it("Stripe key → security", () => {
    const { severity } = classifyAttributeMismatch(
      "data-key",
      "sk_live_UNITTESTFAKEKEY0000000",
      "other"
    );
    expect(severity).toBe("security");
  });

  it("GitHub PAT → security", () => {
    const { severity } = classifyAttributeMismatch(
      "data-token",
      "ghp_abcdefghijklmnopqrstuvwxyzABCDEFGHIJ",
      "other"
    );
    expect(severity).toBe("security");
  });

  it("Google API key → security", () => {
    const { severity } = classifyAttributeMismatch(
      "data-key",
      "AIzaSyDdI0hiBtdy8uDsZjIyFMBnMqfEXAMPLE1",
      "other"
    );
    expect(severity).toBe("security");
  });

  it("Slack token → security", () => {
    const { severity } = classifyAttributeMismatch(
      "data-token",
      "xoxb-UNITTEST-FAKE-TOKEN-NOT-REAL",
      "other"
    );
    expect(severity).toBe("security");
  });

  it("PEM private key → security", () => {
    const { severity } = classifyAttributeMismatch(
      "data-cert",
      "-----BEGIN RSA PRIVATE KEY-----",
      "other"
    );
    expect(severity).toBe("security");
  });

  it("aria-* attribute → critical", () => {
    const { severity, reason } = classifyAttributeMismatch("aria-hidden", "true", "false");
    expect(severity).toBe("critical");
    expect(reason).toContain("Accessibility");
  });

  it("role attribute → critical", () => {
    const { severity } = classifyAttributeMismatch("role", "button", "link");
    expect(severity).toBe("critical");
  });

  it("src with ?v= cache-bust → info", () => {
    const { severity } = classifyAttributeMismatch("src", "/app.js?v=1", "/app.js?v=2");
    expect(severity).toBe("info");
  });

  it("ISO 8601 timestamp value → info", () => {
    const { severity } = classifyAttributeMismatch(
      "data-ts",
      "2024-01-15T10:30:00Z",
      "2024-01-16T10:30:00Z"
    );
    expect(severity).toBe("info");
  });

  it("unix epoch (10-digit) → info", () => {
    const { severity } = classifyAttributeMismatch("data-time", "1700000000", "1700000001");
    expect(severity).toBe("info");
  });

  it("generic class attribute → warning", () => {
    const { severity } = classifyAttributeMismatch("class", "btn-red", "btn-blue");
    expect(severity).toBe("warning");
  });

  it("base64 image data-uri → NOT security (regression)", () => {
    const b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA";
    const { severity } = classifyAttributeMismatch("data-api-key", b64, "other");
    expect(severity).not.toBe("security");
  });
});
