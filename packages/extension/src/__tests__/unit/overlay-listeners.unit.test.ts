import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We simulate the overlay listener management logic from content.ts
// since the actual module has side-effects on import. We test the behavior pattern.

interface OverlayHandle {
  element: HTMLElement;
  onScroll: () => void;
  onResize: () => void;
  resizeObserver: { disconnect: () => void };
}

function makeOverlayManager() {
  const handles: OverlayHandle[] = [];

  function drawOverlay(selector: string): OverlayHandle {
    const onScroll = vi.fn();
    const onResize = vi.fn();
    const resizeObserver = { disconnect: vi.fn() };
    const element = document.createElement("div");
    element.setAttribute("data-selector", selector);

    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);

    const handle: OverlayHandle = { element, onScroll, onResize, resizeObserver };
    handles.push(handle);
    return handle;
  }

  function clearOverlays() {
    for (const h of handles) {
      window.removeEventListener("scroll", h.onScroll);
      window.removeEventListener("resize", h.onResize);
      h.resizeObserver.disconnect();
    }
    handles.length = 0;
  }

  return { drawOverlay, clearOverlays, handles };
}

describe("overlay-listeners", () => {
  let manager: ReturnType<typeof makeOverlayManager>;

  beforeEach(() => {
    manager = makeOverlayManager();
  });

  afterEach(() => {
    manager.clearOverlays();
  });

  it("drawOverlay adds scroll listener to window", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    manager.drawOverlay("#test");
    expect(addSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
    addSpy.mockRestore();
  });

  it("drawOverlay adds resize listener to window", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    manager.drawOverlay("#test");
    expect(addSpy).toHaveBeenCalledWith("resize", expect.any(Function));
    addSpy.mockRestore();
  });

  it("clearOverlays removes all scroll listeners", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    manager.drawOverlay("#a");
    manager.drawOverlay("#b");
    manager.clearOverlays();
    const scrollCalls = removeSpy.mock.calls.filter(([event]) => event === "scroll");
    expect(scrollCalls.length).toBe(2);
    removeSpy.mockRestore();
  });

  it("clearOverlays removes all resize listeners", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    manager.drawOverlay("#a");
    manager.drawOverlay("#b");
    manager.clearOverlays();
    const resizeCalls = removeSpy.mock.calls.filter(([event]) => event === "resize");
    expect(resizeCalls.length).toBe(2);
    removeSpy.mockRestore();
  });

  it("multiple overlays → all listeners cleaned on clear", () => {
    manager.drawOverlay("#x");
    manager.drawOverlay("#y");
    manager.drawOverlay("#z");
    expect(manager.handles).toHaveLength(3);
    manager.clearOverlays();
    expect(manager.handles).toHaveLength(0);
  });

  it("ResizeObserver is disconnected on clear", () => {
    const h1 = manager.drawOverlay("#a");
    const h2 = manager.drawOverlay("#b");
    manager.clearOverlays();
    expect(h1.resizeObserver.disconnect).toHaveBeenCalledOnce();
    expect(h2.resizeObserver.disconnect).toHaveBeenCalledOnce();
  });
});
