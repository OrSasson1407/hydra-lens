import { describe, it, expect } from "vitest";
import { classifyAttributeMismatch } from "./index";
describe("Security Scanner", () => {
    it("detects JWT tokens in attributes", () => {
        const res = classifyAttributeMismatch("data-auth", "eyJ1234567890.1234567890", "client-val");
        expect(res.severity).toBe("security");
    });
});
//# sourceMappingURL=security.test.js.map