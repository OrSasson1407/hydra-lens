import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import {
  classifySeverity,
  getCssPath,
  detectMismatches,
  getReactComponentName,
} from './index';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeDoc(html: string): Document {
  return new JSDOM(html).window.document;
}

function makeEl(tag: string, doc?: Document): Element {
  return (doc ?? document).createElement(tag);
}

// ── classifySeverity ─────────────────────────────────────────────────────────

describe('classifySeverity', () => {
  it('returns critical for anchor tags', () => {
    const el = makeEl('a');
    const { severity } = classifySeverity('Click here', el);
    expect(severity).toBe('critical');
  });

  it('returns critical for button tags', () => {
    const el = makeEl('button');
    const { severity } = classifySeverity('Submit', el);
    expect(severity).toBe('critical');
  });

  it('returns critical for heading tags (h1–h6)', () => {
    for (const tag of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
      const el = makeEl(tag);
      const { severity } = classifySeverity('Some heading', el);
      expect(severity).toBe('critical');
    }
  });

  it('returns critical for label, title, nav, th', () => {
    for (const tag of ['label', 'title', 'nav', 'th']) {
      const el = makeEl(tag);
      const { severity } = classifySeverity('text', el);
      expect(severity).toBe('critical');
    }
  });

  it('returns info for unix ms timestamps', () => {
    const el = makeEl('p');
    const { severity } = classifySeverity('1714000000000', el);
    expect(severity).toBe('info');
  });

  it('returns info for time fragments like 12:34', () => {
    const el = makeEl('span');
    const { severity } = classifySeverity('12:34', el);
    expect(severity).toBe('info');
  });

  it('returns info for plain formatted numbers', () => {
    const el = makeEl('span');
    const { severity } = classifySeverity('1,234.56', el);
    expect(severity).toBe('info');
  });

  it('returns info for random floats like 0.482910', () => {
    const el = makeEl('span');
    const { severity } = classifySeverity('0.482910', el);
    expect(severity).toBe('info');
  });

  it('returns warning for plain text in a non-critical tag', () => {
    const el = makeEl('p');
    const { severity } = classifySeverity('Hello world', el);
    expect(severity).toBe('warning');
  });

  it('returns warning for div with mismatched text', () => {
    const el = makeEl('div');
    const { severity } = classifySeverity('Server content', el);
    expect(severity).toBe('warning');
  });

  it('includes a human-readable reason', () => {
    const el = makeEl('button');
    const { reason } = classifySeverity('Buy now', el);
    expect(reason).toBeTruthy();
    expect(typeof reason).toBe('string');
  });
});

// ── getCssPath ────────────────────────────────────────────────────────────────
// getCssPath uses Node.ELEMENT_NODE internally, which requires elements created
// in the same window context. We use the global document provided by jsdom's
// environment (set via vitest's jsdom environment) rather than a separate JSDOM instance.

describe('getCssPath', () => {
  it('returns a non-empty string for a simple element', () => {
    const div = document.createElement('div');
    const p = document.createElement('p');
    p.textContent = 'Hello';
    div.appendChild(p);
    document.body.appendChild(div);
    const path = getCssPath(p);
    expect(path).toBeTruthy();
    expect(typeof path).toBe('string');
    document.body.removeChild(div);
  });

  it('uses the id as an anchor when present', () => {
    const div = document.createElement('div');
    div.id = 'root-test';
    document.body.appendChild(div);
    const path = getCssPath(div);
    expect(path).toContain('#root-test');
    document.body.removeChild(div);
  });

  it('produces a selector that re-queries the same element', () => {
    const ul = document.createElement('ul');
    ['A', 'B', 'C'].forEach((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      ul.appendChild(li);
    });
    document.body.appendChild(ul);
    const items = ul.querySelectorAll('li');
    for (const li of Array.from(items)) {
      const path = getCssPath(li);
      const found = document.querySelector(path);
      expect(found).toBe(li);
    }
    document.body.removeChild(ul);
  });

  it('returns empty string for non-Element input', () => {
    const path = getCssPath({} as Element);
    expect(path).toBe('');
  });

  it('generates unique paths for siblings', () => {
    const div = document.createElement('div');
    const span1 = document.createElement('span');
    const span2 = document.createElement('span');
    span1.textContent = 'A';
    span2.textContent = 'B';
    div.append(span1, span2);
    document.body.appendChild(div);
    const path0 = getCssPath(span1);
    const path1 = getCssPath(span2);
    expect(path0).not.toBe(path1);
    document.body.removeChild(div);
  });
});

