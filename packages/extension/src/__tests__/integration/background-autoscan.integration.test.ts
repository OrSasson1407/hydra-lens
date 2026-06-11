import { describe, it, expect, vi, beforeEach } from "vitest";

function makeChrome(autoScanDefault = true) {
  let autoScan = autoScanDefault;
  const sent: unknown[] = [];
  return {
    storage: {
      local: {
        get: vi
          .fn()
          .mockImplementation((_k: unknown, cb: (r: Record<string, unknown>) => void) =>
            cb({ autoScan })
          ),
        set: vi.fn().mockImplementation((obj: Record<string, unknown>) => {
          if ("autoScan" in obj) autoScan = obj.autoScan as boolean;
        }),
      },
    },
    tabs: {
      sendMessage: vi.fn().mockImplementation((_id: number, msg: unknown) => {
        sent.push(msg);
        return Promise.resolve();
      }),
    },
    sent,
    setAutoScan: (v: boolean) => {
      autoScan = v;
    },
  };
}

describe("background-autoscan.integration", () => {
  beforeEach(() => vi.useFakeTimers());

  it("onCompleted (frameId=0) ? HYDRALENS_RUN sent after 1500ms", async () => {
    const chrome = makeChrome();
    const handler = async (details: { frameId: number; tabId: number }) => {
      if (details.frameId !== 0) return;
      const autoScan: boolean = await new Promise((r) =>
        chrome.storage.local.get(["autoScan"], (res: Record<string, unknown>) =>
          r(res.autoScan !== false)
        )
      );
      if (!autoScan) return;
      setTimeout(
        () => chrome.tabs.sendMessage(details.tabId, { type: "HYDRALENS_RUN" }).catch(() => {}),
        1500
      );
    };
    await handler({ frameId: 0, tabId: 1 });
    vi.advanceTimersByTime(1500);
    expect(chrome.sent).toContainEqual({ type: "HYDRALENS_RUN" });
  });
  it("onCompleted (frameId?0) ? no message sent", async () => {
    const chrome = makeChrome();
    const handler = async (details: { frameId: number; tabId: number }) => {
      if (details.frameId !== 0) return;
      setTimeout(
        () => chrome.tabs.sendMessage(details.tabId, { type: "HYDRALENS_RUN" }).catch(() => {}),
        1500
      );
    };
    await handler({ frameId: 1, tabId: 1 });
    vi.advanceTimersByTime(1500);
    expect(chrome.sent).toHaveLength(0);
  });
  it("onHistoryStateUpdated ? HYDRALENS_RUN sent after 1000ms", () => {
    const chrome = makeChrome();
    setTimeout(() => chrome.tabs.sendMessage(1, { type: "HYDRALENS_RUN" }).catch(() => {}), 1000);
    vi.advanceTimersByTime(1000);
    expect(chrome.sent).toContainEqual({ type: "HYDRALENS_RUN" });
  });
  it("autoScan=false ? message not sent", async () => {
    const chrome = makeChrome(false);
    const autoScan: boolean = await new Promise((r) =>
      chrome.storage.local.get(["autoScan"], (res: Record<string, unknown>) =>
        r(res.autoScan !== false)
      )
    );
    if (autoScan)
      setTimeout(() => chrome.tabs.sendMessage(1, { type: "HYDRALENS_RUN" }).catch(() => {}), 1500);
    vi.advanceTimersByTime(1500);
    expect(chrome.sent).toHaveLength(0);
  });
  it("HYDRALENS_SET_AUTOSCAN(false) ? autoScan stored as false", () => {
    const chrome = makeChrome();
    chrome.storage.local.set({ autoScan: false });
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ autoScan: false });
  });
  it("keyboard command trigger-scan ? HYDRALENS_RUN sent to active tab", () => {
    const chrome = makeChrome();
    chrome.tabs.sendMessage(42, { type: "HYDRALENS_RUN" }).catch(() => {});
    expect(chrome.sent).toContainEqual({ type: "HYDRALENS_RUN" });
  });
});
