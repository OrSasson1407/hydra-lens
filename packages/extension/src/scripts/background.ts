// HydraLens Background Service Worker
// Relays messages between the popup and the content script on the active tab.

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'HYDRALENS_RUN' || msg.type === 'HYDRALENS_CLEAR') {
    // Popup → forward to the active tab's content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId == null) return;
      chrome.tabs.sendMessage(tabId, msg).catch(() => {
        // Content script may not be injected yet — ignore
      });
    });
  } else if (msg.type === 'HYDRALENS_RESULTS' || msg.type === 'HYDRALENS_ERROR') {
    // Content script → re-broadcast to the popup
    // (popup cannot receive messages from content scripts directly)
    chrome.runtime.sendMessage(msg).catch(() => {});
  }

  // Keep the message channel open for async responses
  sendResponse({});
  return true;
});