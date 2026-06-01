import { detectMismatches, type Mismatch, type Severity } from '@hydra-lens/core';

console.log('?? HydraLens Content Script Booting…');

const overlayElements: HTMLElement[] = [];

function clearOverlays(): void {
  overlayElements.forEach((el) => el.remove());
  overlayElements.length = 0;
}

const SEVERITY_STYLE: Record<Severity, { border: string; bg: string; icon: string; label: string }> = {
  critical: { border: '#ef4444', bg: 'rgba(239,68,68,0.10)',   icon: '??', label: 'CRITICAL' },
  warning:  { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  icon: '??', label: 'WARNING'  },
  info:     { border: '#3b82f6', bg: 'rgba(59,130,246,0.07)',  icon: '??', label: 'INFO'     },
};

function drawOverlay(element: HTMLElement, mismatch: Mismatch): void {
  const style = SEVERITY_STYLE[mismatch.severity] || SEVERITY_STYLE.warning;

  const overlay = document.createElement('div');
  overlay.dataset.hydraLens = 'true';
  overlay.style.cssText = `
    position: fixed; pointer-events: none; z-index: 2147483647;
    border: 2px dashed ${style.border}; background: ${style.bg};
    border-radius: 3px; box-sizing: border-box; transition: opacity 0.15s ease;
  `;

  const tooltip = document.createElement('div');
  tooltip.style.cssText = `
    position: absolute; bottom: calc(100% + 7px); left: 0;
    background: #111827; color: #f9fafb; padding: 6px 10px;
    border-radius: 6px; font-size: 11px; font-family: monospace;
    white-space: nowrap; line-height: 1.7; box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    pointer-events: none; border-left: 3px solid ${style.border};
  `;

  const row1 = document.createElement('div');
  row1.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:3px;';

  const severityBadge = document.createElement('span');
  severityBadge.style.cssText = `font-size: 9px; font-weight: 700; letter-spacing: 0.8px; color: ${style.border}; text-transform: uppercase;`;
  severityBadge.textContent = `${style.icon} ${style.label}`;
  row1.appendChild(severityBadge);

  if (mismatch.componentName) {
    const compBadge = document.createElement('span');
    compBadge.style.cssText = `font-size: 9px; color: #a78bfa; background: rgba(167,139,250,0.12); border-radius: 3px; padding: 1px 5px;`;
    compBadge.textContent = `<${mismatch.componentName}>`;
    row1.appendChild(compBadge);
  }

  tooltip.appendChild(row1);

  // --- NEW: Handle Attribute vs Text display for the tooltip ---
  const isAttr = !!mismatch.attributeName;
  const sVal = isAttr ? mismatch.serverAttrValue : mismatch.serverText;
  const cVal = isAttr ? mismatch.clientAttrValue : mismatch.clientText;

  const row2 = document.createElement('div');
  row2.style.cssText = 'display:flex;align-items:center;gap:5px;';

  const serverSpan = document.createElement('span');
  serverSpan.style.cssText = 'color:#f87171;text-decoration:line-through;';
  serverSpan.textContent = (sVal || '""').slice(0, 50);

  const arrow = document.createElement('span');
  arrow.style.cssText = 'color:#4b5563;';
  arrow.textContent = '?';

  const clientSpan = document.createElement('span');
  clientSpan.style.cssText = 'color:#34d399;';
  clientSpan.textContent = (cVal || '""').slice(0, 50);

  row2.append(serverSpan, arrow, clientSpan);
  tooltip.appendChild(row2);
  overlay.appendChild(tooltip);
  document.documentElement.appendChild(overlay);
  overlayElements.push(overlay);

  function reposition(): void {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) { overlay.style.opacity = '0'; return; }
    overlay.style.opacity = '1';
    overlay.style.top    = `${rect.top  - 3}px`;
    overlay.style.left   = `${rect.left - 3}px`;
    overlay.style.width  = `${rect.width  + 6}px`;
    overlay.style.height = `${rect.height + 6}px`;
  }

  reposition();
  window.addEventListener('scroll', reposition, { passive: true });
  window.addEventListener('resize', reposition, { passive: true });
}

async function runHydraLens(): Promise<void> {
  clearOverlays();
  try {
    const response = await fetch(window.location.href, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    const serverHTML = await response.text();
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mismatches = detectMismatches(serverHTML, document);
    console.log(`?? HydraLens found ${mismatches.length} mismatch(es)`, mismatches);

    chrome.runtime.sendMessage({
      type: 'HYDRALENS_RESULTS',
      payload: { mismatches, url: window.location.href },
    }).catch(() => {});

    mismatches.forEach((mismatch) => {
      const clientEl = document.querySelector(mismatch.selector) as HTMLElement | null;
      if (clientEl) drawOverlay(clientEl, mismatch);
    });
  } catch (error) {
    chrome.runtime.sendMessage({
      type: 'HYDRALENS_ERROR',
      payload: { message: String(error) },
    }).catch(() => {});
  }
}

chrome.runtime.onMessage.addListener((msg: { type: string }) => {
  if (msg.type === 'HYDRALENS_RUN')   runHydraLens();
  if (msg.type === 'HYDRALENS_CLEAR') clearOverlays();
});

if (document.readyState === 'complete') runHydraLens();
else window.addEventListener('load', runHydraLens);
