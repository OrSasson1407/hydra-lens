import type { Mismatch } from "@hydra-lens/core";

const btnScan    = document.getElementById("btn-scan")       as HTMLButtonElement;
const btnClear   = document.getElementById("btn-clear")      as HTMLButtonElement;
const btnExportJson = document.getElementById("btn-export-json") as HTMLButtonElement;
const resultsEl  = document.getElementById("results")        as HTMLDivElement;
const emptyState = document.getElementById("empty-state")    as HTMLParagraphElement;
const statsContainer = document.getElementById("stats-container") as HTMLDivElement;
const statTotal  = document.getElementById("stat-total")     as HTMLElement;
const statCritical = document.getElementById("stat-critical") as HTMLElement;
const statDelta  = document.getElementById("stat-delta")     as HTMLElement;
const filterBar  = document.getElementById("filter-bar")     as HTMLDivElement;

let currentMismatches: Mismatch[] = [];
let activeFilter: string = "all";

// ── Severity filter buttons ──────────────────────────────────────────────────
filterBar.querySelectorAll<HTMLButtonElement>(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    activeFilter = btn.dataset.filter ?? "all";
    filterBar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderIssues(currentMismatches);
  });
});

// ── Render ───────────────────────────────────────────────────────────────────
function renderIssues(mismatches: Mismatch[]) {
  const filtered = activeFilter === "all"
    ? mismatches
    : mismatches.filter((m) => m.severity === activeFilter);

  resultsEl.innerHTML = "";

  if (filtered.length === 0) {
    resultsEl.innerHTML = `<p style="text-align:center; color:#6b7280; margin-top:30px;">
      ${activeFilter === "all" ? "No issues found." : `No <strong>${activeFilter}</strong> issues.`}
    </p>`;
    return;
  }

  filtered.forEach((m, i) => {
    const div = document.createElement("div");
    div.className = `issue ${m.severity}`;

    const escapedSnippet = m.fixSnippet
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <h3 style="margin:0 0 6px;">
          &lt;${m.componentName || "Unknown"}&gt;
          <span class="badge">${m.severity.toUpperCase()}</span>
        </h3>
        <button class="btn-ignore secondary" data-selector="${m.selector}" title="Ignore this selector">Ignore</button>
      </div>
      <div class="detail"><strong>Selector:</strong> <code>${m.selector}</code></div>
      ${m.attributeName
        ? `<div class="detail"><strong>Attribute:</strong> <code>${m.attributeName}</code></div>`
        : `<div class="detail"><strong>Server:</strong> "${m.serverText}" &rarr; <strong>Client:</strong> "${m.clientText}"</div>`
      }
      <div class="detail"><strong>Reason:</strong> ${m.severityReason}</div>
      <div class="detail advice-box"><strong>Advice:</strong> ${m.advice}</div>
      <pre id="code-${i}">${escapedSnippet}</pre>
      <button class="btn-copy" data-index="${i}">Copy Fix</button>
    `;

    div.querySelector(".btn-copy")?.addEventListener("click", () => {
      navigator.clipboard.writeText(m.fixSnippet);
      const btn = div.querySelector(".btn-copy") as HTMLButtonElement;
      btn.textContent = "Copied!";
      setTimeout(() => (btn.textContent = "Copy Fix"), 2000);
    });

    div.querySelector(".btn-ignore")?.addEventListener("click", (e) => {
      const selector = (e.currentTarget as HTMLButtonElement).dataset.selector ?? "";
      chrome.storage.local.get(["ignoredSelectors"], (res) => {
        const ignored: string[] = res.ignoredSelectors ?? [];
        if (!ignored.includes(selector)) ignored.push(selector);
        chrome.storage.local.set({ ignoredSelectors: ignored }, () => {
          currentMismatches = currentMismatches.filter((x) => x.selector !== selector);
          updateStats(currentMismatches);
          renderIssues(currentMismatches);
        });
      });
    });

    resultsEl.appendChild(div);
  });
}

// ── Stats ────────────────────────────────────────────────────────────────────
function updateStats(mismatches: Mismatch[]) {
  chrome.storage.local.get(["lastScanCount"], (res) => {
    const last: number = res.lastScanCount ?? mismatches.length;
    const delta = mismatches.length - last;

    statsContainer.style.display = "flex";
    emptyState.style.display = "none";
    statTotal.textContent = `${mismatches.length}`;
    statCritical.textContent = `${mismatches.filter((m) => m.severity === "critical" || m.severity === "security").length}`;

    if (delta === 0) {
      statDelta.textContent = "No change";
      statDelta.className = "stat-val";
    } else if (delta > 0) {
      statDelta.innerHTML = `<span class="delta-up">+${delta} worse</span>`;
    } else {
      statDelta.innerHTML = `<span class="delta-down">${delta} better</span>`;
    }

    chrome.storage.local.set({ lastScanCount: mismatches.length });
  });
}

// ── Toolbar buttons ──────────────────────────────────────────────────────────
btnScan?.addEventListener("click", () => {
  chrome.devtools.inspectedWindow.eval(
    `chrome.runtime.sendMessage({ type: "HYDRALENS_RUN" })`,
    () => {
      resultsEl.innerHTML = "<p style='text-align:center; color:#9ca3af;'>Scanning...</p>";
      emptyState.style.display = "none";
    }
  );
});

btnClear?.addEventListener("click", () => {
  chrome.devtools.inspectedWindow.eval(
    `chrome.runtime.sendMessage({ type: "HYDRALENS_CLEAR" })`
  );
  currentMismatches = [];
  renderIssues([]);
  statsContainer.style.display = "none";
  emptyState.style.display = "block";
});

btnExportJson?.addEventListener("click", () => {
  if (currentMismatches.length === 0) return alert("No mismatches to export.");
  const json = JSON.stringify(currentMismatches, null, 2);
  navigator.clipboard.writeText(json);
  btnExportJson.textContent = "Copied!";
  setTimeout(() => (btnExportJson.textContent = "Export JSON"), 2000);
});

// ── Receive results from content script ─────────────────────────────────────
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "HYDRALENS_RESULTS") {
    currentMismatches = msg.payload.mismatches;
    updateStats(currentMismatches);
    renderIssues(currentMismatches);
  }
});
