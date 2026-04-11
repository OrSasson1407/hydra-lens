export interface Mismatch {
  selector: string;
  serverText: string;
  clientText: string;
}

/**
 * Generates a stable, unique CSS selector for an element.
 * Prefers ID-based paths; falls back to nth-child traversal.
 */
export function getCssPath(el: Element): string {
  if (!(el instanceof Element)) return '';
  const path: string[] = [];

  let current: Element | null = el;
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.nodeName.toLowerCase();

    if (current.id) {
      // Escape special chars in IDs that would break querySelector
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

/**
 * Compares the Server-Rendered DOM against the live Client DOM.
 * Returns an array of text-content mismatches found in leaf elements.
 */
export function detectMismatches(serverHTML: string, clientDoc: Document): Mismatch[] {
  console.log('🧠 HydraLens Core: Processing DOM trees…');

  const parser = new DOMParser();
  const serverDoc = parser.parseFromString(serverHTML, 'text/html');
  const mismatches: Mismatch[] = [];

  // Only inspect leaf elements (no child elements, non-empty text)
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
        mismatches.push({ selector, serverText, clientText });
      }
    } catch {
      // Invalid selectors generated during parsing — skip silently
    }
  }

  return mismatches;
}
