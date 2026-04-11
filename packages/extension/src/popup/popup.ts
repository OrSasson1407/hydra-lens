import type { Mismatch } from '@hydra-lens/core';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const btnRun      = document.getElementById('btn-run')!     as HTMLButtonElement;
const btnClear    = document.getElementById('btn-clear')!   as HTMLButtonElement;
const statusDot   = document.getElementById('status-dot')!  as HTMLDivElement;
const statusText  = document.getElementById('status-text')! as HTMLSpanElement;
const resultsEl   = document.getElementById('results')!     as HTMLDivElement;
const footerUrl   = document.getElementById('footer-url')!  as HTMLDivElement;
const countBadge  = document.getElementById('count-badge')! as HTMLDivElement;

// ── State ─────────────────────────────────────────────────────────────────────
let scanning = false;

// ── Helpers ───────────────────────────────────────────────────────────────────
function setStatus(state: 'idle' | 'scanning' | 'ok' | 'found' | 'error', msg: string): void {
  statusDot.className = `status-dot ${state === 'idle' ? '' : state}`;
  statusText.textContent = msg;
}

function setCount(n: number | null): void {
  if (n === null) {
    countBadge.className = 'count-badge none';
    countBadge.textContent = '—';
  } else if (n === 0) {
    countBadge.className = 'count-badge none';
    countBadge.textContent = '0 found';
  } else {
    countBadge.className = 'count-badge some';
    countBadge.textContent = `${n} mismatch${n !== 1 ? 'es' : ''}`;
  }
}

function truncate(str: string, max = 55): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function renderEmpty(msg: string, icon = '🔬'): void {
  resultsEl.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <p>${msg}</p>
    </div>`;
}

function renderMismatches(mismatches: Mismatch[]): void {
  if (mismatches.length === 0) {
    renderEmpty('No mismatches found!<br/>This page hydrated cleanly. ✅', '✅');
    return;
  }

  resultsEl.innerHTML = '';
  mismatches.forEach((m, i) => {
    const item = document.createElement('div');
    item.className = 'mismatch-item';
    item.title = `Click to log details to console`;
    item.innerHTML = `
      <div class="mismatch-header">
        <span class="mismatch-index">#${i + 1}</span>
        <span class="mismatch-selector" title="${m.selector}">${truncate(m.selector, 45)}</span>
      </div>
      <div class="diff-row">
        <span class="diff-label server">SSR</span>
        <span class="diff-value server">${truncate(m.serverText)}</span>
      </div>
      <div class="diff-row">
        <span class="diff-label client">CSR</span>
        <span class="diff-value client">${truncate(m.clientText)}</span>
      </div>`;

    // Clicking an item scrolls the flagged element into view in the page
    item.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (tabId == null) return;
        chrome.scripting.executeScript({
          target: { tabId },
          func: (selector: string) => {
            const el = document.querySelector(selector);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              console.log('[HydraLens] Mismatch element:', el);
            }
          },
          args: [m.selector],
        });
      });
    });

    resultsEl.appendChild(item);
  });
}

// ── Actions ───────────────────────────────────────────────────────────────────
function runScan(): void {
  if (scanning) return;
  scanning = true;
  btnRun.disabled = true;

  setStatus('scanning', 'Fetching server HTML…');
  renderEmpty('Scanning for mismatches…', '⏳');
  setCount(null);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    footerUrl.textContent = tab?.url ?? '—';

    chrome.runtime.sendMessage({ type: 'HYDRALENS_RUN' });
  });
}

function clearAll(): void {
  chrome.runtime.sendMessage({ type: 'HYDRALENS_CLEAR' });
  setStatus('idle', 'Overlays cleared');
  renderEmpty('Cleared.<br/>Click <strong>Scan Page</strong> to run again.', '🧹');
  setCount(null);
}

// ── Message listener (results from content script via background) ─────────────
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'HYDRALENS_RESULTS') {
    scanning = false;
    btnRun.disabled = false;

    const mismatches: Mismatch[] = msg.payload.mismatches;
    const count = mismatches.length;

    if (count === 0) {
      setStatus('ok', 'No mismatches — clean hydration!');
    } else {
      setStatus('found', `Found ${count} mismatch${count !== 1 ? 'es' : ''}`);
    }

    setCount(count);
    renderMismatches(mismatches);
  }

  if (msg.type === 'HYDRALENS_ERROR') {
    scanning = false;
    btnRun.disabled = false;
    setStatus('error', `Error: ${msg.payload.message}`);
    renderEmpty('Scan failed.<br/>Check the console for details.', '❌');
    setCount(null);
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────
btnRun.addEventListener('click', runScan);
btnClear.addEventListener('click', clearAll);

// Show current tab URL immediately
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]?.url) footerUrl.textContent = tabs[0].url;
});
