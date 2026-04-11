import type { Mismatch, Severity } from '@hydra-lens/core';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const btnRun     = document.getElementById('btn-run')!     as HTMLButtonElement;
const btnClear   = document.getElementById('btn-clear')!   as HTMLButtonElement;
const statusDot  = document.getElementById('status-dot')!  as HTMLDivElement;
const statusText = document.getElementById('status-text')! as HTMLSpanElement;
const resultsEl  = document.getElementById('results')!     as HTMLDivElement;
const footerUrl  = document.getElementById('footer-url')!  as HTMLDivElement;
const countBadge = document.getElementById('count-badge')! as HTMLDivElement;

// ── State ─────────────────────────────────────────────────────────────────────
let scanning = false;

// ── Severity config ───────────────────────────────────────────────────────────
const SEV: Record<Severity, { icon: string; label: string; color: string; dimColor: string }> = {
  critical: { icon: '🔴', label: 'CRITICAL', color: '#ef4444', dimColor: 'rgba(239,68,68,0.15)'  },
  warning:  { icon: '🟡', label: 'WARNING',  color: '#f59e0b', dimColor: 'rgba(245,158,11,0.12)' },
  info:     { icon: '🟢', label: 'INFO',     color: '#3b82f6', dimColor: 'rgba(59,130,246,0.12)' },
};

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

function truncate(str: string, max = 50): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function renderEmpty(msg: string, icon = '🔬'): void {
  resultsEl.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <p>${msg}</p>
    </div>`;
}

// ── Copy to clipboard ─────────────────────────────────────────────────────────
async function copyToClipboard(text: string, btn: HTMLButtonElement): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    const orig = btn.textContent;
    btn.textContent = '✓ Copied';
    btn.style.color = '#34d399';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.color = '';
    }, 1500);
  } catch {
    btn.textContent = '✗ Failed';
    setTimeout(() => { btn.textContent = '⎘ Copy'; }, 1500);
  }
}

// ── Render results ────────────────────────────────────────────────────────────
function renderMismatches(mismatches: Mismatch[]): void {
  if (mismatches.length === 0) {
    renderEmpty('No mismatches found!<br/>This page hydrated cleanly. ✅', '✅');
    return;
  }

  resultsEl.innerHTML = '';

  mismatches.forEach((m, i) => {
    const sev = SEV[m.severity];
    const item = document.createElement('div');
    item.className = `mismatch-item sev-${m.severity}`;
    item.style.borderLeft = `3px solid ${sev.color}`;

    // ── Header row ────────────────────────────────────────────────────────
    const header = document.createElement('div');
    header.className = 'mismatch-header';

    const indexBadge = document.createElement('span');
    indexBadge.className = 'mismatch-index';
    indexBadge.style.cssText = `background:${sev.dimColor};color:${sev.color};`;
    indexBadge.textContent = `#${i + 1}`;

    const sevBadge = document.createElement('span');
    sevBadge.className = 'severity-badge';
    sevBadge.style.cssText = `color:${sev.color};`;
    sevBadge.textContent = `${sev.icon} ${sev.label}`;

    // Copy selector button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = '⎘ Copy';
    copyBtn.title = 'Copy CSS selector to clipboard';
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Don't trigger the scroll-to behaviour
      copyToClipboard(m.selector, copyBtn);
    });

    header.append(indexBadge, sevBadge, copyBtn);
    item.appendChild(header);

    // ── Component name ────────────────────────────────────────────────────
    if (m.componentName) {
      const comp = document.createElement('div');
      comp.className = 'component-name';
      comp.textContent = `⚛ ${m.componentName}`;
      item.appendChild(comp);
    }

    // ── Selector ──────────────────────────────────────────────────────────
    const selectorEl = document.createElement('div');
    selectorEl.className = 'mismatch-selector';
    selectorEl.title = m.selector;
    selectorEl.textContent = truncate(m.selector, 42);
    item.appendChild(selectorEl);

    // ── Diff rows ─────────────────────────────────────────────────────────
    const diffSSR = document.createElement('div');
    diffSSR.className = 'diff-row';
    diffSSR.innerHTML = `
      <span class="diff-label server">SSR</span>
      <span class="diff-value server">${truncate(m.serverText)}</span>`;

    const diffCSR = document.createElement('div');
    diffCSR.className = 'diff-row';
    diffCSR.innerHTML = `
      <span class="diff-label client">CSR</span>
      <span class="diff-value client">${truncate(m.clientText)}</span>`;

    item.append(diffSSR, diffCSR);

    // ── Reason tooltip ────────────────────────────────────────────────────
    const reason = document.createElement('div');
    reason.className = 'severity-reason';
    reason.textContent = m.severityReason;
    item.appendChild(reason);

    // Click → scroll element into view in the page
    item.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
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

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
    footerUrl.textContent = tabs[0]?.url ?? '—';
    chrome.runtime.sendMessage({ type: 'HYDRALENS_RUN' });
  });
}

function clearAll(): void {
  chrome.runtime.sendMessage({ type: 'HYDRALENS_CLEAR' });
  setStatus('idle', 'Overlays cleared');
  renderEmpty('Cleared.<br/>Click <strong>Scan Page</strong> to run again.', '🧹');
  setCount(null);
}

// ── Message listener ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg: { type: string; payload?: any }) => {
  if (msg.type === 'HYDRALENS_RESULTS') {
    scanning = false;
    btnRun.disabled = false;

    const mismatches: Mismatch[] = msg.payload.mismatches;
    const count = mismatches.length;
    const critCount = mismatches.filter(m => m.severity === 'critical').length;

    if (count === 0) {
      setStatus('ok', 'No mismatches — clean hydration!');
    } else if (critCount > 0) {
      setStatus('found', `${critCount} critical, ${count - critCount} other`);
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

chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
  if (tabs[0]?.url) footerUrl.textContent = tabs[0].url;
});
