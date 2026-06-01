console.log("HydraLens Background Worker Started.");

// Listen for Single Page App (SPA) navigations and auto-trigger scans!
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  // Add a small delay to let the new route hydrate
  setTimeout(() => {
    chrome.tabs.sendMessage(details.tabId, { type: "HYDRALENS_RUN" }).catch(() => {});
  }, 1000);
});
