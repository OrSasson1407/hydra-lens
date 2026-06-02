import type { Mismatch } from "@hydra-lens/core";

const btnRun      = document.getElementById("btn-run")      as HTMLButtonElement;
const btnClear    = document.getElementById("btn-clear")    as HTMLButtonElement;
const btnJira     = document.getElementById("btn-jira")     as HTMLButtonElement;
const btnMarkdown = document.getElementById("btn-markdown") as HTMLButtonElement;
const btnJson     = document.getElementById("btn-json")     as HTMLButtonElement;
const resultsEl   = document.getElementById("results")      as HTMLDivElement;
const countBadge  = document.getElementById("count-badge")  as HTMLSpanElement;
const historyEl   = document.getElementById("history-list") as HTMLDivElement;
const autoScanToggle = document.getElementById("auto-scan-toggle") as HTMLInputElement;
const autoScanLabel  = document.getElementById("auto-scan-label")  as HTMLSpanElement;

let currentMismatches: Mismatch[] = [];

// ── Auto-scan toggle ──────────────────────────────────────────────────────────
function initAutoScanToggle() {
  chrome.storage.local.get(["autoScan"], (res) => {
    const enabled = res.autoScan !== false;
    autoScanToggle.checked = enabled;
    autoScanLabel.textContent = enabled ? "Auto-scan: ON" : "Auto-scan: OFF";
  });
}

autoScanToggle?.addEventListener("change", () => {
  const enabled = autoScanToggle.checked;
  autoScanLabel.textContent = enabled ? "Auto-scan: ON" : "Auto-scan: OFF";
  chrome.runtime.sendMessage({ type: "HYDRALENS_SET_AUTOSCAN", enabled });
});

// ── History ───────────────────────────────────────────────────────────────────
const MAX_HISTORY = 5;

interface HistoryEntry {
  timestamp: string;
  count: number;
  critical: number;
}

function saveHistory(mismatches: Mismatch[]) {
  chrome.storage.local.get(["scanHistory"], (res) => {
    const history: HistoryEntry[] = res.scanHistory ?? [];
    history.unshift({
      timestamp: new Date().toLocaleTimeString(),
      count: mismatches.length,
      critical: mismatches.filter((m) => m.severity === "critical" || m.severity === "security").length,
    });
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    chrome.storage.local.set({ scanHistory: history }, () => renderHistory(history));
  });
}

function renderHistory(history: HistoryEntry[]) {
  if (history.length === 0) {
    historyEl.innerHTML = "<p style='color:#6b7280; font-size:11px; margin:4px 0;'>No scans yet.</p>";
    return;
  }
  historyEl.innerHTML = history
    .map(
      (h, i) => `
      <div class="history-row">
        <span class="history-time">${h.timestamp}</span>
        <span class="history-count ${h.count === 0 ? "clean" : "dirty"}">${h.count} issues</span>
        ${h.critical > 0 ? `<span class="history-crit">${h.critical} crit</span>` : ""}
        ${i === 0 ? '<span class="history-badge">latest</span>' : ""}
      </div>`
    )
    .join("");
}

function loadHistory() {
  chrome.storage.local.get(["scanHistory"], (res) => renderHistory(res.scanHistory ?? []));
}

// ── UI update ─────────────────────────────────────────────────────────────────
function updateUI(mismatches: Mismatch[]) {
  currentMismatches = mismatches;
  countBadge.textContent = `${mismatches.length}`;
  countBadge.style.background =
    mismatches.length === 0
      ? "#10b981"
      : mismatches.some((m) => m.severity === "security" || m.severity === "critical")
      ? "#ef4444"
      : "#f97316";

  const security = mismatches.filter((m) => m.severity === "security").length;
  const critical  = mismatches.filter((m) => m.severity === "critical").length;
  const warning   = mismatches.filter((m) => m.severity === "warning").length;

  resultsEl.innerHTML =
    mismatches.length === 0
      ? `<div class="result-clean">No issues found</div>`
      : `<div class="result-summary">
          ${security > 0 ? `<div class="chip security">${security} Security</div>` : ""}
          ${critical > 0 ? `<div class="chip critical">${critical} Critical</div>` : ""}
          ${warning  > 0 ? `<div class="chip warning">${warning} Warning</div>`   : ""}
          <p class="open-devtools">Open DevTools (F12) → HydraLens tab for full details.</p>
        </div>`;

  saveHistory(mismatches);
}

// ── Scan / Clear ──────────────────────────────────────────────────────────────
btnRun?.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { type: "HYDRALENS_RUN" });
      resultsEl.innerHTML = "<p class='scanning'>Scanning...</p>";
    }
  });
});

btnClear?.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (tabId) chrome.tabs.sendMessage(tabId, { type: "HYDRALENS_CLEAR" });
  });
  currentMismatches = [];
  countBadge.textContent = "0";
  countBadge.style.background = "#6b7280";
  resultsEl.innerHTML = "<p style='text-align:center; color:#6b7280;'>Cleared.</p>";
});

// ── Exports ───────────────────────────────────────────────────────────────────
btnJira?.addEventListener("click", async () => {
  if (currentMismatches.length === 0) return alert("No mismatches to export.");
  let out = "h2. HydraLens Report\n\n";
  currentMismatches.forEach((m, i) => {
    out += `*Issue #${i + 1}* [${m.severity.toUpperCase()}]\n`;
    out += `*Component:* ${m.componentName || "Unknown"}\n`;
    out += `*Selector:* {code}${m.selector}{code}\n`;
    out += `*Reason:* ${m.severityReason}\n`;
    out += `*Advice:* ${m.advice}\n\n`;
  });
  await navigator.clipboard.writeText(out);
  flash(btnJira, "Copied!", "Export Jira");
});

btnMarkdown?.addEventListener("click", async () => {
  if (currentMismatches.length === 0) return alert("No mismatches to export.");
  let out = "## HydraLens Report\n\n";
  out += `| # | Severity | Component | Selector | Reason |\n`;
  out += `|---|----------|-----------|----------|--------|\n`;
  currentMismatches.forEach((m, i) => {
    out += `| ${i + 1} | **${m.severity.toUpperCase()}** | \`${m.componentName || "Unknown"}\` | \`${m.selector}\` | ${m.severityReason} |\n`;
  });
  out += "\n### Fix Snippets\n\n";
  currentMismatches.forEach((m, i) => {
    out += `#### Issue #${i + 1} — ${m.advice}\n\`\`\`tsx\n${m.fixSnippet}\n\`\`\`\n\n`;
  });
  await navigator.clipboard.writeText(out);
  flash(btnMarkdown, "Copied!", "Export Markdown");
});

btnJson?.addEventListener("click", async () => {
  if (currentMismatches.length === 0) return alert("No mismatches to export.");
  await navigator.clipboard.writeText(JSON.stringify(currentMismatches, null, 2));
  flash(btnJson, "Copied!", "Export JSON");
});

function flash(btn: HTMLButtonElement, msg: string, original: string) {
  btn.textContent = msg;
  setTimeout(() => (btn.textContent = original), 2000);
}

// ── Listen for results ────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "HYDRALENS_RESULTS") updateUI(msg.payload.mismatches);
});

// ── Init ──────────────────────────────────────────────────────────────────────
loadHistory();
initAutoScanToggle();
