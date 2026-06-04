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
const toggle = document.getElementById("autoScanToggle") as HTMLInputElement;
chrome.storage.local.get(stryMutAct_9fa48("602") ? [] : (stryCov_9fa48("602"), [stryMutAct_9fa48("603") ? "" : (stryCov_9fa48("603"), "autoScan")]), res => {
  if (stryMutAct_9fa48("604")) {
    {}
  } else {
    stryCov_9fa48("604");
    toggle.checked = stryMutAct_9fa48("607") ? res.autoScan === false : stryMutAct_9fa48("606") ? false : stryMutAct_9fa48("605") ? true : (stryCov_9fa48("605", "606", "607"), res.autoScan !== (stryMutAct_9fa48("608") ? true : (stryCov_9fa48("608"), false)));
  }
});
toggle.addEventListener(stryMutAct_9fa48("609") ? "" : (stryCov_9fa48("609"), "change"), e => {
  if (stryMutAct_9fa48("610")) {
    {}
  } else {
    stryCov_9fa48("610");
    const enabled = (e.target as HTMLInputElement).checked;
    chrome.runtime.sendMessage(stryMutAct_9fa48("611") ? {} : (stryCov_9fa48("611"), {
      type: stryMutAct_9fa48("612") ? "" : (stryCov_9fa48("612"), "HYDRALENS_SET_AUTOSCAN"),
      enabled
    }));
  }
});
stryMutAct_9fa48("613") ? document.getElementById("scanNowBtn").addEventListener("click", () => {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, tabs => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "HYDRALENS_RUN"
      });
      window.close();
    }
  });
}) : (stryCov_9fa48("613"), document.getElementById(stryMutAct_9fa48("614") ? "" : (stryCov_9fa48("614"), "scanNowBtn"))?.addEventListener(stryMutAct_9fa48("615") ? "" : (stryCov_9fa48("615"), "click"), () => {
  if (stryMutAct_9fa48("616")) {
    {}
  } else {
    stryCov_9fa48("616");
    chrome.tabs.query(stryMutAct_9fa48("617") ? {} : (stryCov_9fa48("617"), {
      active: stryMutAct_9fa48("618") ? false : (stryCov_9fa48("618"), true),
      currentWindow: stryMutAct_9fa48("619") ? false : (stryCov_9fa48("619"), true)
    }), tabs => {
      if (stryMutAct_9fa48("620")) {
        {}
      } else {
        stryCov_9fa48("620");
        if (stryMutAct_9fa48("623") ? tabs[0].id : stryMutAct_9fa48("622") ? false : stryMutAct_9fa48("621") ? true : (stryCov_9fa48("621", "622", "623"), tabs[0]?.id)) {
          if (stryMutAct_9fa48("624")) {
            {}
          } else {
            stryCov_9fa48("624");
            chrome.tabs.sendMessage(tabs[0].id, stryMutAct_9fa48("625") ? {} : (stryCov_9fa48("625"), {
              type: stryMutAct_9fa48("626") ? "" : (stryCov_9fa48("626"), "HYDRALENS_RUN")
            }));
            window.close();
          }
        }
      }
    });
  }
}));