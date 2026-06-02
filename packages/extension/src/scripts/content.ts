import { detectMismatches, type Mismatch, type Severity } from "@hydra-lens/core";

const overlayElements: HTMLElement[] = [];
const resizeObservers: ResizeObserver[] = [];
let isScanning = false;

function clearOverlays(): void {
  overlayElements.forEach((el) => el.remove());
  overlayElements.length = 0;
  resizeObservers.forEach((ro) => ro.disconnect());
  resizeObservers.length = 0;
}

const SEVERITY_STYLE: Record<Severity, { border: string; bg: string; label: string }> = {
  security: { border: "#ef4444", bg: "rgba(239,68,68,0.20)",  label: "SECURITY" },
  critical: { border: "#f97316", bg: "rgba(249,115,22,0.15)", label: "CRITICAL" },
  warning:  { border: "#eab308", bg: "rgba(234,179,8,0.15)",  label: "WARNING"  },
  info:     { border: "#3b82f6", bg: "rgba(59,130,246,0.15)", label: "INFO"     },
};

function drawOverlay(element: HTMLElement, mismatch: Mismatch): void {
  const style = SEVERITY_STYLE[mismatch.severity];

  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed; pointer-events: none; z-index: 2147483647;
    border: 2px dashed ${style.border}; background: ${style.bg};
    box-sizing: border-box; transition: top 0.1s, left 0.1s, width 0.1s, height 0.1s;
  `;

  const tooltip = document.createElement("div");
  tooltip.style.cssText = `
    position: absolute; bottom: calc(100% + 4px); left: 0;
    background: #111827; color: #fff; padding: 3px 8px;
    font-size: 11px; font-family: monospace; white-space: nowrap;
    border-left: 3px solid ${style.border}; border-radius: 0 3px 3px 0;
  `;
  tooltip.textContent = `[${style.label}] <${mismatch.componentName || "element"}>`;

  overlay.appendChild(tooltip);
  document.documentElement.appendChild(overlay);
  overlayElements.push(overlay);

  function reposition() {
    const rect = element.getBoundingClientRect();
    overlay.style.top    = `${rect.top    - 2}px`;
    overlay.style.left   = `${rect.left   - 2}px`;
    overlay.style.width  = `${rect.width  + 4}px`;
    overlay.style.height = `${rect.height + 4}px`;
  }

  reposition();
  window.addEventListener("scroll", reposition, { passive: true });
  window.addEventListener("resize", reposition, { passive: true });

  const ro = new ResizeObserver(reposition);
  ro.observe(element);
  resizeObservers.push(ro);
}

async function runHydraLens(): Promise<void> {
  if (isScanning) {
    console.log("[HydraLens] Scan already in progress.");
    return;
  }
  isScanning = true;
  clearOverlays();

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(window.location.href, {
      cache: "no-store",
      signal: controller.signal,
    });
    const serverHTML = await response.text();
    clearTimeout(timeoutId);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const allMismatches = detectMismatches(serverHTML, document);

    chrome.storage.local.get(["ignoredSelectors"], (res) => {
      const ignored: string[] = res.ignoredSelectors ?? [];
      const activeMismatches  = allMismatches.filter((m) => !ignored.includes(m.selector));

      chrome.runtime.sendMessage({
        type: "HYDRALENS_RESULTS",
        payload: { mismatches: activeMismatches, totalFound: allMismatches.length },
      }).catch(() => {});

      activeMismatches.forEach((mismatch) => {
        const clientEl = document.querySelector(mismatch.selector) as HTMLElement | null;
        if (clientEl) drawOverlay(clientEl, mismatch);
      });
    });
  } catch (error: any) {
    // R: forward error to DevTools panel
    const message = error.name === "AbortError"
      ? "Fetch timed out (6s). The server may be too slow or streaming infinitely."
      : error.message ?? "Unknown error during scan.";

    console.error("[HydraLens]", message);
    chrome.runtime.sendMessage({ type: "HYDRALENS_ERROR", payload: { message } }).catch(() => {});
  } finally {
    clearTimeout(timeoutId);
    setTimeout(() => { isScanning = false; }, 2000);
  }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "HYDRALENS_RUN")   runHydraLens();
  if (msg.type === "HYDRALENS_CLEAR") { clearOverlays(); isScanning = false; }
});
