import type { Mismatch } from "@hydra-lens/core";

const btnScan = document.getElementById("btn-scan") as HTMLButtonElement;
const btnClear = document.getElementById("btn-clear") as HTMLButtonElement;
const resultsEl = document.getElementById("results") as HTMLDivElement;
const emptyState = document.getElementById("empty-state") as HTMLParagraphElement;

// Gets the ID of the tab this DevTools window is currently inspecting
const tabId = chrome.devtools.inspectedWindow.tabId;

btnScan.addEventListener("click", () => {
  emptyState.textContent = "Scanning page for hydration mismatches...";
  emptyState.style.display = "block";
  resultsEl.innerHTML = "";
  
  // DIRECTLY command the content script of this specific tab to run
  chrome.tabs.sendMessage(tabId, { type: "HYDRALENS_RUN" }, () => {
      if (chrome.runtime.lastError) {
          emptyState.innerHTML = `<span style="color:#ef4444;">Error: Content script not found.</span><br/>Please refresh the web page (F5) and try again.`;
      }
  });
});

btnClear.addEventListener("click", () => {
  chrome.tabs.sendMessage(tabId, { type: "HYDRALENS_CLEAR" });
  resultsEl.innerHTML = "";
  emptyState.textContent = "Overlays cleared. Ready for next scan.";
  emptyState.style.display = "block";
});

// Listen for the results coming BACK from the content script
chrome.runtime.onMessage.addListener((msg, sender) => {
  // We only care about messages coming from the tab we are inspecting!
  if (msg.type === "HYDRALENS_RESULTS" && sender.tab?.id === tabId) {
    const mismatches: Mismatch[] = msg.payload.mismatches;
    
    emptyState.style.display = "none";
    resultsEl.innerHTML = `<p style="margin-top:0; color:#10b981; font-weight:bold;">? Scan complete. Found ${mismatches.length} issues.</p>`;

    mismatches.forEach(m => {
      const div = document.createElement("div");
      div.className = `issue ${m.severity}`;
      
      let attrHtml = "";
      if (m.attributeName) {
        attrHtml = `<div class="detail"><strong>Attribute [${m.attributeName}]:</strong> <span style="color:#f87171;text-decoration:line-through">${m.serverAttrValue || 'null'}</span> ? <span style="color:#34d399">${m.clientAttrValue || 'null'}</span></div>`;
      }

      let textHtml = "";
      if (m.serverText || m.clientText) {
        textHtml = `<div class="detail"><strong>Text:</strong> <span style="color:#f87171;text-decoration:line-through">${m.serverText || 'empty'}</span> ? <span style="color:#34d399">${m.clientText || 'empty'}</span></div>`;
      }

      div.innerHTML = `
        <h3>
          <span>? &lt;${m.componentName || "Unknown Component"}&gt;</span>
          <span class="badge">${m.severity}</span>
        </h3>
        <div class="detail"><strong>Reason:</strong> ${m.severityReason}</div>
        ${attrHtml}
        ${textHtml}
        <pre>${m.selector}</pre>
      `;
      resultsEl.appendChild(div);
    });
  }
});
