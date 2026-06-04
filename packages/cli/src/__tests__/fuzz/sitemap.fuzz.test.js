import { describe, it } from "vitest";
import fc from "fast-check";
describe("Fuzzing: CLI Sitemap XML Parser", () => {
    it("gracefully handles completely randomized or corrupted XML structures", () => {
        fc.assert(fc.property(fc.string(), (corruptXml) => {
            // TODO: pass corruptXml to parseSitemap()
            // expect it to return an empty array or throw a handled parsing error, NOT crash the process
        }), { numRuns: 500 });
    });
});
//# sourceMappingURL=sitemap.fuzz.test.js.map