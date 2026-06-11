import { describe, it, expect } from "vitest";
import { getCssPath } from "../../index";

describe("css-path", () => {
  it("element with id → #id shorthand", () => {
    const el = document.createElement("div");
    el.id = "my-hero";
    document.body.appendChild(el);
    expect(getCssPath(el)).toBe("#my-hero");
    document.body.removeChild(el);
  });

  it("element with data-testid → attribute selector", () => {
    const el = document.createElement("button");
    el.setAttribute("data-testid", "submit-btn");
    document.body.appendChild(el);
    expect(getCssPath(el)).toBe('[data-testid="submit-btn"]');
    document.body.removeChild(el);
  });

  it("nested element → full ancestor chain", () => {
    const wrapper = document.createElement("section");
    const inner = document.createElement("p");
    wrapper.appendChild(inner);
    document.body.appendChild(wrapper);
    const path = getCssPath(inner);
    expect(path).toContain("p");
    expect(path).toContain("section");
    document.body.removeChild(wrapper);
  });

  it("first child → :nth-child(1)", () => {
    const parent = document.createElement("ul");
    const li = document.createElement("li");
    parent.appendChild(li);
    document.body.appendChild(parent);
    const path = getCssPath(li);
    expect(path).toContain(":nth-child(1)");
    document.body.removeChild(parent);
  });

  it("detached element (no parent) → tagname only", () => {
    const el = document.createElement("span");
    expect(getCssPath(el)).toBe("span");
  });

  it("path is unique for distinct siblings", () => {
    const parent = document.createElement("nav");
    const a = document.createElement("a");
    const b = document.createElement("a");
    parent.appendChild(a);
    parent.appendChild(b);
    document.body.appendChild(parent);
    expect(getCssPath(a)).not.toBe(getCssPath(b));
    document.body.removeChild(parent);
  });
});
