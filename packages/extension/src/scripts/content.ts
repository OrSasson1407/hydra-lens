import { detectMismatches, type Mismatch, type Severity } from "@hydra-lens/core";

const overlayElements: HTMLElement[] = [];
let isScanning = false; // LOCK mechanism

function clearOverlays(): void {
  overlayElements.forEach((el) => el.remove());
  overlayElements.length = 0;
}

const SEVERITY_STYLE: Record<Severity, { border: string; bg: string; icon: string; label: string }> = {
  security: { border: '#ef4444', bg: 'rgba(239,68,68,0.20)', icon: '??', label: 'SECURITY' },
  critical: { border: '#f97316', bg: 'rgba(249,115,22,0.15)', icon: '??', label: 'CRITICAL' },
  warning:  { border: '#eab308', bg: 'rgba(234,179,8,0.15)',  icon: '??', label: 'WARNING'  },
  info:     { border: '#3b82f6', bg: 'rgba(59,130,246,0.15)', icon: '??', label: 'INFO'     },
};

function drawOverlay(element: HTMLElement, mismatch: Mismatch): void {
  const style = SEVERITY_STYLE[mismatch.severity];
  const overlay = document.createElement('div');
  overlay.style.cssText = `position: fixed; pointer-events: none; z-index: 2147483647; border: 2px dashed ${style.border}; background: ${style.bg}; box-sizing: border-box;`;
  
  const tooltip = document.createElement('div');
  tooltip.style.cssText = `position: absolute; bottom: calc(100% + 5px); left: 0; background: #111827; color: #fff; padding: 4px 8px; font-size: 11px; font-family: monospace; white-space: nowrap; border-left: 3px solid ${style.border};`;
  tooltip.textContent = `${style.icon} <${mismatch.componentName || 'div'}>`;
  
  overlay.appendChild(tooltip);
  document.documentElement.appendChild(overlay);
  overlayElements.push(overlay);

  function reposition() {
    const rect = element.getBoundingClientRect();
    overlay.style.top = `${rect.top - 2}px`; overlay.style.left = `${rect.left - 2}px`;
    overlay.style.width = `${rect.width + 4}px`; overlay.style.height = `${rect.height + 4}px`;
  }
  reposition();
  window.addEventListener('scroll', reposition, { passive: true });
}

async function runHydraLens(): Promise<void> {
  // 1. Debounce: Block overlapping scans
  if (isScanning) {
     console.log("? HydraLens: Scan already in progress. Ignoring request.");
     return; 
  }
  isScanning = true;
  clearOverlays();
  
  // 2. Fetch Timeout: Prevent infinite hang on streaming SSR
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 seconds timeout

  try {
    const response = await fetch(window.location.href, { 
        cache: 'no-store', 
        signal: controller.signal 
    });
    const serverHTML = await response.text();
    clearTimeout(timeoutId); // clear timeout if successful

    // Give the browser a tiny bit of breathing room before heavy DOM processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    const allMismatches = detectMismatches(serverHTML, document);
    
    chrome.storage.local.get(["ignoredSelectors"], (res) => {
        const ignored = res.ignoredSelectors || [];
        const activeMismatches = allMismatches.filter(m => !ignored.includes(m.selector));

        chrome.runtime.sendMessage({
          type: 'HYDRALENS_RESULTS',
          payload: { mismatches: activeMismatches, totalFound: allMismatches.length }
        }).catch(() => {});

        activeMismatches.forEach((mismatch) => {
          const clientEl = document.querySelector(mismatch.selector) as HTMLElement | null;
          if (clientEl) drawOverlay(clientEl, mismatch);
        });
    });
  } catch (error: any) {
    if (error.name === 'AbortError') {
        console.error("? HydraLens: Fetch aborted (Timeout). The server is too slow or streaming infinitely.");
    } else {
        console.error("? HydraLens Error:", error);
    }
  } finally {
    clearTimeout(timeoutId);
    // Release the lock after a small cooldown to prevent immediate re-triggering
    setTimeout(() => { isScanning = false; }, 2000); 
  }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'HYDRALENS_RUN') runHydraLens();
  if (msg.type === 'HYDRALENS_CLEAR') { clearOverlays(); isScanning = false; }
});
