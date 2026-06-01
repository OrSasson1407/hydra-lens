export type Severity = 'critical' | 'warning' | 'info' | 'security';

export interface Mismatch {
  selector: string;
  serverText: string;
  clientText: string;
  attributeName?: string;
  serverAttrValue?: string;
  clientAttrValue?: string;
  severity: Severity;
  severityReason: string;
  componentName: string | null;
}

const CRITICAL_TAGS = new Set(['a', 'button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'title', 'nav', 'th']);
const INFO_PATTERNS: RegExp[] = [ /^\d{10,}$/, /^\d{1,2}[/:]\d{2}/, /^[\d,]+(\.\d+)?$/, /^0\.\d+$/ ];

// NEW: Secret patterns for security leaks
const SECRET_PATTERNS: { name: string; regex: RegExp }[] = [
  { name: 'JWT Token', regex: /(eyJ[a-zA-Z0-9_-]{5,}\.eyJ[a-zA-Z0-9_-]{5,})/ },
  { name: 'GCP API Key', regex: /(AIza[0-9A-Za-z-_]{35})/ },
  { name: 'AWS Access Key', regex: /(AKIA[0-9A-Z]{16})/ }
];

export function classifySeverity(serverText: string, clientEl: Element): { severity: Severity; reason: string } {
  // Check for secrets first
  for (const secret of SECRET_PATTERNS) {
    if (secret.regex.test(serverText) || secret.regex.test(clientEl.textContent || '')) {
      return { severity: 'security', reason: `SECURITY LEAK: Detected ${secret.name} in DOM` };
    }
  }

  const tag = clientEl.tagName.toLowerCase();
  if (CRITICAL_TAGS.has(tag)) return { severity: 'critical', reason: `<${tag}> content affects navigation / accessibility` };
  
  for (const pattern of INFO_PATTERNS) {
    if (pattern.test(serverText.trim())) return { severity: 'info', reason: 'Looks like a timestamp or dynamic number' };
  }

  return { severity: 'warning', reason: 'Text content differs between server and client renders' };
}

export function getReactComponentName(el: Element): string | null {
  try {
    const fiberKey = Object.keys(el).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'));
    if (!fiberKey) return null;
    let fiber: any = (el as any)[fiberKey];
    while (fiber) {
      const name = fiber.type?.displayName ?? fiber.type?.name ?? fiber.elementType?.displayName ?? fiber.elementType?.name;
      if (name && /^[A-Z]/.test(name) && !name.startsWith('_')) return name;
      fiber = fiber.return;
    }
  } catch {}
  return null;
}

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

export function detectMismatches(serverHTML: string, clientDoc: Document): Mismatch[] {
  const parser = new DOMParser();
  const serverDoc = parser.parseFromString(serverHTML, 'text/html');
  const mismatches: Mismatch[] = [];
  const allServerEls = Array.from(serverDoc.querySelectorAll('*'));

  for (const serverEl of allServerEls) {
    const tag = serverEl.tagName.toLowerCase();
if (tag === 'script' || tag === 'link' || tag === 'style' || tag === 'noscript') continue;
    const selector = getCssPath(serverEl);
    if (!selector) continue;
    try {
      const clientEl = clientDoc.querySelector(selector);
      if (!clientEl) continue;

      for (const attr of Array.from(serverEl.attributes)) {
        const clientVal = clientEl.getAttribute(attr.name);
        if (attr.value !== clientVal) {
          // Check attribute values for secrets too
          let isSecret = false;
          let secReason = '';
          for (const secret of SECRET_PATTERNS) {
             if (secret.regex.test(attr.value) || secret.regex.test(clientVal || '')) {
                 isSecret = true; secReason = `SECURITY LEAK: ${secret.name} in Attribute`; break;
             }
          }

          mismatches.push({
            selector, serverText: '', clientText: '', attributeName: attr.name,
            serverAttrValue: attr.value, clientAttrValue: clientVal || '',
            severity: isSecret ? 'security' : 'warning',
            severityReason: isSecret ? secReason : `Attribute "${attr.name}" mismatch`,
            componentName: getReactComponentName(clientEl),
          });
        }
      }

      if (serverEl.children.length === 0 && (serverEl.textContent?.trim() ?? '') !== '') {
        const serverText = serverEl.textContent?.trim() ?? '';
        const clientText = clientEl.textContent?.trim() ?? '';
        if (serverText !== clientText && serverText !== '') {
          const { severity, reason } = classifySeverity(serverText, clientEl);
          mismatches.push({
            selector, serverText, clientText, severity, severityReason: reason,
            componentName: getReactComponentName(clientEl),
          });
        }
      }
    } catch {}
  }
  const ORDER: Record<Severity, number> = { security: 0, critical: 1, warning: 2, info: 3 };
  mismatches.sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);
  return mismatches;
}
