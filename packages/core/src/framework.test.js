/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { getComponentName } from "./index";
describe("Framework detection edge cases", () => {
    it("prefers React over null when both React and no-framework signals present", () => {
        const el = document.createElement("div");
        el.__reactFiber$abc = {};
        expect(getComponentName(el)).toBe("ReactComponent");
    });
    it("detects Vue via __vue prefix on property keys", () => {
        const el = document.createElement("span");
        el.__vueParentComponent = {};
        expect(getComponentName(el)).toBe("VueComponent");
    });
    it("detects Angular via __ngContext__", () => {
        const el = document.createElement("app-root");
        el.__ngContext__ = [];
        expect(getComponentName(el)).toBe("AngularComponent");
    });
    it("detects Svelte via __svelte property prefix", () => {
        const el = document.createElement("div");
        el.__svelte_component = {};
        expect(getComponentName(el)).toBe("SvelteComponent");
    });
    it("detects SolidJS via _$owner", () => {
        const el = document.createElement("div");
        el._$owner = { name: "root" };
        expect(getComponentName(el)).toBe("SolidComponent");
    });
    it("returns null for a plain div with no framework fingerprints", () => {
        const el = document.createElement("div");
        expect(getComponentName(el)).toBeNull();
    });
});
//# sourceMappingURL=framework.test.js.map