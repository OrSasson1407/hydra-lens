import { expect, it, describe } from "vitest";
import { getComponentName } from "./index";

describe("Framework Component Detection", () => {
  it("detects Vue components", () => {
    const el = document.createElement("div");
    (el as any).__vue_app__ = {};
    expect(getComponentName(el)).toBe("VueComponent");
  });

  it("detects Angular components", () => {
    const el = document.createElement("div");
    (el as any).__ngContext__ = [];
    expect(getComponentName(el)).toBe("AngularComponent");
  });
});
