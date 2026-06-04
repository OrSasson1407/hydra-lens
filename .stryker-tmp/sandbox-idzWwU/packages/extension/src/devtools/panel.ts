// @ts-nocheck
// FIX: results are persisted to chrome.storage.session so the panel shows
//      the last scan immediately when DevTools is opened after a scan ran.
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
const STORAGE_KEY = stryMutAct_9fa48("471") ? "" : (stryCov_9fa48("471"), "hydralens_last_results");
let currentMismatches: any[] = stryMutAct_9fa48("472") ? ["Stryker was here"] : (stryCov_9fa48("472"), []);

// ── Safe DOM text setter (replaces innerHTML to prevent XSS) ─────────────────
function setText(el: Element, text: string): void {
  if (stryMutAct_9fa48("473")) {
    {}
  } else {
    stryCov_9fa48("473");
    el.textContent = text;
  }
}
function createEl<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, text?: string): HTMLElementTagNameMap[K] {
  if (stryMutAct_9fa48("474")) {
    {}
  } else {
    stryCov_9fa48("474");
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    if (stryMutAct_9fa48("477") ? text === undefined : stryMutAct_9fa48("476") ? false : stryMutAct_9fa48("475") ? true : (stryCov_9fa48("475", "476", "477"), text !== undefined)) el.textContent = text;
    return el;
  }
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderResults(filter = stryMutAct_9fa48("478") ? "" : (stryCov_9fa48("478"), "all")): void {
  if (stryMutAct_9fa48("479")) {
    {}
  } else {
    stryCov_9fa48("479");
    const container = document.getElementById(stryMutAct_9fa48("480") ? "" : (stryCov_9fa48("480"), "results"))!;
    container.innerHTML = stryMutAct_9fa48("481") ? "Stryker was here!" : (stryCov_9fa48("481"), "");
    const filtered = (stryMutAct_9fa48("484") ? filter !== "all" : stryMutAct_9fa48("483") ? false : stryMutAct_9fa48("482") ? true : (stryCov_9fa48("482", "483", "484"), filter === (stryMutAct_9fa48("485") ? "" : (stryCov_9fa48("485"), "all")))) ? currentMismatches : (stryMutAct_9fa48("488") ? filter !== "critical" : stryMutAct_9fa48("487") ? false : stryMutAct_9fa48("486") ? true : (stryCov_9fa48("486", "487", "488"), filter === (stryMutAct_9fa48("489") ? "" : (stryCov_9fa48("489"), "critical")))) ? stryMutAct_9fa48("490") ? currentMismatches : (stryCov_9fa48("490"), currentMismatches.filter(stryMutAct_9fa48("491") ? () => undefined : (stryCov_9fa48("491"), m => (stryMutAct_9fa48("492") ? [] : (stryCov_9fa48("492"), [stryMutAct_9fa48("493") ? "" : (stryCov_9fa48("493"), "critical"), stryMutAct_9fa48("494") ? "" : (stryCov_9fa48("494"), "security")])).includes(m.severity)))) : stryMutAct_9fa48("495") ? currentMismatches : (stryCov_9fa48("495"), currentMismatches.filter(stryMutAct_9fa48("496") ? () => undefined : (stryCov_9fa48("496"), m => stryMutAct_9fa48("499") ? m.severity !== filter : stryMutAct_9fa48("498") ? false : stryMutAct_9fa48("497") ? true : (stryCov_9fa48("497", "498", "499"), m.severity === filter))));
    if (stryMutAct_9fa48("502") ? filtered.length !== 0 : stryMutAct_9fa48("501") ? false : stryMutAct_9fa48("500") ? true : (stryCov_9fa48("500", "501", "502"), filtered.length === 0)) {
      if (stryMutAct_9fa48("503")) {
        {}
      } else {
        stryCov_9fa48("503");
        container.appendChild(createEl(stryMutAct_9fa48("504") ? "" : (stryCov_9fa48("504"), "div"), {}, stryMutAct_9fa48("505") ? "" : (stryCov_9fa48("505"), "No issues found.")));
        return;
      }
    }
    for (const m of filtered) {
      if (stryMutAct_9fa48("506")) {
        {}
      } else {
        stryCov_9fa48("506");
        // FIX: build DOM nodes instead of using innerHTML to prevent XSS from
        //      crafted mismatch payloads injected via chrome.runtime.sendMessage
        const card = createEl(stryMutAct_9fa48("507") ? "" : (stryCov_9fa48("507"), "div"), stryMutAct_9fa48("508") ? {} : (stryCov_9fa48("508"), {
          class: stryMutAct_9fa48("509") ? `` : (stryCov_9fa48("509"), `issue ${m.severity}`)
        }));
        const header = createEl(stryMutAct_9fa48("510") ? "" : (stryCov_9fa48("510"), "strong"));
        header.textContent = stryMutAct_9fa48("511") ? `` : (stryCov_9fa48("511"), `[${stryMutAct_9fa48("512") ? m.severity.toLowerCase() : (stryCov_9fa48("512"), m.severity.toUpperCase())}] ${stryMutAct_9fa48("515") ? m.componentName && "Unknown" : stryMutAct_9fa48("514") ? false : stryMutAct_9fa48("513") ? true : (stryCov_9fa48("513", "514", "515"), m.componentName || (stryMutAct_9fa48("516") ? "" : (stryCov_9fa48("516"), "Unknown")))}`);
        card.appendChild(header);
        card.appendChild(createEl(stryMutAct_9fa48("517") ? "" : (stryCov_9fa48("517"), "br")));
        const selectorLine = createEl(stryMutAct_9fa48("518") ? "" : (stryCov_9fa48("518"), "span"));
        selectorLine.appendChild(createEl(stryMutAct_9fa48("519") ? "" : (stryCov_9fa48("519"), "em"), {}, stryMutAct_9fa48("520") ? "" : (stryCov_9fa48("520"), "Selector: ")));
        selectorLine.appendChild(document.createTextNode(m.selector));
        card.appendChild(selectorLine);
        card.appendChild(createEl(stryMutAct_9fa48("521") ? "" : (stryCov_9fa48("521"), "br")));
        const reasonLine = createEl(stryMutAct_9fa48("522") ? "" : (stryCov_9fa48("522"), "span"));
        reasonLine.appendChild(createEl(stryMutAct_9fa48("523") ? "" : (stryCov_9fa48("523"), "em"), {}, stryMutAct_9fa48("524") ? "" : (stryCov_9fa48("524"), "Reason: ")));
        reasonLine.appendChild(document.createTextNode(m.severityReason));
        card.appendChild(reasonLine);
        const adviceBox = createEl(stryMutAct_9fa48("525") ? "" : (stryCov_9fa48("525"), "div"), stryMutAct_9fa48("526") ? {} : (stryCov_9fa48("526"), {
          style: stryMutAct_9fa48("527") ? "" : (stryCov_9fa48("527"), "margin-top:5px;padding:5px;background:#111;")
        }));
        const adviceLabel = createEl(stryMutAct_9fa48("528") ? "" : (stryCov_9fa48("528"), "strong"), {}, stryMutAct_9fa48("529") ? "" : (stryCov_9fa48("529"), "Advice: "));
        adviceBox.appendChild(adviceLabel);
        adviceBox.appendChild(document.createTextNode(m.advice));
        adviceBox.appendChild(createEl(stryMutAct_9fa48("530") ? "" : (stryCov_9fa48("530"), "br")));
        adviceBox.appendChild(createEl(stryMutAct_9fa48("531") ? "" : (stryCov_9fa48("531"), "code"), {}, m.fixSnippet));
        card.appendChild(adviceBox);
        const ignoreBtn = createEl(stryMutAct_9fa48("532") ? "" : (stryCov_9fa48("532"), "button"), stryMutAct_9fa48("533") ? {} : (stryCov_9fa48("533"), {
          "data-selector": m.selector,
          style: stryMutAct_9fa48("534") ? "" : (stryCov_9fa48("534"), "margin-top:8px;background:#444;")
        }), stryMutAct_9fa48("535") ? "" : (stryCov_9fa48("535"), "Ignore Selector"));
        ignoreBtn.addEventListener(stryMutAct_9fa48("536") ? "" : (stryCov_9fa48("536"), "click"), e => {
          if (stryMutAct_9fa48("537")) {
            {}
          } else {
            stryCov_9fa48("537");
            const selector = (e.target as HTMLElement).getAttribute(stryMutAct_9fa48("538") ? "" : (stryCov_9fa48("538"), "data-selector"));
            chrome.storage.local.get(stryMutAct_9fa48("539") ? [] : (stryCov_9fa48("539"), [stryMutAct_9fa48("540") ? "" : (stryCov_9fa48("540"), "ignoredSelectors")]), res => {
              if (stryMutAct_9fa48("541")) {
                {}
              } else {
                stryCov_9fa48("541");
                const ignored: string[] = stryMutAct_9fa48("542") ? res.ignoredSelectors && [] : (stryCov_9fa48("542"), res.ignoredSelectors ?? (stryMutAct_9fa48("543") ? ["Stryker was here"] : (stryCov_9fa48("543"), [])));
                if (stryMutAct_9fa48("546") ? selector || !ignored.includes(selector) : stryMutAct_9fa48("545") ? false : stryMutAct_9fa48("544") ? true : (stryCov_9fa48("544", "545", "546"), selector && (stryMutAct_9fa48("547") ? ignored.includes(selector) : (stryCov_9fa48("547"), !ignored.includes(selector))))) ignored.push(selector);
                chrome.storage.local.set(stryMutAct_9fa48("548") ? {} : (stryCov_9fa48("548"), {
                  ignoredSelectors: ignored
                }), () => {
                  if (stryMutAct_9fa48("549")) {
                    {}
                  } else {
                    stryCov_9fa48("549");
                    (e.target as HTMLElement).textContent = stryMutAct_9fa48("550") ? "" : (stryCov_9fa48("550"), "Ignored");
                  }
                });
              }
            });
          }
        });
        card.appendChild(ignoreBtn);
        container.appendChild(card);
      }
    }
  }
}

// ── Persist & restore results across DevTools open/close ─────────────────────
function saveResults(mismatches: any[]): void {
  if (stryMutAct_9fa48("551")) {
    {}
  } else {
    stryCov_9fa48("551");
    // chrome.storage.session is cleared when the browser session ends (tab close / browser restart)
    chrome.storage.session.set(stryMutAct_9fa48("552") ? {} : (stryCov_9fa48("552"), {
      [STORAGE_KEY]: mismatches
    }));
  }
}
function restoreResults(): void {
  if (stryMutAct_9fa48("553")) {
    {}
  } else {
    stryCov_9fa48("553");
    chrome.storage.session.get(stryMutAct_9fa48("554") ? [] : (stryCov_9fa48("554"), [STORAGE_KEY]), res => {
      if (stryMutAct_9fa48("555")) {
        {}
      } else {
        stryCov_9fa48("555");
        if (stryMutAct_9fa48("558") ? res[STORAGE_KEY].length : stryMutAct_9fa48("557") ? false : stryMutAct_9fa48("556") ? true : (stryCov_9fa48("556", "557", "558"), res[STORAGE_KEY]?.length)) {
          if (stryMutAct_9fa48("559")) {
            {}
          } else {
            stryCov_9fa48("559");
            currentMismatches = res[STORAGE_KEY];
            renderResults((document.getElementById("severityFilter") as HTMLSelectElement).value);
          }
        }
      }
    });
  }
}

// ── Message listener ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener(msg => {
  if (stryMutAct_9fa48("560")) {
    {}
  } else {
    stryCov_9fa48("560");
    if (stryMutAct_9fa48("563") ? msg.type !== "HYDRALENS_RESULTS" : stryMutAct_9fa48("562") ? false : stryMutAct_9fa48("561") ? true : (stryCov_9fa48("561", "562", "563"), msg.type === (stryMutAct_9fa48("564") ? "" : (stryCov_9fa48("564"), "HYDRALENS_RESULTS")))) {
      if (stryMutAct_9fa48("565")) {
        {}
      } else {
        stryCov_9fa48("565");
        currentMismatches = msg.payload.mismatches;
        saveResults(currentMismatches);
        renderResults((document.getElementById("severityFilter") as HTMLSelectElement).value);
      }
    }
    if (stryMutAct_9fa48("568") ? msg.type !== "HYDRALENS_ERROR" : stryMutAct_9fa48("567") ? false : stryMutAct_9fa48("566") ? true : (stryCov_9fa48("566", "567", "568"), msg.type === (stryMutAct_9fa48("569") ? "" : (stryCov_9fa48("569"), "HYDRALENS_ERROR")))) {
      if (stryMutAct_9fa48("570")) {
        {}
      } else {
        stryCov_9fa48("570");
        const container = document.getElementById(stryMutAct_9fa48("571") ? "" : (stryCov_9fa48("571"), "results"))!;
        container.innerHTML = stryMutAct_9fa48("572") ? "Stryker was here!" : (stryCov_9fa48("572"), "");
        container.appendChild(createEl(stryMutAct_9fa48("573") ? "" : (stryCov_9fa48("573"), "div"), stryMutAct_9fa48("574") ? {} : (stryCov_9fa48("574"), {
          style: stryMutAct_9fa48("575") ? "" : (stryCov_9fa48("575"), "color:#ef4444;")
        }), stryMutAct_9fa48("576") ? `` : (stryCov_9fa48("576"), `Error: ${msg.payload.message}`)));
      }
    }
  }
});

