// Global chrome.* API stubs for vitest (jsdom has no chrome runtime)
// Import this file via vitest.config.ts → test.setupFiles
import { vi } from "vitest";
// ── chrome.storage ────────────────────────────────────────────
const makeStorage = () => {
    const store = {};
    return {
        get: vi.fn((keys, cb) => {
            const keyArr = Array.isArray(keys) ? keys : [keys];
            const result = Object.fromEntries(keyArr.map((k) => [k, store[k]]));
            if (cb)
                cb(result);
            return Promise.resolve(result);
        }),
        set: vi.fn((items, cb) => {
            Object.assign(store, items);
            if (cb)
                cb();
            return Promise.resolve();
        }),
        remove: vi.fn((keys, cb) => {
            const keyArr = Array.isArray(keys) ? keys : [keys];
            keyArr.forEach((k) => delete store[k]);
            if (cb)
                cb();
            return Promise.resolve();
        }),
        clear: vi.fn((cb) => {
            Object.keys(store).forEach((k) => delete store[k]);
            if (cb)
                cb();
            return Promise.resolve();
        }),
        _store: store,
    };
};
// ── chrome.runtime.onMessage mock ────────────────────────────
const makeMessageBus = () => {
    const listeners = [];
    return {
        addListener: vi.fn((fn) => {
            listeners.push(fn);
        }),
        removeListener: vi.fn((fn) => {
            const i = listeners.indexOf(fn);
            if (i !== -1)
                listeners.splice(i, 1);
        }),
        hasListener: vi.fn((fn) => listeners.includes(fn)),
        _fire: (msg, sender = {}, reply = vi.fn()) => {
            listeners.forEach((fn) => fn(msg, sender, reply));
        },
        _listeners: listeners,
    };
};
// ── chrome.webNavigation mock ─────────────────────────────────
const makeNavEvent = () => {
    const listeners = [];
    return {
        addListener: vi.fn((fn) => listeners.push(fn)),
        removeListener: vi.fn(),
        _fire: (details) => listeners.forEach((fn) => fn(details)),
    };
};
// ── Assemble the global chrome object ────────────────────────
const local = makeStorage();
const session = makeStorage();
globalThis.chrome = {
    storage: {
        local,
        session,
        sync: makeStorage(),
    },
    runtime: {
        sendMessage: vi.fn(() => Promise.resolve()),
        onMessage: makeMessageBus(),
        lastError: undefined,
        id: "hydra-lens-test-extension-id",
    },
    tabs: {
        sendMessage: vi.fn(() => Promise.resolve()),
        query: vi.fn(() => Promise.resolve([])),
    },
    commands: {
        onCommand: makeMessageBus(),
    },
    webNavigation: {
        onCompleted: makeNavEvent(),
        onHistoryStateUpdated: makeNavEvent(),
    },
    action: {
        setBadgeText: vi.fn(),
        setBadgeBackgroundColor: vi.fn(),
    },
};
// Reset all mocks between tests so state doesn't bleed across test cases
import { beforeEach } from "vitest";
beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(local._store).forEach((k) => delete local._store[k]);
    Object.keys(session._store).forEach((k) => delete session._store[k]);
});
