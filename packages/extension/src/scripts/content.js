import { detectMismatchesAsync } from "@hydra-lens/core";
// ?? SHADOW DOM SETUP ??????????????????????????????????????????????????????????
const HOST_ID = "hydra-lens-host";
let shadowRoot = null;
function getShadowRoot() {
    // FIX: always re-use an existing host+shadow instead of creating a duplicate
    let host = document.getElementById(HOST_ID);
    if (host) {
        if (!shadowRoot) {
            // Host exists but our module-level reference was lost (e.g. after a soft nav).
            // shadowRoot on the host is permanent once attached, so we can recover it.
            shadowRoot = host.shadowRoot;
        }
        return shadowRoot;
    }
    host = document.createElement("div");
    host.id = HOST_ID;
    host.style.cssText =
        "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;pointer-events:none;";
    document.documentElement.appendChild(host);
    shadowRoot = host.attachShadow({ mode: "open" });
    return shadowRoot;
}
// ?? OVERLAY STATE ?????????????????????????????????????????????????????????????
const overlayElements = [];
const resizeObservers = [];
const windowListeners = [];
// FIX: isScanning is set to true only inside the try block so a pre-try throw
//      never permanently locks the extension
let isScanning = false;
function clearOverlays() {
    // Remove per-overlay window listeners before clearing elements
    for (const { scroll, resize } of windowListeners) {
        window.removeEventListener("scroll", scroll);
        window.removeEventListener("resize", resize);
    }
    windowListeners.length = 0;
    overlayElements.forEach((el) => el.remove());
    overlayElements.length = 0;
    resizeObservers.forEach((ro) => ro.disconnect());
    resizeObservers.length = 0;
    const host = document.getElementById(HOST_ID);
    if (host)
        host.remove();
    shadowRoot = null;
}
const SEVERITY_STYLE = {
    security: { border: "#ef4444", bg: "rgba(239,68,68,0.20)", label: "SECURITY" },
    critical: { border: "#f97316", bg: "rgba(249,115,22,0.15)", label: "CRITICAL" },
    warning: { border: "#eab308", bg: "rgba(234,179,8,0.15)", label: "WARNING" },
    info: { border: "#3b82f6", bg: "rgba(59,130,246,0.15)", label: "INFO" },
};
function drawOverlay(element, mismatch) {
    const root = getShadowRoot();
    const style = SEVERITY_STYLE[mismatch.severity];
    const overlay = document.createElement("div");
    overlay.style.cssText = `
    position:fixed;pointer-events:none;
    border:2px dashed ${style.border};background:${style.bg};
    box-sizing:border-box;transition:top 0.1s,left 0.1s,width 0.1s,height 0.1s;
  `;
    const tooltip = document.createElement("div");
    tooltip.style.cssText = `
    position:absolute;bottom:calc(100% + 4px);left:0;
    background:#111827;color:#fff;padding:3px 8px;
    font-size:11px;font-family:monospace;white-space:nowrap;
    border-left:3px solid ${style.border};border-radius:0 3px 3px 0;
  `;
    tooltip.textContent = `[${style.label}] <${mismatch.componentName || "element"}>`;
    overlay.appendChild(tooltip);
    root.appendChild(overlay);
    overlayElements.push(overlay);
    function reposition() {
        const rect = element.getBoundingClientRect();
        overlay.style.top = `${rect.top - 2}px`;
        overlay.style.left = `${rect.left - 2}px`;
        overlay.style.width = `${rect.width + 4}px`;
        overlay.style.height = `${rect.height + 4}px`;
    }
    reposition();
    // FIX: store handler references so clearOverlays() can remove them
    window.addEventListener("scroll", reposition, { passive: true });
    window.addEventListener("resize", reposition, { passive: true });
    windowListeners.push({ scroll: reposition, resize: reposition });
    const ro = new ResizeObserver(reposition);
    ro.observe(element);
    resizeObservers.push(ro);
}
async function runHydraLens() {
    // FIX: guard is checked before any async work; flag is set only after clearOverlays succeeds
    if (isScanning) {
        console.log("[HydraLens] Scan already in progress.");
        return;
    }
    function sendProgress(status) {
        chrome.runtime.sendMessage({ type: "HYDRALENS_PROGRESS", payload: { status } }).catch(() => { });
    }
    clearOverlays(); // synchronous ן¿½ if this throws, isScanning stays false (correct)
    isScanning = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    try {
        sendProgress("Fetching server HTML...");
        const response = await fetch(window.location.href, {
            cache: "no-store",
            signal: controller.signal,
        });
        // Auth-redirect guard: if the server redirected us to a different URL
        // (e.g. a login page), the fetched HTML is not the real SSR output.
        if (response.url && response.url !== window.location.href) {
            throw new Error(`Server redirected to ${response.url} — page may require authentication. Scan aborted to avoid false positives.`);
        }
        const serverHTML = await response.text();
        // Secondary guard: detect a login form in the fetched HTML
        if (/<input[^>]+type=["\x27]password["\x27]/i.test(serverHTML)) {
            throw new Error("Fetched HTML appears to be a login page. Scan aborted — authenticate first or use the CLI with --auth-state.");
        }
        clearTimeout(timeoutId);
        sendProgress("Waiting for client render...");
        await new Promise((resolve) => setTimeout(resolve, 800));
        sendProgress("Analysing DOM for mismatches...");
        const allMismatches = await detectMismatchesAsync(serverHTML, document);
        chrome.storage.local.get(["ignoredSelectors"], (res) => {
            const ignored = res.ignoredSelectors ?? [];
            const activeMismatches = allMismatches.filter((m) => !ignored.includes(m.selector));
            chrome.runtime
                .sendMessage({
                type: "HYDRALENS_RESULTS",
                payload: { mismatches: activeMismatches, totalFound: allMismatches.length },
            })
                .catch(() => { });
            activeMismatches.forEach((mismatch) => {
                const clientEl = document.querySelector(mismatch.selector);
                if (clientEl)
                    drawOverlay(clientEl, mismatch);
            });
        });
    }
    catch (error) {
        const message = error.name === "AbortError"
            ? "Fetch timed out (6s). The server may be too slow or streaming infinitely."
            : (error.message ?? "Unknown error during scan.");
        console.error("[HydraLens]", message);
        chrome.runtime.sendMessage({ type: "HYDRALENS_ERROR", payload: { message } }).catch(() => { });
    }
    finally {
        clearTimeout(timeoutId);
        // FIX: reset immediately in finally; no arbitrary 2s delay that could cause stuck state
        isScanning = false;
    }
}
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "HYDRALENS_RUN")
        runHydraLens();
    if (msg.type === "HYDRALENS_CLEAR") {
        clearOverlays();
        isScanning = false;
    }
});
