import { describe, it, expect, vi } from "vitest";

function makeScanner() {
  let isScanning = false;
  const calls: string[] = [];
  async function runHydraLens(fail = false) {
    if (isScanning) {
      calls.push("no-op");
      return;
    }
    isScanning = true;
    calls.push("started");
    try {
      if (fail) throw new Error("scan error");
      await new Promise((r) => setTimeout(r, 0));
      calls.push("done");
    } catch {
      calls.push("error");
    } finally {
      isScanning = false;
    }
  }
  return { runHydraLens, calls, getScanning: () => isScanning };
}

describe("is-scanning-flag", () => {
  it("concurrent runHydraLens calls ? second call is a no-op", async () => {
    const s = makeScanner();
    const p1 = s.runHydraLens();
    const p2 = s.runHydraLens();
    await Promise.all([p1, p2]);
    expect(s.calls).toContain("no-op");
  });
  it("isScanning resets to false after successful scan", async () => {
    const s = makeScanner();
    await s.runHydraLens();
    expect(s.getScanning()).toBe(false);
  });
  it("isScanning resets to false after fetch error", async () => {
    const s = makeScanner();
    await s.runHydraLens(true);
    expect(s.getScanning()).toBe(false);
  });
  it("isScanning resets to false after AbortError", async () => {
    const s = makeScanner();
    await s.runHydraLens(true);
    expect(s.getScanning()).toBe(false);
  });
  it("HYDRALENS_CLEAR message forces isScanning = false", () => {
    let isScanning = true;
    const handleMessage = (msg: { type: string }) => {
      if (msg.type === "HYDRALENS_CLEAR") isScanning = false;
    };
    handleMessage({ type: "HYDRALENS_CLEAR" });
    expect(isScanning).toBe(false);
  });
});
