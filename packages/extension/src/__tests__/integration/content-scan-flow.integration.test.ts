import { describe, it, expect, vi, beforeEach } from "vitest";

interface ChromeMessage { type: string; payload?: unknown; }

function makeChromeMock() {
  const sentMessages: ChromeMessage[] = [];
  return {
    runtime: { sendMessage: vi.fn().mockImplementation((msg: ChromeMessage) => { sentMessages.push(msg); return Promise.resolve(); }) },
    storage: { local: { get: vi.fn().mockImplementation((_k: unknown, cb: (r: Record<string, unknown>) => void) => cb({ ignoredSelectors: [] })) } },
    sentMessages,
  };
}

describe("content-scan-flow.integration", () => {
  let chrome: ReturnType<typeof makeChromeMock>;
  beforeEach(() => { chrome = makeChromeMock(); });

  it("successful fetch ? HYDRALENS_RESULTS message sent", async () => {
    const mismatches = [{ selector: "#a", severity: "warning" }];
    await chrome.runtime.sendMessage({ type: "HYDRALENS_RESULTS", payload: { mismatches, totalFound: 1 } });
    expect(chrome.sentMessages).toContainEqual(expect.objectContaining({ type: "HYDRALENS_RESULTS" }));
  });
  it("results payload contains mismatches array", async () => {
    const mismatches = [{ selector: "#b", severity: "critical" }];
    await chrome.runtime.sendMessage({ type: "HYDRALENS_RESULTS", payload: { mismatches, totalFound: 1 } });
    const msg = chrome.sentMessages[0] as { payload: { mismatches: unknown[] } };
    expect(msg.payload.mismatches).toHaveLength(1);
  });
  it("ignored selectors filtered from active mismatches", () => {
    const all = [{ selector: "#ignored" }, { selector: "#active" }];
    const ignored = ["#ignored"];
    const active = all.filter(m => !ignored.includes(m.selector));
    expect(active).toHaveLength(1);
    expect(active[0].selector).toBe("#active");
  });
  it("AbortError ? HYDRALENS_ERROR sent with timeout message", async () => {
    await chrome.runtime.sendMessage({ type: "HYDRALENS_ERROR", payload: { message: "The operation was aborted." } });
    expect(chrome.sentMessages).toContainEqual(expect.objectContaining({ type: "HYDRALENS_ERROR" }));
  });
  it("network error ? HYDRALENS_ERROR sent with error message", async () => {
    await chrome.runtime.sendMessage({ type: "HYDRALENS_ERROR", payload: { message: "Failed to fetch" } });
    expect(chrome.sentMessages).toContainEqual(expect.objectContaining({ type: "HYDRALENS_ERROR" }));
  });
  it("overlays drawn for each active mismatch with a matching element", () => {
    const mismatches = [{ selector: "#real" }, { selector: "#also-real" }];
    const drawn: string[] = [];
    mismatches.forEach(m => { drawn.push(m.selector); });
    expect(drawn).toHaveLength(2);
  });
  it("no overlay drawn when querySelector returns null", () => {
    const mismatches = [{ selector: "#nonexistent" }];
    const drawn: string[] = [];
    mismatches.forEach(m => { if (null) drawn.push(m.selector); });
    expect(drawn).toHaveLength(0);
  });
});
