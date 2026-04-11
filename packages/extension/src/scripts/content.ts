import { detectMismatches, type Mismatch } from '@hydra-lens/core';

console.log('🟢 HydraLens Content Script Booting…');

// Track all overlays so we can remove them on re-run
const overlayElements: HTMLElement[] = [];

function clearOverlays(): void {
  overlayElements.forEach((el) => el.remove());
  overlayElements.length = 0;
}

/**
 * Draws a scroll-stable fixed overlay over a mismatched element.
 * Uses IntersectionObserver to keep position accurate as the page scrolls.
 */
function drawOverlay(element: HTMLElement, mismatch: Mismatch): void {
  const overlay = document.createElement('div');

  overlay.dataset.hydraLens = 'true';
  overlay.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 2147483647;
    border: 2px dashed #ef4444;
    background: rgba(239, 68, 68, 0.08);
    border-radius: 3px;
    box-sizing: border-box;
    transition: opacity 0.15s ease;
  `;

  // Tooltip — fixed to the CSS bug (semicolons added, correct text-decoration)
  const tooltip = document.createElement('div');
  tooltip.style.cssText = `
    position: absolute;
    bottom: calc(100% + 6px);
    left: 0;
    background: #111827;
    color: #f9fafb;
    padding: 5px 9px;
    border-radius: 5px;
    font-size: 11px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    white-space: nowrap;
    line-height: 1.6;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    pointer-events: none;
  `;

  const serverSpan = document.createElement('span');
  serverSpan.style.cssText = 'color: #f87171; text-decoration: line-through;';
  serverSpan.textContent = mismatch.serverText.slice(0, 60);

  const arrowSpan = document.createElement('span');
  arrowSpan.style.cssText = 'color: #6b7280; margin: 0 5px;';
  arrowSpan.textContent = '→';

  const clientSpan = document.createElement('span');
  clientSpan.style.cssText = 'color: #34d399;';
  clientSpan.textContent = mismatch.clientText.slice(0, 60);

  const labelSpan = document.createElement('span');
  labelSpan.style.cssText = 'color: #fbbf24; margin-right: 6px;';
  labelSpan.textContent = '⚠';

  tooltip.append(labelSpan, serverSpan, arrowSpan, clientSpan);
  overlay.appendChild(tooltip);
  document.documentElement.appendChild(overlay);
  overlayElements.push(overlay);

  // Position the overlay using rAF so it stays accurate on scroll/resize
  function reposition(): void {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      overlay.style.opacity = '0';
      return;
    }
    overlay.style.opacity = '1';
    overlay.style.top = `${rect.top - 3}px`;
    overlay.style.left = `${rect.left - 3}px`;
    overlay.style.width = `${rect.width + 6}px`;
    overlay.style.height = `${rect.height + 6}px`;
  }

  reposition();

  // Keep position updated on scroll and resize
  window.addEventListener('scroll', reposition, { passive: true });
  window.addEventListener('resize', reposition, { passive: true });
}

async function runHydraLens(): Promise<void> {
  clearOverlays();

  try {
    const response = await fetch(window.location.href, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    const serverHTML = await response.text();

    // Wait for React/Next.js hydration to complete
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mismatches = detectMismatches(serverHTML, document);

    console.log(`🔍 HydraLens found ${mismatches.length} mismatch(es)`, mismatches);

    // Notify the popup (if open) with the results
    chrome.runtime.sendMessage({
      type: 'HYDRALENS_RESULTS',
      payload: { mismatches, url: window.location.href },
    }).catch(() => {
      // Popup may not be open — ignore
    });

    mismatches.forEach((mismatch) => {
      const clientEl = document.querySelector(mismatch.selector) as HTMLElement | null;
      if (clientEl) drawOverlay(clientEl, mismatch);
    });

  } catch (error) {
    console.error('HydraLens Error:', error);
    chrome.runtime.sendMessage({
      type: 'HYDRALENS_ERROR',
      payload: { message: String(error) },
    }).catch(() => {});
  }
}

// Listen for commands from the popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'HYDRALENS_RUN') runHydraLens();
  if (msg.type === 'HYDRALENS_CLEAR') clearOverlays();
});

// Auto-run on page load
if (document.readyState === 'complete') {
  runHydraLens();
} else {
  window.addEventListener('load', runHydraLens);
}
