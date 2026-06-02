import type { Mismatch } from "@hydra-lens/core";

// ── DOM refs ──────────────────────────────────────────────────────────────────
const btnScan       = document.getElementById("btn-scan")        as HTMLButtonElement;
const btnClear      = document.getElementById("btn-clear")       as HTMLButtonElement;
const btnExportJson = document.getElementById("btn-export-json") as HTMLButtonElement;
const resultsEl     = document.getElementById("results")         as HTMLDivElement;
const emptyState    = document.getElementById("empty-state")     as HTMLParagraphElement;
const statsContainer= document.getElementById("stats-container") as HTMLDivElement;
const statTotal     = document.getElementById("stat-total")      as HTMLElement;
const statCritical  = document.getElementById("stat-critical")   as HTMLElement;
const statDelta     = document.getElementById("stat-delta")      as HTMLElement;
const statDuration  = document.getElementById("stat-duration")   as HTMLElement;
const filterBar     = document.getElementById("filter-bar")      as HTMLDivElement;
const sortSelect    = document.getElementById("sort-select")     as HTMLSelectElement;
const tabResults    = document.getElementById("tab-results")     as HTMLButtonElement;
const tabIgnored    = document.getElementById("tab-ignored")     as HTMLButtonElement;
const paneResults   = document.getElementById("pane-results")    as HTMLDivElement;
const paneIgnored   = document.getElementById("pane-ignored")    as HTMLDivElement;
const errorBanner   = document.getElementById("error-banner")    as HTMLDivElement;

let currentMismatches: Mismatch[] = [];
let activeFilter = "all";
let activeSort   = "severity";
let scanStartTime = 0;

// ── G: Severity order for sort ────────────────────────────────────────────────
const SEVERITY_ORDER: Record<string, number> = { security: 0, critical: 1, warning: 2, info: 3 };

// ── H: Sort ───────────────────────────────────────────────────────────────────
function sortMismatches(list: Mismatch[]): Mismatch[] {
  return [...list].sort((a, b) => {
    if (activeSort === "severity") return (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9);
    if (activeSort === "selector") return a.selector.localeCompare(b.selector);
    return 0; // "found" = original order
  });
}

sortSelect?.addEventListener("change", () => {
  activeSort = sortSelect.value;
  renderIssues(currentMismatches);
});

// ── Filter buttons ────────────────────────────────────────────────────────────
filterBar.querySelectorAll<HTMLButtonElement>(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    activeFilter = btn.dataset.filter ?? "all";
    filterBar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderIssues(currentMismatches);
  });
});

// ── Tabs ──────────────────────────────────────────────────────────────────────
tabResults?.addEventListener("click", () => {
  tabResults.classList.add("tab-active");
  tabIgnored.classList.remove("tab-active");
  paneResults.style.display = "";
  paneIgnored.style.display = "none";
});
tabIgnored?.addEventListener("click", () => {
  tabIgnored.classList.add("tab-active");
  tabResults.classList.remove("tab-active");
  paneIgnored.style.display = "";
  paneResults.style.display = "none";
  renderIgnored();
});

// ── P: Ignored selectors pane ────────────────────────────────────────────────
function renderIgnored() {
  chrome.storage.local.get(["ignoredSelectors"], (res) => {
    const ignored: string[] = res.ignoredSelectors ?? [];
    if (ignored.length === 0) {
      paneIgnored.innerHTML = `<p style="text-align:center; color:#6b7280; margin-top:30px;">No ignored selectors.</p>`;
      return;
    }
    paneIgnored.innerHTML = ignored.map((sel) => `
      <div class="ignored-row">
        <code class="ignored-sel">${sel}</code>
        <button class="btn-unignore btn-sm" data-sel="${sel}">Un-ignore</button>
      </div>`).join("");
    paneIgnored.querySelectorAll<HTMLButtonElement>(".btn-unignore").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sel = btn.dataset.sel ?? "";
        chrome.storage.local.get(["ignoredSelectors"], (r) => {
          const updated = (r.ignoredSelectors ?? []).filter((s: string) => s !== sel);
          chrome.storage.local.set({ ignoredSelectors: updated }, renderIgnored);
        });
      });
    });
  });
}

