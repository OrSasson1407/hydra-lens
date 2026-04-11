export interface Mismatch {
  selector: string;
  serverText: string;
  clientText: string;
}

/**
 * A helper to generate a unique CSS selector for an element
 */
function getCssPath(el: Element): string {
  if (!(el instanceof Element)) return '';
  const path = [];
  while (el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    if (el.id) {
      selector += `#${el.id}`;
      path.unshift(selector);
      break;
    } else {
      let sib = el, nth = 1;
      while ((sib = sib.previousElementSibling as Element)) nth++;
      if (nth != 1) selector += `:nth-child(${nth})`;
    }
    path.unshift(selector);
    el = el.parentNode as Element;
  }
  return path.join(' > ');
}

/**
 * Compares the Server DOM against the Client DOM.
 */
export function detectMismatches(serverHTML: string, clientDoc: Document): Mismatch[] {
  console.log("🧠 HydraLens Core: Processing DOM trees...");
  
  const parser = new DOMParser();
  const serverDoc = parser.parseFromString(serverHTML, 'text/html');
  const mismatches: Mismatch[] = [];

  // We will compare all "leaf" elements (elements with no child elements, just text)
  const serverLeaves = Array.from(serverDoc.querySelectorAll('*')).filter(el => el.children.length === 0 && el.textContent?.trim() !== '');
  
  serverLeaves.forEach((serverEl) => {
    const selector = getCssPath(serverEl);
    if (!selector) return;

    try {
      const clientEl = clientDoc.querySelector(selector);
      if (clientEl) {
        const serverText = serverEl.textContent?.trim() || '';
        const clientText = clientEl.textContent?.trim() || '';

        // THE DIFF: If the text doesn't match, we caught a hydration error!
        if (serverText !== clientText && serverText !== '') {
          mismatches.push({ selector, serverText, clientText });
        }
      }
    } catch (e) {
      // Ignore invalid selectors generated during parsing
    }
  });

  return mismatches;
}