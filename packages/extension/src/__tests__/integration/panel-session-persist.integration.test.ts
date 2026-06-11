import { describe, it, expect, vi, beforeEach } from "vitest";

// Simulates the panel's session storage integration for persisting scan results

interface ScanResult {
  mismatches: { selector: string; severity: string }[];
  totalFound: number;
  timestamp: number;
}

function makeSessionStore() {
  const store: Record<string, unknown> = {};
  return {
    set: vi.fn((items: Record<string, unknown>) => { Object.assign(store, items); return Promise.resolve(); }),
    get: vi.fn((keys: string[]) => {
      const result: Record<string, unknown> = {};
      for (const k of keys) result[k] = store[k];
      return Promise.resolve(result);
    }),
    _store: store,
  };
}

describe("panel-session-persist.integration", () => {
  let session: ReturnType<typeof makeSessionStore>;

  beforeEach(() => { session = makeSessionStore(); });

  it("scan results are saved to session storage on HYDRALENS_RESULTS", async () => {
    const result: ScanResult = { mismatches: [{ selector: "#a", severity: "warning" }], totalFound: 1, timestamp: Date.now() };
    await session.set({ lastScanResult: result });
    expect(session.set).toHaveBeenCalledWith(expect.objectContaining({ lastScanResult: result }));
  });

  it("panel restores last scan result from session on load", async () => {
    const saved: ScanResult = { mismatches: [{ selector: "#b", severity: "critical" }], totalFound: 1, timestamp: 1234 };
    await session.set({ lastScanResult: saved });
    const result = await session.get(["lastScanResult"]);
    expect(result.lastScanResult).toEqual(saved);
  });

  it("empty session → panel shows no persisted results", async () => {
    const result = await session.get(["lastScanResult"]);
    expect(result.lastScanResult).toBeUndefined();
  });

  it("new scan overwrites previous session result", async () => {
    const first: ScanResult = { mismatches: [], totalFound: 0, timestamp: 1000 };
    const second: ScanResult = { mismatches: [{ selector: "#c", severity: "info" }], totalFound: 1, timestamp: 2000 };
    await session.set({ lastScanResult: first });
    await session.set({ lastScanResult: second });
    const result = await session.get(["lastScanResult"]);
    expect((result.lastScanResult as ScanResult).timestamp).toBe(2000);
  });

  it("totalFound count is preserved in session", async () => {
    const result: ScanResult = { mismatches: [], totalFound: 7, timestamp: Date.now() };
    await session.set({ lastScanResult: result });
    const stored = await session.get(["lastScanResult"]);
    expect((stored.lastScanResult as ScanResult).totalFound).toBe(7);
  });
});
