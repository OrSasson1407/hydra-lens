import type { Mismatch } from "@hydra-lens/core";

const btnRun = document.getElementById("btn-run") as HTMLButtonElement;
const btnClear = document.getElementById("btn-clear") as HTMLButtonElement;
const btnExport = document.getElementById("btn-export") as HTMLButtonElement;
const resultsEl = document.getElementById("results") as HTMLDivElement;
const countBadge = document.getElementById("count-badge") as HTMLSpanElement;

let currentMismatches: Mismatch[] = [];

function updateUI(mismatches: Mismatch[]) {
  currentMismatches = mismatches;
  countBadge.textContent = `${mismatches.length}`;
  resultsEl.innerHTML = `
    <div style="margin-top:20px; text-align:center; color:#4b5563;">
      <h3 style="color:#10b981; margin:0;">${mismatches.length} Issues Found</h3>
      <p style="font-size:13px; margin-top:8px;">Open <strong>Chrome DevTools (F12)</strong> and navigate to the <strong>HydraLens</strong> tab for full technical details.</p>
    </div>
  `;
}

btnRun?.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (tabId) {
        chrome.tabs.sendMessage(tabId, { type: "HYDRALENS_RUN" });
        resultsEl.innerHTML = "<p style='text-align:center;'>Scanning...</p>";
    }
  });
});

btnClear?.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (tabId) chrome.tabs.sendMessage(tabId, { type: "HYDRALENS_CLEAR" });
  });
  updateUI([]);
  resultsEl.innerHTML = "<p style='text-align:center;'>Cleared.</p>";
});

btnExport?.addEventListener("click", async () => {
  if (currentMismatches.length === 0) return alert("No mismatches to export.");
  
  let markdown = `h2. HydraLens Report\n\n`;
  currentMismatches.forEach((m, i) => {
    markdown += `*Issue #${i+1}* [${m.severity.toUpperCase()}]\n*Component:* ${m.componentName || "Unknown"}\n*Selector:* {code}${m.selector}{code}\n*Reason:* ${m.severityReason}\n\n`;
  });

  await navigator.clipboard.writeText(markdown);
  btnExport.textContent = "? Copied";
  setTimeout(() => btnExport.textContent = "Export to Jira", 2000);
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "HYDRALENS_RESULTS") updateUI(msg.payload.mismatches);
});
