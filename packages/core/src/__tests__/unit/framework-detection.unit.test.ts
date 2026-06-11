import { describe, it, expect } from "vitest";
import { getComponentName } from "../../index";

describe("framework-detection", () => {
  function makeEl(tag = "div", attrs: Record<string, string> = {}, props: Record<string, unknown> = {}): Element {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    for (const [k, v] of Object.entries(props)) (el as unknown as Record<string, unknown>)[k] = v;
    return el;
  }

  it("data-reactroot attribute → ReactComponent", () => {
    const el = makeEl("div", { "data-reactroot": "" });
    expect(getComponentName(el)).toBe("ReactComponent");
  });

  it("__reactFiber$ property → ReactComponent", () => {
    const el = makeEl("div", {}, { __reactFiber$abc: {} });
    expect(getComponentName(el)).toBe("ReactComponent");
  });

  it("__reactInternalInstance$ → ReactComponent", () => {
    const el = makeEl("div", {}, { __reactInternalInstance$xyz: {} });
    expect(getComponentName(el)).toBe("ReactComponent");
  });

  it("__vue_app__ → VueComponent", () => {
    const el = makeEl("div", {}, { __vue_app__: {} });
    expect(getComponentName(el)).toBe("VueComponent");
  });

  it("__vue* property prefix → VueComponent", () => {
    const el = makeEl("div", {}, { __vueParentComponent: {} });
    expect(getComponentName(el)).toBe("VueComponent");
  });

  it("__ngContext__ → AngularComponent", () => {
    const el = makeEl("div", {}, { __ngContext__: {} });
    expect(getComponentName(el)).toBe("AngularComponent");
  });

  it("ng-version attribute → AngularComponent", () => {
    const el = makeEl("app-root", { "ng-version": "15.0.0" });
    expect(getComponentName(el)).toBe("AngularComponent");
  });

  it("closest ancestor ng-version → AngularComponent", () => {
    const parent = document.createElement("div");
    parent.setAttribute("ng-version", "15.0.0");
    document.body.appendChild(parent);
    const child = document.createElement("span");
    parent.appendChild(child);
    expect(getComponentName(child)).toBe("AngularComponent");
    document.body.removeChild(parent);
  });

  it("__svelte* property → SvelteComponent", () => {
    const el = makeEl("div", {}, { __svelte_meta: {} });
    expect(getComponentName(el)).toBe("SvelteComponent");
  });

  it("_$owner property → SolidComponent", () => {
    const el = makeEl("div", {}, { _$owner: {} });
    expect(getComponentName(el)).toBe("SolidComponent");
  });

  it("plain div → null", () => {
    const el = makeEl("div");
    expect(getComponentName(el)).toBeNull();
  });

  it("React wins over Svelte when both signals present", () => {
    // React check comes before Svelte in the implementation
    const el = makeEl("div", {}, { __reactFiber$a: {}, __svelte_meta: {} });
    expect(getComponentName(el)).toBe("ReactComponent");
  });
});
