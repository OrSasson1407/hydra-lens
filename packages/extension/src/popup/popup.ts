import type { Mismatch } from "hydra-lens-core";
const HISTORY_KEY = "hydralens_scan_history";
const MAX_HISTORY = 5;

interface ScanRecord {
  url: string;
  ts: number;
  total: number;
  mismatches: Mismatch[];
}

const toggle = document.getElementById("autoScanToggle") as HTMLInputElement;

chrome.storage.local.get(["autoScan"], (res) => {
  toggle.checked = res.autoScan !== false;
});

toggle.addEventListener("change", (e) => {
  const enabled = (e.target as HTMLInputElement).checked;
  chrome.runtime.sendMessage({ type: "HYDRALENS_SET_AUTOSCAN", enabled });
});

document.getElementById("scanNowBtn")?.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "HYDRALENS_RUN" }).catch(() => {});
      window.close();
    }
  });
});

function getLatestMismatches(cb: (mismatches: Mismatch[]) => void): void {
  chrome.storage.session.get(["hydralens_last_results"], (res) => {
    cb((res.hydralens_last_results as Mismatch[]) ?? []);
  });
}

document.getElementById("exportJson")?.addEventListener("click", () => {
  getLatestMismatches((mismatches) => {
    const blob = new Blob([JSON.stringify(mismatches, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hydralens-report.json";
    a.click();
    URL.revokeObjectURL(url);
  });
});

document.getElementById("exportMd")?.addEventListener("click", () => {
  getLatestMismatches((mismatches) => {
    const lines = [
      "# HydraLens Report\n",
      "| Severity | Component | Selector | Reason |",
      "|---|---|---|---|",
    ];
    for (const m of mismatches)
      lines.push(
        `| ${m.severity} | ${m.componentName ?? "Unknown"} | \`${m.selector}\` | ${m.severityReason} |`
      );
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hydralens-report.md";
    a.click();
    URL.revokeObjectURL(url);
  });
});

document.getElementById("exportJira")?.addEventListener("click", () => {
  getLatestMismatches((mismatches) => {
    const lines = ["h2. HydraLens Report\n", "||Severity||Component||Selector||Reason||"];
    for (const m of mismatches)
      lines.push(
        `|${m.severity}|${m.componentName ?? "Unknown"}|{{${m.selector}}}|${m.severityReason}|`
      );
    navigator.clipboard
      .writeText(lines.join("\n"))
      .then(() => alert("Jira table copied to clipboard!"));
  });
});

function renderHistory(): void {
  chrome.storage.local.get([HISTORY_KEY], (res) => {
    const history: ScanRecord[] = (res[HISTORY_KEY] as ScanRecord[]) ?? [];
    const list = document.getElementById("historyList")!;
    list.innerHTML = "";
    if (history.length === 0) {
      list.innerHTML = '<div id="noHistory">No scans yet.</div>';
      return;
    }
    for (const rec of history.slice().reverse()) {
      const item = document.createElement("div");
      item.className = "history-item";
      const urlSpan = document.createElement("span");
      urlSpan.style.cssText =
        "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#ccc";
      urlSpan.textContent = rec.url.replace(/^https?:\/\//, "").slice(0, 35);
      const meta = document.createElement("span");
      meta.textContent = `${rec.total} issues`;
      item.appendChild(urlSpan);
      item.appendChild(meta);
      list.appendChild(item);
    }
  });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "HYDRALENS_RESULTS") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url ?? "unknown";
      chrome.storage.local.get([HISTORY_KEY], (res) => {
        const history: ScanRecord[] = (res[HISTORY_KEY] as ScanRecord[]) ?? [];
        history.push({
          url,
          ts: Date.now(),
          total: msg.payload.mismatches.length,
          mismatches: msg.payload.mismatches,
        });
        if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
        chrome.storage.local.set({ [HISTORY_KEY]: history }, renderHistory);
      });
    });
  }
});

renderHistory();
