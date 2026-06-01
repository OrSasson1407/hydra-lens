import { expect, it, describe } from "vitest";
import { classifyAttributeMismatch } from "./index";

describe("Security Scanner", () => {
  it("detects JWT tokens in attributes", () => {
    const res = classifyAttributeMismatch("data-auth", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz", "");
    expect(res.severity).toBe("security");
  });
});