// ── Toolbar event listeners ───────────────────────────────────────────────────
stryMutAct_9fa48("577") ? document.getElementById("refreshBtn").addEventListener("click", () => {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, tabs => {
    if (tabs[0]?.id) chrome.tabs.sendMessage(tabs[0].id, {
      type: "HYDRALENS_RUN"
    });
  });
}) : (stryCov_9fa48("577"), document.getElementById(stryMutAct_9fa48("578") ? "" : (stryCov_9fa48("578"), "refreshBtn"))?.addEventListener(stryMutAct_9fa48("579") ? "" : (stryCov_9fa48("579"), "click"), () => {
  if (stryMutAct_9fa48("580")) {
    {}
  } else {
    stryCov_9fa48("580");
    chrome.tabs.query(stryMutAct_9fa48("581") ? {} : (stryCov_9fa48("581"), {
      active: stryMutAct_9fa48("582") ? false : (stryCov_9fa48("582"), true),
      currentWindow: stryMutAct_9fa48("583") ? false : (stryCov_9fa48("583"), true)
    }), tabs => {
      if (stryMutAct_9fa48("584")) {
        {}
      } else {
        stryCov_9fa48("584");
        if (stryMutAct_9fa48("587") ? tabs[0].id : stryMutAct_9fa48("586") ? false : stryMutAct_9fa48("585") ? true : (stryCov_9fa48("585", "586", "587"), tabs[0]?.id)) chrome.tabs.sendMessage(tabs[0].id, stryMutAct_9fa48("588") ? {} : (stryCov_9fa48("588"), {
          type: stryMutAct_9fa48("589") ? "" : (stryCov_9fa48("589"), "HYDRALENS_RUN")
        }));
      }
    });
  }
}));
stryMutAct_9fa48("590") ? document.getElementById("severityFilter").addEventListener("change", e => {
  renderResults((e.target as HTMLSelectElement).value);
}) : (stryCov_9fa48("590"), document.getElementById(stryMutAct_9fa48("591") ? "" : (stryCov_9fa48("591"), "severityFilter"))?.addEventListener(stryMutAct_9fa48("592") ? "" : (stryCov_9fa48("592"), "change"), e => {
  if (stryMutAct_9fa48("593")) {
    {}
  } else {
    stryCov_9fa48("593");
    renderResults((e.target as HTMLSelectElement).value);
  }
}));
stryMutAct_9fa48("594") ? document.getElementById("clearIgnoreBtn").addEventListener("click", () => {
  chrome.storage.local.set({
    ignoredSelectors: []
  }, () => alert("Ignore list cleared!"));
}) : (stryCov_9fa48("594"), document.getElementById(stryMutAct_9fa48("595") ? "" : (stryCov_9fa48("595"), "clearIgnoreBtn"))?.addEventListener(stryMutAct_9fa48("596") ? "" : (stryCov_9fa48("596"), "click"), () => {
  if (stryMutAct_9fa48("597")) {
    {}
  } else {
    stryCov_9fa48("597");
    chrome.storage.local.set(stryMutAct_9fa48("598") ? {} : (stryCov_9fa48("598"), {
      ignoredSelectors: stryMutAct_9fa48("599") ? ["Stryker was here"] : (stryCov_9fa48("599"), [])
    }), stryMutAct_9fa48("600") ? () => undefined : (stryCov_9fa48("600"), () => alert(stryMutAct_9fa48("601") ? "" : (stryCov_9fa48("601"), "Ignore list cleared!"))));
  }
}));

// FIX: restore last scan results when the panel mounts (fixes blank-panel-on-open)
restoreResults();