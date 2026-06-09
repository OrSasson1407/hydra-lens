import { describe, it, expect, vi, beforeEach } from "vitest";

function makeStorageMock(initial: Record<string, unknown> = {}) {
  const session = { ...initial };
  const local: { ignoredSelectors: string[] } = { ignoredSelectors: [] };
  return {
    session: {
      get: vi.fn().mockImplementation((_k: unknown, cb: (r: Record<string, unknown>) => void) => cb(session)),
      set: vi.fn().mockImplementation((obj: Record<string, unknown>, cb?: () => void) => { Object.assign(session, obj); cb?.(); }),
    },
    local: {
      get: vi.fn().mockImplementation((_k: unknown, cb: (r: typeof local) => void) => cb(local)),
      set: vi.fn().mockImplementation((obj: Partial<typeof local>, cb?: () => void) => { Object.assign(local, obj); cb?.(); }),
    },
    _session: session,
    _local: local,
  };
}

describe("panel-session-persist.integration", () => {
  let storage: ReturnType<typeof makeStorageMock>;
  beforeEach(() => { storage = makeStorageMock(); });

  it("HYDRALENS_RESULTS message ? saved to storage.session", async () => {
    const mismatches = [{ selector: "#a", severity: "warning" }];
    await new Promise<void>(r => storage.session.set({ hydraLensResults: { mismatches, totalFound: 1 } }, r));
    expect(storage._session.hydraLensResults).toBeDefined();
  });
  it("panel init with stored results ? rendered immediately", async () => {
    storage = makeStorageMock({ hydraLensResults: { mismatches: [{ selector: "#a" }], totalFound: 1 } });
    const result = await new Promise<Record<string, unknown>>(r => storage.session.get(["hydraLensResults"], r));
    expect((result.hydraLensResults as { mismatches: unknown[] }).mismatches).toHaveLength(1);
  });
  it("panel init with empty storage ? no results", async () => {
    const result = await new Promise<Record<string, unknown>>(r => storage.session.get(["hydraLensResults"], r));
    expect(result.hydraLensResults).toBeUndefined();
  });
  it("new scan overwrites old session data", async () => {
    await new Promise<void>(r => storage.session.set({ hydraLensResults: { mismatches: [{ selector: "#old" }] } }, r));
    await new Promise<void>(r => storage.session.set({ hydraLensResults: { mismatches: [{ selector: "#new" }] } }, r));
    const stored = storage._session.hydraLensResults as { mismatches: { selector: string }[] };
    expect(stored.mismatches[0].selector).toBe("#new");
  });
  it("ignore-selector button updates storage.local ignoredSelectors", async () => {
    await new Promise<void>(r => storage.local.set({ ignoredSelectors: ["#ignore-me"] }, r));
    expect(storage._local.ignoredSelectors).toContain("#ignore-me");
  });
});
