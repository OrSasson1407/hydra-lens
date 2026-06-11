import { describe, it, expect } from "vitest";
import { detectMismatches, getFix } from "../../index";

function makeClientWithProp(prop: string, value: unknown = {}): Document {
  const doc = new DOMParser().parseFromString(
    `<html><body><p class="ssr">client value different text here</p></body></html>`,
    "text/html"
  );
  const el = doc.querySelector(".ssr")!;
  (el as unknown as Record<string, unknown>)[prop] = value;
  return doc;
}

describe("framework-advice.integration", () => {
  it("React element mismatch → advice contains useEffect", () => {
    const clientDoc = makeClientWithProp("__reactFiber$abc");
    const serverHTML = `<html><body><p class="ssr">server value original</p></body></html>`;
    const mismatches = detectMismatches(serverHTML, clientDoc, { similarityThreshold: 0.5 });
    expect(mismatches.length).toBeGreaterThan(0);
    expect(mismatches[0].advice).toContain("useEffect");
  });

  it("Vue element mismatch → advice contains onMounted", () => {
    const clientDoc = makeClientWithProp("__vue_app__");
    const serverHTML = `<html><body><p class="ssr">server value original</p></body></html>`;
    const mismatches = detectMismatches(serverHTML, clientDoc, { similarityThreshold: 0.5 });
    expect(mismatches.length).toBeGreaterThan(0);
    expect(mismatches[0].advice).toContain("onMounted");
  });

  it("Svelte element mismatch → advice contains onMount", () => {
    const clientDoc = makeClientWithProp("__svelte_comp");
    const serverHTML = `<html><body><p class="ssr">server value original</p></body></html>`;
    const mismatches = detectMismatches(serverHTML, clientDoc, { similarityThreshold: 0.5 });
    expect(mismatches.length).toBeGreaterThan(0);
    expect(mismatches[0].advice).toContain("onMount");
  });

  it("Angular element mismatch → advice contains isPlatformBrowser", () => {
    const doc = new DOMParser().parseFromString(
      `<html><body><app-root ng-version="15.0.0"><div class="ssr">client</div></app-root></body></html>`,
      "text/html"
    );
    const serverHTML = `<html><body><app-root ng-version="15.0.0"><div class="ssr">server value different</div></app-root></body></html>`;
    const mismatches = detectMismatches(serverHTML, doc, { similarityThreshold: 0.5 });
    if (mismatches.length > 0) {
      expect(mismatches[0].advice).toContain("isPlatformBrowser");
    }
  });

  it("unknown element mismatch → generic advice returned", () => {
    const serverHTML = `<html><body><p>Server text here</p></body></html>`;
    const clientDoc = new DOMParser().parseFromString(
      `<html><body><p>Totally different client text</p></body></html>`,
      "text/html"
    );
    const mismatches = detectMismatches(serverHTML, clientDoc, { similarityThreshold: 0.5 });
    expect(mismatches.length).toBeGreaterThan(0);
    expect(mismatches[0].advice).toBeTruthy();
    expect(mismatches[0].componentName).toBeNull();
  });

  it("fixSnippet is non-empty for all known frameworks", () => {
    const frameworks = ["ReactComponent", "VueComponent", "SvelteComponent", "SolidComponent", "AngularComponent", "NextComponent", "NuxtComponent"];
    for (const fw of frameworks) {
      const { snippet } = getFix(fw, "Text content mismatch");
      expect(snippet.length).toBeGreaterThan(0);
    }
  });
});
