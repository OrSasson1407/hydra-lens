import { describe, it, expect } from "vitest";
import { classifyAttributeMismatch } from "../../index";

describe("Security: Advanced Token & Key Obfuscation Bypasses", () => {
  it("flags JWTs even if prepended with whitespace or random text", () => {
    const jwt =
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4ifQ";
    const { severity } = classifyAttributeMismatch("data-auth", jwt, "other");
    expect(severity).toBe("security");
  });

  it("flags AWS API keys hidden within JSON stringified attribute payloads", () => {
    const payload = JSON.stringify({ key: "AKIAIOSFODNN7EXAMPLE", region: "us-east-1" });
    const { severity } = classifyAttributeMismatch("data-config", payload, "{}");
    expect(severity).toBe("security");
  });

  it("flags PEM private keys with missing newlines (regex boundary tests)", () => {
    const pem = "-----BEGIN PRIVATE KEY-----MIIEvQIBADANBgkqhkiG9w0BAQEFAASC";
    const { severity } = classifyAttributeMismatch("data-cert", pem, "other");
    expect(severity).toBe("security");
  });

  it("does NOT false-positive on standard uuids or sha256 hashes", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    const sha256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const { severity: s1 } = classifyAttributeMismatch("data-id", uuid, uuid + "x");
    const { severity: s2 } = classifyAttributeMismatch("data-hash", sha256, sha256 + "y");
    expect(s1).not.toBe("security");
    expect(s2).not.toBe("security");
  });

  it("flags Stripe test keys (sk_test_) and live keys (sk_live_)", () => {
    const testKey = "sk_test_UNITTESTFAKEKEY0000000";
    const liveKey = "sk_live_UNITTESTFAKEKEY0000000";
    const { severity: s1 } = classifyAttributeMismatch("data-key", testKey, "other");
    const { severity: s2 } = classifyAttributeMismatch("data-key", liveKey, "other");
    expect(s1).toBe("security");
    expect(s2).toBe("security");
  });
});
