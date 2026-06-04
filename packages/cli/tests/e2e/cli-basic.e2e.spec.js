import { test } from "@playwright/test";
test.describe("CLI Basic flow", () => {
    test("CLI exits 0 on clean page (no mismatches)", async () => {
        /* TODO */
    });
    test("CLI exits 1 when security issue found in fixture", async () => {
        /* TODO */
    });
    test('stdout contains "SCAN SUMMARY" table', async () => {
        /* TODO */
    });
    test("stdout shows correct issue count per URL", async () => {
        /* TODO */
    });
    test("stderr contains FAILED message when blocking issues found", async () => {
        /* TODO */
    });
});
//# sourceMappingURL=cli-basic.e2e.spec.js.map