// ── E+F: Render issues (collapsible + jump-to-element) ───────────────────────
function renderIssues(mismatches: Mismatch[]) {
  const filtered = activeFilter === "all" ? mismatches : mismatches.filter((m) => m.severity === activeFilter);
  const sorted   = sortMismatches(filtered);

  resultsEl.innerHTML = "";

  if (sorted.length === 0) {
    resultsEl.innerHTML = `<p style="text-align:center; color:#6b7280; margin-top:30px;">
      ${activeFilter === "all" ? "No issues found." : `No <strong>${activeFilter}</strong> issues.`}
    </p>`;
    return;
  }

  sorted.forEach((m, i) => {
    const card = document.createElement("div");
    card.className = `issue ${m.severity}`;

    const escapedSnippet = (m.fixSnippet ?? "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const scoreHtml = m.similarityScore !== undefined
      ? `<div class="detail">Similarity: <strong>${Math.round(m.similarityScore * 100)}%</strong></div>`
      : "";

    // E: header is clickable to collapse/expand body
    card.innerHTML = `
      <div class="card-header" data-index="${i}">
        <span class="card-title">&lt;${m.componentName || "Unknown"}&gt; <span class="badge">${m.severity.toUpperCase()}</span></span>
        <div class="card-actions">
          <button class="btn-jump btn-sm" title="Highlight element on page">Jump</button>
          <button class="btn-ignore btn-sm" data-selector="${m.selector}" title="Ignore this selector">Ignore</button>
          <span class="collapse-arrow">▾</span>
        </div>
      </div>
      <div class="card-body">
        <div class="detail"><strong>Selector:</strong> <code>${m.selector}</code></div>
        ${m.attributeName
          ? `<div class="detail"><strong>Attribute:</strong> <code>${m.attributeName}</code> &nbsp;
             <span style="color:#9ca3af">"${m.serverAttrValue}" → "${m.clientText || "?"}"</span></div>`
          : `<div class="detail"><strong>Server:</strong> "${m.serverText}" &rarr; <strong>Client:</strong> "${m.clientText}"</div>`}
        ${scoreHtml}
        <div class="detail"><strong>Reason:</strong> ${m.severityReason}</div>
        <div class="detail advice-box"><strong>Advice:</strong> ${m.advice}</div>
        <pre>${escapedSnippet}</pre>
        <button class="btn-copy btn-sm">Copy Fix</button>
      </div>
    `;

    // E: collapse toggle
    card.querySelector(".card-header")?.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).closest("button")) return;
      const body  = card.querySelector(".card-body")  as HTMLElement;
      const arrow = card.querySelector(".collapse-arrow") as HTMLElement;
      const collapsed = body.style.display === "none";
      body.style.display  = collapsed ? "" : "none";
      arrow.textContent   = collapsed ? "▾" : "▸";
    });

    // F: jump to element
    card.querySelector(".btn-jump")?.addEventListener("click", () => {
      const js = `
        (function() {
          var el = document.querySelector(${JSON.stringify(m.selector)});
          if (!el) return;
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          var prev = el.style.outline;
          el.style.outline = '3px solid #f97316';
          setTimeout(function(){ el.style.outline = prev; }, 2000);
        })();
      `;
      chrome.devtools.inspectedWindow.eval(js);
    });

    // Ignore
    card.querySelector(".btn-ignore")?.addEventListener("click", (e) => {
      const sel = (e.currentTarget as HTMLButtonElement).dataset.selector ?? "";
      chrome.storage.local.get(["ignoredSelectors"], (res) => {
        const ignored: string[] = res.ignoredSelectors ?? [];
        if (!ignored.includes(sel)) ignored.push(sel);
        chrome.storage.local.set({ ignoredSelectors: ignored }, () => {
          currentMismatches = currentMismatches.filter((x) => x.selector !== sel);
          updateStats(currentMismatches);
          renderIssues(currentMismatches);
        });
      });
    });

    // Copy fix
    card.querySelector(".btn-copy")?.addEventListener("click", () => {
      navigator.clipboard.writeText(m.fixSnippet ?? "");
      const btn = card.querySelector(".btn-copy") as HTMLButtonElement;
      btn.textContent = "Copied!";
      setTimeout(() => (btn.textContent = "Copy Fix"), 2000);
    });

    resultsEl.appendChild(card);
  });
}

// ── G: Stats + scan duration ──────────────────────────────────────────────────
function updateStats(mismatches: Mismatch[]) {
  chrome.storage.local.get(["lastScanCount"], (res) => {
    const last: number = res.lastScanCount ?? mismatches.length;
    const delta = mismatches.length - last;

    statsContainer.style.display = "flex";
    emptyState.style.display = "none";
    statTotal.textContent    = `${mismatches.length}`;
    statCritical.textContent = `${mismatches.filter((m) => m.severity === "critical" || m.severity === "security").length}`;

    if (scanStartTime > 0) {
      const ms = Date.now() - scanStartTime;
      statDuration.textContent = ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
      scanStartTime = 0;
    }

    if (delta === 0) {
      statDelta.textContent = "No change";
      statDelta.className   = "stat-val";
    } else if (delta > 0) {
      statDelta.innerHTML = `<span class="delta-up">+${delta} worse</span>`;
    } else {
      statDelta.innerHTML = `<span class="delta-down">${delta} better</span>`;
    }
    chrome.storage.local.set({ lastScanCount: mismatches.length });
  });
}

// ── R: Error banner ───────────────────────────────────────────────────────────
function showError(msg: string) {
  errorBanner.textContent = `Scan error: ${msg}`;
  errorBanner.style.display = "block";
  statsContainer.style.display = "none";
  emptyState.style.display = "none";
}

// ── Toolbar ───────────────────────────────────────────────────────────────────
btnScan?.addEventListener("click", () => {
  errorBanner.style.display = "none";
  scanStartTime = Date.now();
  chrome.devtools.inspectedWindow.eval(
    `chrome.runtime.sendMessage({ type: "HYDRALENS_RUN" })`,
    () => {
      resultsEl.innerHTML = "<p style='text-align:center; color:#9ca3af;'>Scanning...</p>";
      emptyState.style.display = "none";
    }
  );
});

btnClear?.addEventListener("click", () => {
  chrome.devtools.inspectedWindow.eval(`chrome.runtime.sendMessage({ type: "HYDRALENS_CLEAR" })`);
  currentMismatches = [];
  scanStartTime = 0;
  errorBanner.style.display = "none";
  renderIssues([]);
  statsContainer.style.display = "none";
  emptyState.style.display = "block";
  statDuration.textContent = "-";
});

btnExportJson?.addEventListener("click", () => {
  if (currentMismatches.length === 0) return alert("No mismatches to export.");
  navigator.clipboard.writeText(JSON.stringify(currentMismatches, null, 2));
  btnExportJson.textContent = "Copied!";
  setTimeout(() => (btnExportJson.textContent = "Export JSON"), 2000);
});

// ── Messages ──────────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "HYDRALENS_RESULTS") {
    currentMismatches = msg.payload.mismatches;
    updateStats(currentMismatches);
    renderIssues(currentMismatches);
  }
  // R: surface errors from content.ts
  if (msg.type === "HYDRALENS_ERROR") {
    showError(msg.payload.message);
  }
});