// ── detectMismatches ──────────────────────────────────────────────────────────

describe('detectMismatches', () => {
  it('returns empty array when server and client are identical', () => {
    const html = '<html><body><p>Same text</p></body></html>';
    const clientDoc = makeDoc(html);
    const mismatches = detectMismatches(html, clientDoc);
    expect(mismatches).toHaveLength(0);
  });

  it('detects a single text mismatch', () => {
    const serverHTML = '<html><body><p>Server text</p></body></html>';
    const clientDoc = makeDoc('<html><body><p>Client text</p></body></html>');
    const mismatches = detectMismatches(serverHTML, clientDoc);
    expect(mismatches.length).toBeGreaterThan(0);
    const m = mismatches[0];
    expect(m.serverText).toBe('Server text');
    expect(m.clientText).toBe('Client text');
  });

  it('detects multiple mismatches', () => {
    const serverHTML = `
      <html><body>
        <h1>Server Title</h1>
        <p>Server paragraph</p>
      </body></html>`;
    const clientDoc = makeDoc(`
      <html><body>
        <h1>Client Title</h1>
        <p>Client paragraph</p>
      </body></html>`);
    const mismatches = detectMismatches(serverHTML, clientDoc);
    expect(mismatches.length).toBeGreaterThanOrEqual(2);
  });

  it('sorts results: critical before warning before info', () => {
    const serverHTML = `
      <html><body>
        <p>0.500000</p>
        <p>Warning text</p>
        <button>Click me</button>
      </body></html>`;
    const clientDoc = makeDoc(`
      <html><body>
        <p>0.823741</p>
        <p>Different text</p>
        <button>Press me</button>
      </body></html>`);
    const mismatches = detectMismatches(serverHTML, clientDoc);
    const severities = mismatches.map((m) => m.severity);
    const order: Record<string, number> = { critical: 0, warning: 1, info: 2 };
    for (let i = 1; i < severities.length; i++) {
      expect(order[severities[i]]).toBeGreaterThanOrEqual(order[severities[i - 1]]);
    }
  });

  it('ignores elements with empty text content', () => {
    const serverHTML = '<html><body><div></div><p>Real text</p></body></html>';
    const clientDoc = makeDoc('<html><body><div></div><p>Different text</p></body></html>');
    const mismatches = detectMismatches(serverHTML, clientDoc);
    // Should only find the <p> mismatch, not the empty <div>
    expect(mismatches.every((m) => m.serverText !== '')).toBe(true);
  });

  it('each mismatch has all required fields', () => {
    const serverHTML = '<html><body><p>Server</p></body></html>';
    const clientDoc = makeDoc('<html><body><p>Client</p></body></html>');
    const [m] = detectMismatches(serverHTML, clientDoc);
    expect(m).toHaveProperty('selector');
    expect(m).toHaveProperty('serverText');
    expect(m).toHaveProperty('clientText');
    expect(m).toHaveProperty('severity');
    expect(m).toHaveProperty('severityReason');
    expect(m).toHaveProperty('componentName');
  });
});

// ── getReactComponentName ─────────────────────────────────────────────────────

describe('getReactComponentName', () => {
  it('returns null for a plain DOM element with no fiber', () => {
    const doc = makeDoc('<div><p>text</p></div>');
    const p = doc.querySelector('p')!;
    // No React fiber attached — should return null gracefully
    expect(getReactComponentName(p)).toBeNull();
  });

  it('returns null when fiber key is missing', () => {
    const el = document.createElement('div');
    expect(getReactComponentName(el)).toBeNull();
  });

  it('does not throw on elements with inaccessible fiber trees', () => {
    const el = document.createElement('span');
    // Simulate a fiber key that throws when accessed
    Object.defineProperty(el, '__reactFiber$test', {
      get() { throw new Error('Fiber inaccessible'); },
      enumerable: true,
    });
    expect(() => getReactComponentName(el)).not.toThrow();
    expect(getReactComponentName(el)).toBeNull();
  });
});