import { describe, it } from "vitest";
describe("classify", () => {
    it("JWT token in server value → security", () => {
        /* TODO */
    });
    it("AWS key in client value → security", () => {
        /* TODO */
    });
    it("Stripe key → security", () => {
        /* TODO */
    });
    it("GitHub PAT → security", () => {
        /* TODO */
    });
    it("Google API key → security", () => {
        /* TODO */
    });
    it("Slack token → security", () => {
        /* TODO */
    });
    it("PEM private key → security", () => {
        /* TODO */
    });
    it("aria-* attribute → critical", () => {
        /* TODO */
    });
    it("role attribute → critical", () => {
        /* TODO */
    });
    it("src with ?v= cache-bust → info", () => {
        /* TODO */
    });
    it("ISO 8601 timestamp value → info", () => {
        /* TODO */
    });
    it("unix epoch (10-digit) → info", () => {
        /* TODO */
    });
    it("generic class attribute → warning", () => {
        /* TODO */
    });
    it("base64 image data-uri → NOT security (regression)", () => {
        /* TODO */
    });
});
//# sourceMappingURL=classify.unit.test.js.map