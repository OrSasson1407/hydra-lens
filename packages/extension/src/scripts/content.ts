import { detectMismatches } from '@hydra-lens/core';

console.log("🟢 HydraLens Content Script Booting...");

async function runHydraLens() {
  try {
    // 1. Fetch the raw Server-Rendered HTML
    const response = await fetch(window.location.href);
    const serverHTML = await response.text();

    // 2. Wait a brief moment to ensure React has finished client-side hydration
    setTimeout(() => {
      // 3. Run our Core Algorithm
      const mismatches = detectMismatches(serverHTML, document);
      
      console.log(`🔍 HydraLens found ${mismatches.length} mismatches!`, mismatches);

      // 4. Draw the UI Overlays
      mismatches.forEach((mismatch) => {
        const clientEl = document.querySelector(mismatch.selector) as HTMLElement;
        if (clientEl) {
          drawOverlay(clientEl, mismatch.serverText, mismatch.clientText);
        }
      });
    }, 1500); // 1.5s delay to let Next.js hydrate

  } catch (error) {
    console.error("HydraLens Error:", error);
  }
}

// UI Function to draw a red box over the broken element
function drawOverlay(element: HTMLElement, serverText: string, clientText: string) {
  const rect = element.getBoundingClientRect();
  
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.top = `${rect.top + window.scrollY - 4}px`;
  overlay.style.left = `${rect.left + window.scrollX - 4}px`;
  overlay.style.width = `${rect.width + 8}px`;
  overlay.style.height = `${rect.height + 8}px`;
  overlay.style.border = '3px dashed #ef4444'; // Tailwind Red 500
  overlay.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
  overlay.style.pointerEvents = 'none'; // Let clicks pass through to the real app
  overlay.style.zIndex = '99999';
  overlay.style.borderRadius = '4px';

  // Add a tooltip showing the exact diff
  const tooltip = document.createElement('div');
  tooltip.style.position = 'absolute';
  tooltip.style.top = '-40px';
  tooltip.style.left = '0';
  tooltip.style.background = '#1f2937';
  tooltip.style.color = '#fff';
  tooltip.style.padding = '4px 8px';
  tooltip.style.borderRadius = '4px';
  tooltip.style.fontSize = '12px';
  tooltip.style.fontFamily = 'monospace';
  tooltip.style.whiteSpace = 'nowrap';
  tooltip.innerHTML = `⚠️ <span style="color:#ef4444 line-through">${serverText}</span> -> <span style="color:#10b981">${clientText}</span>`;
  
  overlay.appendChild(tooltip);
  document.body.appendChild(overlay);
}

// Start the engine safely, accounting for Chrome's injection timing
if (document.readyState === 'complete') {
  // If Chrome injected us late (page already loaded), run immediately
  runHydraLens();
} else {
  // If we got injected early, wait for the load event
  window.addEventListener('load', runHydraLens);
}