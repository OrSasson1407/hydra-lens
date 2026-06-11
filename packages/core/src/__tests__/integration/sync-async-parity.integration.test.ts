import { describe, it, expect } from "vitest";
import { detectMismatches, detectMismatchesAsync } from "../../index";

function makeClient(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

const COMPLEX_HTML = `<html><body>
  <div class="a" aria-hidden="true">
    <p>Server text one</p>
    <span data-key="AKIAIOSFODNN7EXAMPLE">nested</span>
    <ul>
      <li class="x">item 1</li>
      <li class="y">item 2</li>
    </ul>
  </div>
</body></html>`;

const COMPLEX_CLIENT = `<html><body>
  <div class="b" aria-hidden="false">
    <p>Client text totally different</p>
    <span data-key="AKIAJSIE27AIIDH34OI2">nested</span>
    <ul>
      <li class="z">item A</li>
      <li class="w">item B</li>
    </ul>
  </div>
</body></html>`;

describe("sync-async-parity.integration", () => {
  it("sync and async return same mismatch count", async () => {
    const client = makeClient(COMPLEX_CLIENT);
    const sync = detectMismatches(COMPLEX_HTML, client);
    const async_ = await detectMismatchesAsync(COMPLEX_HTML, client);
    expect(async_.length).toBe(sync.length);
  });

  it("sync and async selectors are identical and in same order", async () => {
    const client = makeClient(COMPLEX_CLIENT);
    const sync = detectMismatches(COMPLEX_HTML, client);
    const async_ = await detectMismatchesAsync(COMPLEX_HTML, client);
    const syncSelectors = sync.map((m) => m.selector);
    const asyncSelectors = async_.map((m) => m.selector);
    expect(asyncSelectors).toEqual(syncSelectors);
  });

  it("sync and async severities match for all results", async () => {
    const client = makeClient(COMPLEX_CLIENT);
    const sync = detectMismatches(COMPLEX_HTML, client);
    const async_ = await detectMismatchesAsync(COMPLEX_HTML, client);
    const syncSev = sync.map((m) => m.severity);
    const asyncSev = async_.map((m) => m.severity);
    expect(asyncSev).toEqual(syncSev);
  });

  it("parity holds with securityOnly=true", async () => {
    const client = makeClient(COMPLEX_CLIENT);
    const opts = { securityOnly: true };
    const sync = detectMismatches(COMPLEX_HTML, client, opts);
    const async_ = await detectMismatchesAsync(COMPLEX_HTML, client, opts);
    expect(async_.length).toBe(sync.length);
    expect(async_.map((m) => m.selector)).toEqual(sync.map((m) => m.selector));
  });

  it("parity holds with custom similarityThreshold", async () => {
    const client = makeClient(COMPLEX_CLIENT);
    const opts = { similarityThreshold: 0.9 };
    const sync = detectMismatches(COMPLEX_HTML, client, opts);
    const async_ = await detectMismatchesAsync(COMPLEX_HTML, client, opts);
    expect(async_.length).toBe(sync.length);
  });

  it("parity holds on deeply nested DOM (depth 10)", async () => {
    let serverInner = "deep text";
    let clientInner = "totally different deep content";
    for (let i = 0; i < 10; i++) {
      serverInner = `<div>${serverInner}</div>`;
      clientInner = `<div>${clientInner}</div>`;
    }
    const serverHTML = `<html><body>${serverInner}</body></html>`;
    const client = makeClient(`<html><body>${clientInner}</body></html>`);
    const sync = detectMismatches(serverHTML, client, { similarityThreshold: 0.5 });
    const async_ = await detectMismatchesAsync(serverHTML, client, { similarityThreshold: 0.5 });
    expect(async_.length).toBe(sync.length);
  });
});
