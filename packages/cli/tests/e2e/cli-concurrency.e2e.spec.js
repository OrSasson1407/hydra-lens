import { test } from "@playwright/test";
test.describe("CLI Concurrency limits", () => {
    test("--concurrency 1 scans serially and completes", async () => {
        /* TODO */
    });
    test("--concurrency 4 (default) produces same results as --concurrency 1", async () => {
        /* TODO */
    });
    test("4-URL scan with concurrency 4 is faster than concurrency 1", async () => {
        /* TODO */
    });
    test("single browser process is used (verified via process count)", async () => {
        /* TODO */
    });
});
//# sourceMappingURL=cli-concurrency.e2e.spec.js.map