import type { Mismatch } from "hydra-lens-core";
// FIX: results are persisted to chrome.storage.session so the panel shows
//      the last scan immediately when DevTools is opened after a scan ran.

const STORAGE_KEY = "hydralens_last_results";
let currentMismatches: Mismatch[] = [];

// ?? Safe DOM text setter (replaces innerHTML to prevent XSS) ?????????????????
function _setText(el: Element, text: string): void {
  el.textContent = text;
}

function createEl<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  text?: string
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text !== undefined) el.textContent = text;
  return el;
}

// ?? Render ????????????????????????????????????????????????????????????????????
function renderResults(filter = "all"): void {
  const container = document.getElementById("results")!;
  container.innerHTML = "";

  const filtered =
    filter === "all"
      ? currentMismatches
      : filter === "critical"
        ? currentMismatches.filter((m) => ["critical", "security"].includes(m.severity))
        : currentMismatches.filter((m) => m.severity === filter);

  if (filtered.length === 0) {
    container.appendChild(createEl("div", {}, "No issues found."));
    return;
  }

  for (const m of filtered) {
    // FIX: build DOM nodes instead of using innerHTML to prevent XSS from
    //      crafted mismatch payloads injected via chrome.runtime.sendMessage
    const card = createEl("div", { class: `issue ${m.severity}` });

    const header = createEl("strong");
    header.textContent = `[${m.severity.toUpperCase()}] ${m.componentName || "Unknown"}`;
    card.appendChild(header);
    card.appendChild(createEl("br"));

    const selectorLine = createEl("span");
    selectorLine.appendChild(createEl("em", {}, "Selector: "));
    selectorLine.appendChild(document.createTextNode(m.selector));
    card.appendChild(selectorLine);
    card.appendChild(createEl("br"));

    const reasonLine = createEl("span");
    reasonLine.appendChild(createEl("em", {}, "Reason: "));
    reasonLine.appendChild(document.createTextNode(m.severityReason));
    card.appendChild(reasonLine);

    const adviceBox = createEl("div", {
      style: "margin-top:5px;padding:5px;background:#111;",
    });
    const adviceLabel = createEl("strong", {}, "Advice: ");
    adviceBox.appendChild(adviceLabel);
    adviceBox.appendChild(document.createTextNode(m.advice));
    adviceBox.appendChild(createEl("br"));
    adviceBox.appendChild(createEl("code", {}, m.fixSnippet));
    card.appendChild(adviceBox);

    const ignoreBtn = createEl(
      "button",
      {
        "data-selector": m.selector,
        style: "margin-top:8px;background:#444;",
      },
      "Ignore Selector"
    );
    ignoreBtn.addEventListener("click", (e) => {
      const selector = (e.target as HTMLElement).getAttribute("data-selector");
      chrome.storage.local.get(["ignoredSelectors"], (res) => {
        const ignored: string[] = (res.ignoredSelectors as string[]) ?? [];
        if (selector && !ignored.includes(selector)) ignored.push(selector);
        chrome.storage.local.set({ ignoredSelectors: ignored }, () => {
          currentMismatches = currentMismatches.filter((m) => m.selector !== selector);
          renderResults((document.getElementById("severityFilter") as HTMLSelectElement).value);
        });
      });
    });
    card.appendChild(ignoreBtn);

    container.appendChild(card);
  }
}

// ?? Persist & restore results across DevTools open/close ?????????????????????
function saveResults(mismatches: Mismatch[]): void {
  // chrome.storage.session is cleared when the browser session ends (tab close / browser restart)
  chrome.storage.session.set({ [STORAGE_KEY]: mismatches });
}

function restoreResults(): void {
  chrome.storage.session.get([STORAGE_KEY], (res) => {
    if ((res[STORAGE_KEY] as Mismatch[])?.length) {
      currentMismatches = res[STORAGE_KEY] as Mismatch[];
      renderResults((document.getElementById("severityFilter") as HTMLSelectElement).value);
    }
  });
}

// ?? Message listener ??????????????????????????????????????????????????????????
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "HYDRALENS_PROGRESS") {
    const container = document.getElementById("results")!;
    container.innerHTML = "";
    const status = createEl(
      "div",
      { style: "color:#60a5fa;font-style:italic;" },
      msg.payload.status
    );
    container.appendChild(status);
  }
  if (msg.type === "HYDRALENS_RESULTS") {
    currentMismatches = msg.payload.mismatches;
    saveResults(currentMismatches);
    renderResults((document.getElementById("severityFilter") as HTMLSelectElement).value);
  }
  if (msg.type === "HYDRALENS_ERROR") {
    const container = document.getElementById("results")!;
    container.innerHTML = "";
    container.appendChild(
      createEl("div", { style: "color:#ef4444;" }, `Error: ${msg.payload.message}`)
    );
  }
});

// ?? Toolbar event listeners ???????????????????????????????????????????????????
document.getElementById("refreshBtn")?.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) chrome.tabs.sendMessage(tabs[0].id, { type: "HYDRALENS_RUN" });
  });
});

document.getElementById("severityFilter")?.addEventListener("change", (e) => {
  renderResults((e.target as HTMLSelectElement).value);
});

document.getElementById("copyMdBtn")?.addEventListener("click", () => {
  if (currentMismatches.length === 0) {
    alert("No results to copy.");
    return;
  }
  const lines = [
    "# HydraLens Report\n",
    "| Severity | Component | Selector | Reason | Advice |",
    "|---|---|---|---|---|",
  ];
  for (const m of currentMismatches)
    lines.push(
      `| ${m.severity} | ${m.componentName ?? "Unknown"} | \`${m.selector}\` | ${m.severityReason} | ${m.advice} |`
    );
  navigator.clipboard
    .writeText(lines.join("\n"))
    .then(() => alert("Markdown copied to clipboard!"));
});

document.getElementById("clearIgnoreBtn")?.addEventListener("click", () => {
  chrome.storage.local.set({ ignoredSelectors: [] }, () => alert("Ignore list cleared!"));
});

// FIX: restore last scan results when the panel mounts (fixes blank-panel-on-open)
restoreResults();
