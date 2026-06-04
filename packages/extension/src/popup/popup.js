"use strict";
const toggle = document.getElementById("autoScanToggle");
chrome.storage.local.get(["autoScan"], (res) => {
    toggle.checked = res.autoScan !== false;
});
toggle.addEventListener("change", (e) => {
    const enabled = e.target.checked;
    chrome.runtime.sendMessage({ type: "HYDRALENS_SET_AUTOSCAN", enabled });
});
document.getElementById("scanNowBtn")?.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, { type: "HYDRALENS_RUN" });
            window.close();
        }
    });
});
