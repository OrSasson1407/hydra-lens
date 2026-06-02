let currentMismatches: any[] = [];

function renderResults(filter = "all") {
  const container = document.getElementById("results")!;
  container.innerHTML = "";
  
  const filtered = filter === "all" ? currentMismatches : 
                   filter === "critical" ? currentMismatches.filter(m => ["critical", "security"].includes(m.severity)) :
                   currentMismatches.filter(m => m.severity === filter);

  if(filtered.length === 0) {
    container.innerHTML = "<div>No issues found.</div>";
    return;
  }

  filtered.forEach(m => {
    const el = document.createElement("div");
    el.className = `issue ${m.severity}`;
    el.innerHTML = `
      <strong>[${m.severity.toUpperCase()}] ${m.componentName || 'Unknown'}</strong><br/>
      <em>Selector:</em> ${m.selector}<br/>
      <em>Reason:</em> ${m.severityReason}<br/>
      <div style="margin-top:5px; padding:5px; background:#111;">
        <strong>Advice:</strong> ${m.advice}<br/>
        <code>${m.fixSnippet}</code>
      </div>
      <button class="ignore-btn" data-selector="${m.selector}" style="margin-top:8px; background:#444;">Ignore Selector</button>
    `;
    container.appendChild(el);
  });

  document.querySelectorAll('.ignore-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selector = (e.target as HTMLElement).getAttribute('data-selector');
      chrome.storage.local.get(["ignoredSelectors"], (res) => {
        const ignored = res.ignoredSelectors ?? [];
        if (!ignored.includes(selector)) ignored.push(selector);
        chrome.storage.local.set({ ignoredSelectors: ignored }, () => {
          (e.target as HTMLElement).innerText = "Ignored";
        });
      });
    });
  });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "HYDRALENS_RESULTS") {
    currentMismatches = msg.payload.mismatches;
    renderResults((document.getElementById("severityFilter") as HTMLSelectElement).value);
  }
});

document.getElementById("refreshBtn")?.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) chrome.tabs.sendMessage(tabs[0].id, { type: "HYDRALENS_RUN" });
  });
});

document.getElementById("severityFilter")?.addEventListener("change", (e) => {
  renderResults((e.target as HTMLSelectElement).value);
});

document.getElementById("clearIgnoreBtn")?.addEventListener("click", () => {
  chrome.storage.local.set({ ignoredSelectors: [] }, () => alert("Ignore list cleared!"));
});
