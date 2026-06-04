// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { detectMismatchesAsync, type Mismatch, type Severity } from "@hydra-lens/core";

// ── SHADOW DOM SETUP ──────────────────────────────────────────────────────────
const HOST_ID = stryMutAct_9fa48("676") ? "" : (stryCov_9fa48("676"), "hydra-lens-host");
let shadowRoot: ShadowRoot | null = null;
function getShadowRoot(): ShadowRoot {
  if (stryMutAct_9fa48("677")) {
    {}
  } else {
    stryCov_9fa48("677");
    // FIX: always re-use an existing host+shadow instead of creating a duplicate
    let host = document.getElementById(HOST_ID) as HTMLElement | null;
    if (stryMutAct_9fa48("679") ? false : stryMutAct_9fa48("678") ? true : (stryCov_9fa48("678", "679"), host)) {
      if (stryMutAct_9fa48("680")) {
        {}
      } else {
        stryCov_9fa48("680");
        if (stryMutAct_9fa48("683") ? false : stryMutAct_9fa48("682") ? true : stryMutAct_9fa48("681") ? shadowRoot : (stryCov_9fa48("681", "682", "683"), !shadowRoot)) {
          if (stryMutAct_9fa48("684")) {
            {}
          } else {
            stryCov_9fa48("684");
            // Host exists but our module-level reference was lost (e.g. after a soft nav).
            // shadowRoot on the host is permanent once attached, so we can recover it.
            shadowRoot = host.shadowRoot;
          }
        }
        return shadowRoot as ShadowRoot;
      }
    }
    host = document.createElement(stryMutAct_9fa48("685") ? "" : (stryCov_9fa48("685"), "div"));
    host.id = HOST_ID;
    host.style.cssText = stryMutAct_9fa48("686") ? "" : (stryCov_9fa48("686"), "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;pointer-events:none;");
    document.documentElement.appendChild(host);
    shadowRoot = host.attachShadow(stryMutAct_9fa48("687") ? {} : (stryCov_9fa48("687"), {
      mode: stryMutAct_9fa48("688") ? "" : (stryCov_9fa48("688"), "open")
    }));
    return shadowRoot;
  }
}

// ── OVERLAY STATE ─────────────────────────────────────────────────────────────
const overlayElements: HTMLElement[] = stryMutAct_9fa48("689") ? ["Stryker was here"] : (stryCov_9fa48("689"), []);
const resizeObservers: ResizeObserver[] = stryMutAct_9fa48("690") ? ["Stryker was here"] : (stryCov_9fa48("690"), []);
// FIX: keep references to scroll/resize handlers so we can remove them on clear
type ReposHandler = () => void;
const windowListeners: {
  scroll: ReposHandler;
  resize: ReposHandler;
}[] = stryMutAct_9fa48("691") ? ["Stryker was here"] : (stryCov_9fa48("691"), []);

