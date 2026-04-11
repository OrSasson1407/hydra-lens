// HydraLens Background Service Worker
// Relays messages between the popup and the content script on the active tab.

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  // Messages from the popup → forward to the active tab's content script
  if (msg.type === 'HYDRALENS_RUN' || msg.type === 'HYDRALENS_CLEAR') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId == null) return;
      chrome.tabs.sendMessage(tabId, msg).catch(() => {
        // Content script may not be injected yet — ignore
      });
    });
  }

  // Keep the message channel open for async responses
  sendResponse({});
  return true;
});

// Relay results FROM the content script → to the popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'HYDRALENS_RESULTS' || msg.type === 'HYDRALENS_ERROR') {
    // Re-broadcast so the popup (which can't receive from content directly) gets it
    chrome.runtime.sendMessage(msg).catch(() => {});
  }
});
