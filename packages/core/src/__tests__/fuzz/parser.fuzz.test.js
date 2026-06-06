import { describe, it } from "vitest";
import fc from "fast-check";
describe("Fuzzing: DOM Parser & Similarity Engine", () => {
    it("never crashes on highly nested, randomized malformed HTML", () => {
        fc.assert(fc.property(fc.string(), (randomString) => {
            // TODO: Pass randomString into HTML parser
            // expect(parseHTML(randomString)).not.toThrow();
        }), { numRuns: 1000 });
    });
    it("similarity engine never throws NaN or exceptions for bizarre unicode/emoji strings", () => {
        fc.assert(fc.property(fc.unicodeString(), fc.unicodeString(), (str1, str2) => {
            // TODO: calculateSimilarity(str1, str2)
            // expect result to be >= 0 and <= 1
        }), { numRuns: 1000 });
    });
});
//# sourceMappingURL=parser.fuzz.test.js.map