// Global chrome.* API stubs for vitest (jsdom has no chrome runtime)
// Import this file via vitest.config.ts → test.setupFiles

import { vi } from "vitest";

// ── chrome.storage ────────────────────────────────────────────
const makeStorage = () => {
  const store: Record<string, unknown> = {};
  return {
    get: vi.fn((keys: string | string[], cb?: (r: Record<string, unknown>) => void) => {
      const keyArr = Array.isArray(keys) ? keys : [keys];
      const result = Object.fromEntries(keyArr.map((k) => [k, store[k]]));
      if (cb) cb(result);
      return Promise.resolve(result);
    }),
    set: vi.fn((items: Record<string, unknown>, cb?: () => void) => {
      Object.assign(store, items);
      if (cb) cb();
      return Promise.resolve();
    }),
    remove: vi.fn((keys: string | string[], cb?: () => void) => {
      const keyArr = Array.isArray(keys) ? keys : [keys];
      keyArr.forEach((k) => delete store[k]);
      if (cb) cb();
      return Promise.resolve();
    }),
    clear: vi.fn((cb?: () => void) => {
      Object.keys(store).forEach((k) => delete store[k]);
      if (cb) cb();
      return Promise.resolve();
    }),
    _store: store,
  };
};

// ── chrome.runtime.onMessage mock ────────────────────────────
const makeMessageBus = () => {
  const listeners: Array<(msg: unknown, sender: unknown, reply: unknown) => void> = [];
  return {
    addListener: vi.fn((fn: (msg: unknown, sender: unknown, reply: unknown) => void) => {
      listeners.push(fn);
    }),
    removeListener: vi.fn((fn: (msg: unknown, sender: unknown, reply: unknown) => void) => {
      const i = listeners.indexOf(fn);
      if (i !== -1) listeners.splice(i, 1);
    }),
    hasListener: vi.fn((fn: (msg: unknown, sender: unknown, reply: unknown) => void) =>
      listeners.includes(fn)
    ),
    _fire: (msg: unknown, sender = {}, reply = vi.fn()) => {
      listeners.forEach((fn) => fn(msg, sender, reply));
    },
    _listeners: listeners,
  };
};

// ── chrome.webNavigation mock ─────────────────────────────────
const makeNavEvent = () => {
  const listeners: Array<(details: unknown) => void> = [];
  return {
    addListener: vi.fn((fn: (details: unknown) => void) => listeners.push(fn)),
    removeListener: vi.fn(),
    _fire: (details: unknown) => listeners.forEach((fn) => fn(details)),
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
} as unknown as typeof chrome;

// Reset all mocks between tests so state doesn't bleed across test cases
import { beforeEach } from "vitest";
beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(local._store).forEach((k) => delete local._store[k]);
  Object.keys(session._store).forEach((k) => delete session._store[k]);
});
