console.log("[HydraLens] Background worker started.");

// Auto-scan is ON by default. The user can toggle it off via chrome.storage.local
// by setting { autoScan: false }. The popup could expose this as a settings toggle.

function shouldAutoScan(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["autoScan"], (res) => {
      // Default to true if the key has never been set
      resolve(res.autoScan !== false);
    });
  });
}

// SPA navigations (pushState / replaceState)
chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
  if (!(await shouldAutoScan())) {
    console.log("[HydraLens] Auto-scan is disabled. Skipping SPA navigation scan.");
    return;
  }
  setTimeout(() => {
    chrome.tabs.sendMessage(details.tabId, { type: "HYDRALENS_RUN" }).catch(() => {});
  }, 1000);
});

// Full page loads
chrome.webNavigation.onCompleted.addListener(async (details) => {
  // Only fire on the main frame (frameId 0), not iframes
  if (details.frameId !== 0) return;
  if (!(await shouldAutoScan())) {
    console.log("[HydraLens] Auto-scan is disabled. Skipping full-page load scan.");
    return;
  }
  setTimeout(() => {
    chrome.tabs.sendMessage(details.tabId, { type: "HYDRALENS_RUN" }).catch(() => {});
  }, 1500);
});

// Listen for toggle messages from the popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "HYDRALENS_SET_AUTOSCAN") {
    chrome.storage.local.set({ autoScan: msg.enabled }, () => {
      console.log(`[HydraLens] Auto-scan ${msg.enabled ? "enabled" : "disabled"}.`);
    });
  }
});
