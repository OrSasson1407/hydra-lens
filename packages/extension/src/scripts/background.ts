console.log("[HydraLens] Background worker started.");

function shouldAutoScan(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["autoScan"], (res) => resolve(res.autoScan !== false));
  });
}

// SPA navigations
chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
  if (!(await shouldAutoScan())) return;
  setTimeout(() => {
    chrome.tabs.sendMessage(details.tabId, { type: "HYDRALENS_RUN" }).catch(() => {});
  }, 1000);
});

// Full page loads (main frame only)
chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return;
  if (!(await shouldAutoScan())) return;
  setTimeout(() => {
    chrome.tabs.sendMessage(details.tabId, { type: "HYDRALENS_RUN" }).catch(() => {});
  }, 1500);
});

// Q: keyboard shortcut (Alt+Shift+H defined in manifest commands)
chrome.commands.onCommand.addListener((command) => {
  if (command === "trigger-scan") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) chrome.tabs.sendMessage(tabId, { type: "HYDRALENS_RUN" }).catch(() => {});
    });
  }
});

// Auto-scan toggle message from popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "HYDRALENS_SET_AUTOSCAN") {
    chrome.storage.local.set({ autoScan: msg.enabled });
  }
});
