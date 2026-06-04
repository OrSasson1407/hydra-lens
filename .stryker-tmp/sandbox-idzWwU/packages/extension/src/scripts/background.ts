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
console.log(stryMutAct_9fa48("627") ? "" : (stryCov_9fa48("627"), "[HydraLens] Background worker started."));
function shouldAutoScan(): Promise<boolean> {
  if (stryMutAct_9fa48("628")) {
    {}
  } else {
    stryCov_9fa48("628");
    return new Promise(resolve => {
      if (stryMutAct_9fa48("629")) {
        {}
      } else {
        stryCov_9fa48("629");
        chrome.storage.local.get(stryMutAct_9fa48("630") ? [] : (stryCov_9fa48("630"), [stryMutAct_9fa48("631") ? "" : (stryCov_9fa48("631"), "autoScan")]), stryMutAct_9fa48("632") ? () => undefined : (stryCov_9fa48("632"), res => resolve(stryMutAct_9fa48("635") ? res.autoScan === false : stryMutAct_9fa48("634") ? false : stryMutAct_9fa48("633") ? true : (stryCov_9fa48("633", "634", "635"), res.autoScan !== (stryMutAct_9fa48("636") ? true : (stryCov_9fa48("636"), false))))));
      }
    });
  }
}

// SPA navigations
chrome.webNavigation.onHistoryStateUpdated.addListener(async details => {
  if (stryMutAct_9fa48("637")) {
    {}
  } else {
    stryCov_9fa48("637");
    if (stryMutAct_9fa48("640") ? false : stryMutAct_9fa48("639") ? true : stryMutAct_9fa48("638") ? await shouldAutoScan() : (stryCov_9fa48("638", "639", "640"), !(await shouldAutoScan()))) return;
    setTimeout(() => {
      if (stryMutAct_9fa48("641")) {
        {}
      } else {
        stryCov_9fa48("641");
        chrome.tabs.sendMessage(details.tabId, stryMutAct_9fa48("642") ? {} : (stryCov_9fa48("642"), {
          type: stryMutAct_9fa48("643") ? "" : (stryCov_9fa48("643"), "HYDRALENS_RUN")
        })).catch(() => {});
      }
    }, 1000);
  }
});

// Full page loads (main frame only)
chrome.webNavigation.onCompleted.addListener(async details => {
  if (stryMutAct_9fa48("644")) {
    {}
  } else {
    stryCov_9fa48("644");
    if (stryMutAct_9fa48("647") ? details.frameId === 0 : stryMutAct_9fa48("646") ? false : stryMutAct_9fa48("645") ? true : (stryCov_9fa48("645", "646", "647"), details.frameId !== 0)) return;
    if (stryMutAct_9fa48("650") ? false : stryMutAct_9fa48("649") ? true : stryMutAct_9fa48("648") ? await shouldAutoScan() : (stryCov_9fa48("648", "649", "650"), !(await shouldAutoScan()))) return;
    setTimeout(() => {
      if (stryMutAct_9fa48("651")) {
        {}
      } else {
        stryCov_9fa48("651");
        chrome.tabs.sendMessage(details.tabId, stryMutAct_9fa48("652") ? {} : (stryCov_9fa48("652"), {
          type: stryMutAct_9fa48("653") ? "" : (stryCov_9fa48("653"), "HYDRALENS_RUN")
        })).catch(() => {});
      }
    }, 1500);
  }
});

// Q: keyboard shortcut (Alt+Shift+H defined in manifest commands)
chrome.commands.onCommand.addListener(command => {
  if (stryMutAct_9fa48("654")) {
    {}
  } else {
    stryCov_9fa48("654");
    if (stryMutAct_9fa48("657") ? command !== "trigger-scan" : stryMutAct_9fa48("656") ? false : stryMutAct_9fa48("655") ? true : (stryCov_9fa48("655", "656", "657"), command === (stryMutAct_9fa48("658") ? "" : (stryCov_9fa48("658"), "trigger-scan")))) {
      if (stryMutAct_9fa48("659")) {
        {}
      } else {
        stryCov_9fa48("659");
        chrome.tabs.query(stryMutAct_9fa48("660") ? {} : (stryCov_9fa48("660"), {
          active: stryMutAct_9fa48("661") ? false : (stryCov_9fa48("661"), true),
          currentWindow: stryMutAct_9fa48("662") ? false : (stryCov_9fa48("662"), true)
        }), tabs => {
          if (stryMutAct_9fa48("663")) {
            {}
          } else {
            stryCov_9fa48("663");
            const tabId = stryMutAct_9fa48("664") ? tabs[0].id : (stryCov_9fa48("664"), tabs[0]?.id);
            if (stryMutAct_9fa48("666") ? false : stryMutAct_9fa48("665") ? true : (stryCov_9fa48("665", "666"), tabId)) chrome.tabs.sendMessage(tabId, stryMutAct_9fa48("667") ? {} : (stryCov_9fa48("667"), {
              type: stryMutAct_9fa48("668") ? "" : (stryCov_9fa48("668"), "HYDRALENS_RUN")
            })).catch(() => {});
          }
        });
      }
    }
  }
});

// Auto-scan toggle message from popup
chrome.runtime.onMessage.addListener(msg => {
  if (stryMutAct_9fa48("669")) {
    {}
  } else {
    stryCov_9fa48("669");
    if (stryMutAct_9fa48("672") ? msg.type !== "HYDRALENS_SET_AUTOSCAN" : stryMutAct_9fa48("671") ? false : stryMutAct_9fa48("670") ? true : (stryCov_9fa48("670", "671", "672"), msg.type === (stryMutAct_9fa48("673") ? "" : (stryCov_9fa48("673"), "HYDRALENS_SET_AUTOSCAN")))) {
      if (stryMutAct_9fa48("674")) {
        {}
      } else {
        stryCov_9fa48("674");
        chrome.storage.local.set(stryMutAct_9fa48("675") ? {} : (stryCov_9fa48("675"), {
          autoScan: msg.enabled
        }));
      }
    }
  }
});