// FIX: isScanning is set to true only inside the try block so a pre-try throw
//      never permanently locks the extension
let isScanning = stryMutAct_9fa48("692") ? true : (stryCov_9fa48("692"), false);
function clearOverlays(): void {
  if (stryMutAct_9fa48("693")) {
    {}
  } else {
    stryCov_9fa48("693");
    // Remove per-overlay window listeners before clearing elements
    for (const {
      scroll,
      resize
    } of windowListeners) {
      if (stryMutAct_9fa48("694")) {
        {}
      } else {
        stryCov_9fa48("694");
        window.removeEventListener(stryMutAct_9fa48("695") ? "" : (stryCov_9fa48("695"), "scroll"), scroll);
        window.removeEventListener(stryMutAct_9fa48("696") ? "" : (stryCov_9fa48("696"), "resize"), resize);
      }
    }
    windowListeners.length = 0;
    overlayElements.forEach(stryMutAct_9fa48("697") ? () => undefined : (stryCov_9fa48("697"), el => el.remove()));
    overlayElements.length = 0;
    resizeObservers.forEach(stryMutAct_9fa48("698") ? () => undefined : (stryCov_9fa48("698"), ro => ro.disconnect()));
    resizeObservers.length = 0;
    const host = document.getElementById(HOST_ID);
    if (stryMutAct_9fa48("700") ? false : stryMutAct_9fa48("699") ? true : (stryCov_9fa48("699", "700"), host)) host.remove();
    shadowRoot = null;
  }
}
const SEVERITY_STYLE: Record<Severity, {
  border: string;
  bg: string;
  label: string;
}> = stryMutAct_9fa48("701") ? {} : (stryCov_9fa48("701"), {
  security: stryMutAct_9fa48("702") ? {} : (stryCov_9fa48("702"), {
    border: stryMutAct_9fa48("703") ? "" : (stryCov_9fa48("703"), "#ef4444"),
    bg: stryMutAct_9fa48("704") ? "" : (stryCov_9fa48("704"), "rgba(239,68,68,0.20)"),
    label: stryMutAct_9fa48("705") ? "" : (stryCov_9fa48("705"), "SECURITY")
  }),
  critical: stryMutAct_9fa48("706") ? {} : (stryCov_9fa48("706"), {
    border: stryMutAct_9fa48("707") ? "" : (stryCov_9fa48("707"), "#f97316"),
    bg: stryMutAct_9fa48("708") ? "" : (stryCov_9fa48("708"), "rgba(249,115,22,0.15)"),
    label: stryMutAct_9fa48("709") ? "" : (stryCov_9fa48("709"), "CRITICAL")
  }),
  warning: stryMutAct_9fa48("710") ? {} : (stryCov_9fa48("710"), {
    border: stryMutAct_9fa48("711") ? "" : (stryCov_9fa48("711"), "#eab308"),
    bg: stryMutAct_9fa48("712") ? "" : (stryCov_9fa48("712"), "rgba(234,179,8,0.15)"),
    label: stryMutAct_9fa48("713") ? "" : (stryCov_9fa48("713"), "WARNING")
  }),
  info: stryMutAct_9fa48("714") ? {} : (stryCov_9fa48("714"), {
    border: stryMutAct_9fa48("715") ? "" : (stryCov_9fa48("715"), "#3b82f6"),
    bg: stryMutAct_9fa48("716") ? "" : (stryCov_9fa48("716"), "rgba(59,130,246,0.15)"),
    label: stryMutAct_9fa48("717") ? "" : (stryCov_9fa48("717"), "INFO")
  })
});
function drawOverlay(element: HTMLElement, mismatch: Mismatch): void {
  if (stryMutAct_9fa48("718")) {
    {}
  } else {
    stryCov_9fa48("718");
    const root = getShadowRoot();
    const style = SEVERITY_STYLE[mismatch.severity];
    const overlay = document.createElement(stryMutAct_9fa48("719") ? "" : (stryCov_9fa48("719"), "div"));
    overlay.style.cssText = stryMutAct_9fa48("720") ? `` : (stryCov_9fa48("720"), `
    position:fixed;pointer-events:none;
    border:2px dashed ${style.border};background:${style.bg};
    box-sizing:border-box;transition:top 0.1s,left 0.1s,width 0.1s,height 0.1s;
  `);
    const tooltip = document.createElement(stryMutAct_9fa48("721") ? "" : (stryCov_9fa48("721"), "div"));
    tooltip.style.cssText = stryMutAct_9fa48("722") ? `` : (stryCov_9fa48("722"), `
    position:absolute;bottom:calc(100% + 4px);left:0;
    background:#111827;color:#fff;padding:3px 8px;
    font-size:11px;font-family:monospace;white-space:nowrap;
    border-left:3px solid ${style.border};border-radius:0 3px 3px 0;
  `);
    tooltip.textContent = stryMutAct_9fa48("723") ? `` : (stryCov_9fa48("723"), `[${style.label}] <${stryMutAct_9fa48("726") ? mismatch.componentName && "element" : stryMutAct_9fa48("725") ? false : stryMutAct_9fa48("724") ? true : (stryCov_9fa48("724", "725", "726"), mismatch.componentName || (stryMutAct_9fa48("727") ? "" : (stryCov_9fa48("727"), "element")))}>`);
    overlay.appendChild(tooltip);
    root.appendChild(overlay);
    overlayElements.push(overlay);
    function reposition(): void {
      if (stryMutAct_9fa48("728")) {
        {}
      } else {
        stryCov_9fa48("728");
        const rect = element.getBoundingClientRect();
        overlay.style.top = stryMutAct_9fa48("729") ? `` : (stryCov_9fa48("729"), `${stryMutAct_9fa48("730") ? rect.top + 2 : (stryCov_9fa48("730"), rect.top - 2)}px`);
        overlay.style.left = stryMutAct_9fa48("731") ? `` : (stryCov_9fa48("731"), `${stryMutAct_9fa48("732") ? rect.left + 2 : (stryCov_9fa48("732"), rect.left - 2)}px`);
        overlay.style.width = stryMutAct_9fa48("733") ? `` : (stryCov_9fa48("733"), `${stryMutAct_9fa48("734") ? rect.width - 4 : (stryCov_9fa48("734"), rect.width + 4)}px`);
        overlay.style.height = stryMutAct_9fa48("735") ? `` : (stryCov_9fa48("735"), `${stryMutAct_9fa48("736") ? rect.height - 4 : (stryCov_9fa48("736"), rect.height + 4)}px`);
      }
    }
    reposition();

    // FIX: store handler references so clearOverlays() can remove them
    window.addEventListener(stryMutAct_9fa48("737") ? "" : (stryCov_9fa48("737"), "scroll"), reposition, stryMutAct_9fa48("738") ? {} : (stryCov_9fa48("738"), {
      passive: stryMutAct_9fa48("739") ? false : (stryCov_9fa48("739"), true)
    }));
    window.addEventListener(stryMutAct_9fa48("740") ? "" : (stryCov_9fa48("740"), "resize"), reposition, stryMutAct_9fa48("741") ? {} : (stryCov_9fa48("741"), {
      passive: stryMutAct_9fa48("742") ? false : (stryCov_9fa48("742"), true)
    }));
    windowListeners.push(stryMutAct_9fa48("743") ? {} : (stryCov_9fa48("743"), {
      scroll: reposition,
      resize: reposition
    }));
    const ro = new ResizeObserver(reposition);
    ro.observe(element);
    resizeObservers.push(ro);
  }
}
async function runHydraLens(): Promise<void> {
  if (stryMutAct_9fa48("744")) {
    {}
  } else {
    stryCov_9fa48("744");
    // FIX: guard is checked before any async work; flag is set only after clearOverlays succeeds
    if (stryMutAct_9fa48("746") ? false : stryMutAct_9fa48("745") ? true : (stryCov_9fa48("745", "746"), isScanning)) {
      if (stryMutAct_9fa48("747")) {
        {}
      } else {
        stryCov_9fa48("747");
        console.log(stryMutAct_9fa48("748") ? "" : (stryCov_9fa48("748"), "[HydraLens] Scan already in progress."));
        return;
      }
    }
    clearOverlays(); // synchronous — if this throws, isScanning stays false (correct)
    isScanning = stryMutAct_9fa48("749") ? false : (stryCov_9fa48("749"), true);
    const controller = new AbortController();
    const timeoutId = setTimeout(stryMutAct_9fa48("750") ? () => undefined : (stryCov_9fa48("750"), () => controller.abort()), 6000);
    try {
      if (stryMutAct_9fa48("751")) {
        {}
      } else {
        stryCov_9fa48("751");
        const response = await fetch(window.location.href, stryMutAct_9fa48("752") ? {} : (stryCov_9fa48("752"), {
          cache: stryMutAct_9fa48("753") ? "" : (stryCov_9fa48("753"), "no-store"),
          signal: controller.signal
        }));
        const serverHTML = await response.text();
        clearTimeout(timeoutId);
        await new Promise(stryMutAct_9fa48("754") ? () => undefined : (stryCov_9fa48("754"), resolve => setTimeout(resolve, 800)));
        const allMismatches = await detectMismatchesAsync(serverHTML, document);
        chrome.storage.local.get(stryMutAct_9fa48("755") ? [] : (stryCov_9fa48("755"), [stryMutAct_9fa48("756") ? "" : (stryCov_9fa48("756"), "ignoredSelectors")]), res => {
          if (stryMutAct_9fa48("757")) {
            {}
          } else {
            stryCov_9fa48("757");
            const ignored: string[] = stryMutAct_9fa48("758") ? res.ignoredSelectors && [] : (stryCov_9fa48("758"), res.ignoredSelectors ?? (stryMutAct_9fa48("759") ? ["Stryker was here"] : (stryCov_9fa48("759"), [])));
            const activeMismatches = stryMutAct_9fa48("760") ? allMismatches : (stryCov_9fa48("760"), allMismatches.filter(stryMutAct_9fa48("761") ? () => undefined : (stryCov_9fa48("761"), m => stryMutAct_9fa48("762") ? ignored.includes(m.selector) : (stryCov_9fa48("762"), !ignored.includes(m.selector)))));
            chrome.runtime.sendMessage(stryMutAct_9fa48("763") ? {} : (stryCov_9fa48("763"), {
              type: stryMutAct_9fa48("764") ? "" : (stryCov_9fa48("764"), "HYDRALENS_RESULTS"),
              payload: stryMutAct_9fa48("765") ? {} : (stryCov_9fa48("765"), {
                mismatches: activeMismatches,
                totalFound: allMismatches.length
              })
            })).catch(() => {});
            activeMismatches.forEach(mismatch => {
              if (stryMutAct_9fa48("766")) {
                {}
              } else {
                stryCov_9fa48("766");
                const clientEl = document.querySelector(mismatch.selector) as HTMLElement | null;
                if (stryMutAct_9fa48("768") ? false : stryMutAct_9fa48("767") ? true : (stryCov_9fa48("767", "768"), clientEl)) drawOverlay(clientEl, mismatch);
              }
            });
          }
        });
      }
    } catch (error: any) {
      if (stryMutAct_9fa48("769")) {
        {}
      } else {
        stryCov_9fa48("769");
        const message = (stryMutAct_9fa48("772") ? error.name !== "AbortError" : stryMutAct_9fa48("771") ? false : stryMutAct_9fa48("770") ? true : (stryCov_9fa48("770", "771", "772"), error.name === (stryMutAct_9fa48("773") ? "" : (stryCov_9fa48("773"), "AbortError")))) ? stryMutAct_9fa48("774") ? "" : (stryCov_9fa48("774"), "Fetch timed out (6s). The server may be too slow or streaming infinitely.") : stryMutAct_9fa48("775") ? error.message && "Unknown error during scan." : (stryCov_9fa48("775"), error.message ?? (stryMutAct_9fa48("776") ? "" : (stryCov_9fa48("776"), "Unknown error during scan.")));
        console.error(stryMutAct_9fa48("777") ? "" : (stryCov_9fa48("777"), "[HydraLens]"), message);
        chrome.runtime.sendMessage(stryMutAct_9fa48("778") ? {} : (stryCov_9fa48("778"), {
          type: stryMutAct_9fa48("779") ? "" : (stryCov_9fa48("779"), "HYDRALENS_ERROR"),
          payload: stryMutAct_9fa48("780") ? {} : (stryCov_9fa48("780"), {
            message
          })
        })).catch(() => {});
      }
    } finally {
      if (stryMutAct_9fa48("781")) {
        {}
      } else {
        stryCov_9fa48("781");
        clearTimeout(timeoutId);
        // FIX: reset immediately in finally; no arbitrary 2s delay that could cause stuck state
        isScanning = stryMutAct_9fa48("782") ? true : (stryCov_9fa48("782"), false);
      }
    }
  }
}
chrome.runtime.onMessage.addListener(msg => {
  if (stryMutAct_9fa48("783")) {
    {}
  } else {
    stryCov_9fa48("783");
    if (stryMutAct_9fa48("786") ? msg.type !== "HYDRALENS_RUN" : stryMutAct_9fa48("785") ? false : stryMutAct_9fa48("784") ? true : (stryCov_9fa48("784", "785", "786"), msg.type === (stryMutAct_9fa48("787") ? "" : (stryCov_9fa48("787"), "HYDRALENS_RUN")))) runHydraLens();
    if (stryMutAct_9fa48("790") ? msg.type !== "HYDRALENS_CLEAR" : stryMutAct_9fa48("789") ? false : stryMutAct_9fa48("788") ? true : (stryCov_9fa48("788", "789", "790"), msg.type === (stryMutAct_9fa48("791") ? "" : (stryCov_9fa48("791"), "HYDRALENS_CLEAR")))) {
      if (stryMutAct_9fa48("792")) {
        {}
      } else {
        stryCov_9fa48("792");
        clearOverlays();
        isScanning = stryMutAct_9fa48("793") ? true : (stryCov_9fa48("793"), false);
      }
    }
  }
});