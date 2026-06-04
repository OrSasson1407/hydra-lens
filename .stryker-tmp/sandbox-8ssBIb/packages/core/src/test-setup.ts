// @ts-nocheck
// Polyfill CSS.escape which jsdom doesn't implement
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
if (stryMutAct_9fa48("453") ? typeof CSS === 'undefined' && typeof CSS.escape === 'undefined' : stryMutAct_9fa48("452") ? false : stryMutAct_9fa48("451") ? true : (stryCov_9fa48("451", "452", "453"), (stryMutAct_9fa48("455") ? typeof CSS !== 'undefined' : stryMutAct_9fa48("454") ? false : (stryCov_9fa48("454", "455"), typeof CSS === (stryMutAct_9fa48("456") ? "" : (stryCov_9fa48("456"), 'undefined')))) || (stryMutAct_9fa48("458") ? typeof CSS.escape !== 'undefined' : stryMutAct_9fa48("457") ? false : (stryCov_9fa48("457", "458"), typeof CSS.escape === (stryMutAct_9fa48("459") ? "" : (stryCov_9fa48("459"), 'undefined')))))) {
  if (stryMutAct_9fa48("460")) {
    {}
  } else {
    stryCov_9fa48("460");
    //  - polyfilling missing jsdom global
    globalThis.CSS = stryMutAct_9fa48("461") ? {} : (stryCov_9fa48("461"), {
      escape: stryMutAct_9fa48("462") ? () => undefined : (stryCov_9fa48("462"), (value: string) => value.replace(stryMutAct_9fa48("464") ? /([^\W-])/g : stryMutAct_9fa48("463") ? /([\w-])/g : (stryCov_9fa48("463", "464"), /([^\w-])/g), stryMutAct_9fa48("465") ? "" : (stryCov_9fa48("465"), '\\$1')))
    });
  }
}