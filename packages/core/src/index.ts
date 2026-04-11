export type Severity = 'critical' | 'warning' | 'info';

export interface Mismatch {
  selector: string;
  serverText: string;
  clientText: string;
  severity: Severity;
  severityReason: string;
  componentName: string | null;
}

// ── Severity classification ───────────────────────────────────────────────────

/**
 * Tags that are structurally important — wrong content here affects
 * navigation, accessibility, or SEO in a meaningful way.
 */
const CRITICAL_TAGS = new Set([
  'a', 'button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'label', 'title', 'nav', 'th',
]);

/**
 * Patterns in the server text that strongly suggest a dynamic/cosmetic value.
 * A mismatch here is almost certainly intentional (timestamp, random, locale).
 */
const INFO_PATTERNS: RegExp[] = [
  /^\d{10,}$/,           // Unix ms timestamp
  /^\d{1,2}[/:]\d{2}/,  // Time / date fragment  e.g. 12:34
  /^[\d,]+(\.\d+)?$/,   // Plain number / formatted number
  /^0\.\d+$/,           // Random float  e.g. 0.482910
];

export function classifySeverity(
  serverText: string,
  clientEl: Element
): { severity: Severity; reason: string } {
  const tag = clientEl.tagName.toLowerCase();

  if (CRITICAL_TAGS.has(tag)) {
    return {
      severity: 'critical',
      reason: `<${tag}> content affects navigation / accessibility`,
    };
  }

  for (const pattern of INFO_PATTERNS) {
    if (pattern.test(serverText.trim())) {
      return {
        severity: 'info',
        reason: 'Looks like a timestamp or dynamic number — likely intentional',
      };
    }
  }

  return {
    severity: 'warning',
    reason: 'Text content differs between server and client renders',
  };
}

// ── React component name extraction ──────────────────────────────────────────

/**
 * Walks up the React fiber tree from a DOM node to find the nearest
 * named user-land component (skips host fibers like div/span).
 */
export function getReactComponentName(el: Element): string | null {
  try {
    const fiberKey = Object.keys(el).find(
      (k) => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance')
    );
    if (!fiberKey) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fiber: any = (el as any)[fiberKey];

    while (fiber) {
      const name: string | undefined =
        fiber.type?.displayName ??
        fiber.type?.name ??
        fiber.elementType?.displayName ??
        fiber.elementType?.name;

      if (name && /^[A-Z]/.test(name) && !name.startsWith('_')) {
        return name;
      }

      fiber = fiber.return;
    }
  } catch {
    // Fiber tree inaccessible
  }

  return null;
}

// ── CSS selector generation ───────────────────────────────────────────────────

export function getCssPath(el: Element): string {
  if (!(el instanceof Element)) return '';
  const path: string[] = [];

  let current: Element | null = el;
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.nodeName.toLowerCase();

    if (current.id) {
      selector += `#${CSS.escape(current.id)}`;
      path.unshift(selector);
      break;
    } else {
      let sib: Element | null = current;
      let nth = 1;
      while ((sib = sib.previousElementSibling)) nth++;
      if (nth !== 1) selector += `:nth-child(${nth})`;
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(' > ');
}

// ── Main detection ────────────────────────────────────────────────────────────

export function detectMismatches(serverHTML: string, clientDoc: Document): Mismatch[] {
  console.log('🧠 HydraLens Core: Processing DOM trees…');

  const parser = new DOMParser();
  const serverDoc = parser.parseFromString(serverHTML, 'text/html');
  const mismatches: Mismatch[] = [];

  const serverLeaves = Array.from(serverDoc.querySelectorAll('*')).filter(
    (el) => el.children.length === 0 && (el.textContent?.trim() ?? '') !== ''
  );

  for (const serverEl of serverLeaves) {
    const selector = getCssPath(serverEl);
    if (!selector) continue;

    try {
      const clientEl = clientDoc.querySelector(selector);
      if (!clientEl) continue;

      const serverText = serverEl.textContent?.trim() ?? '';
      const clientText = clientEl.textContent?.trim() ?? '';

      if (serverText !== clientText && serverText !== '') {
        const { severity, reason } = classifySeverity(serverText, clientEl);
        const componentName = getReactComponentName(clientEl);

        mismatches.push({
          selector,
          serverText,
          clientText,
          severity,
          severityReason: reason,
          componentName,
        });
      }
    } catch {
      // Invalid selector — skip silently
    }
  }

  // Sort: critical first, then warning, then info
  const ORDER: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };
  mismatches.sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);

  return mismatches;
}
