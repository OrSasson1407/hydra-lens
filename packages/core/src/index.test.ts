/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { classifyAttributeMismatch, getComponentName } from "./index";

describe("Heuristics: classifyAttributeMismatch", () => {
  it("should detect exposed AWS keys as security severity", () => {
    const result = classifyAttributeMismatch("data-key", "FAKE_AWS_KEY_12345", "");
    expect(result.severity).toBe("security");
    expect(result.reason).toContain("AWS Access Key");
  });

  it("should detect exposed JWT tokens as security severity", () => {
    const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ";
    const result = classifyAttributeMismatch("data-token", jwt, "");
    expect(result.severity).toBe("security");
    expect(result.reason).toContain("JWT Token");
  });

  it("should classify ARIA attribute mismatches as critical", () => {
    const result = classifyAttributeMismatch("aria-hidden", "true", "false");
    expect(result.severity).toBe("critical");
    expect(result.reason).toContain("Accessibility");
  });

  it("should ignore cache-busting timestamps on src attributes (info severity)", () => {
    const result = classifyAttributeMismatch("src", "/image.png?v=123", "/image.png?v=456");
    expect(result.severity).toBe("info");
    expect(result.reason).toContain("Cache-busting");
  });

  it("should classify generic attribute mismatches as warning", () => {
    const result = classifyAttributeMismatch("class", "btn-red", "btn-blue");
    expect(result.severity).toBe("warning");
  });
});

describe("Heuristics: getComponentName (Framework Detection)", () => {
  it("should detect React roots", () => {
    const el = document.createElement("div");
    el.setAttribute("data-reactroot", "");
    expect(getComponentName(el)).toBe("ReactComponent");
  });

  it("should detect React internal fibers", () => {
    const el = document.createElement("div");
    (el as any).__reactFiber$x2z = {};
    expect(getComponentName(el)).toBe("ReactComponent");
  });

  it("should detect Vue applications", () => {
    const el = document.createElement("div");
    (el as any).__vue_app__ = {};
    expect(getComponentName(el)).toBe("VueComponent");
  });

  it("should detect Angular contexts", () => {
    const el = document.createElement("div");
    el.setAttribute("ng-version", "15.0.0");
    expect(getComponentName(el)).toBe("AngularComponent");
  });

  it("should return null for vanilla elements", () => {
    const el = document.createElement("div");
    el.className = "vanilla-js";
    expect(getComponentName(el)).toBeNull();
  });
});
