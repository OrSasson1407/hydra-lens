import { describe, it, expect } from "vitest";

describe("shadow-dom", () => {
  it("elements inside shadow DOM are not directly accessible via querySelector", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });
    const inner = document.createElement("span");
    inner.id = "shadow-child";
    shadow.appendChild(inner);
    // document.querySelector cannot pierce shadow DOM
    expect(document.querySelector("#shadow-child")).toBeNull();
    document.body.removeChild(host);
  });

  it("shadowRoot is accessible when mode is open", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    host.attachShadow({ mode: "open" });
    expect(host.shadowRoot).not.toBeNull();
    document.body.removeChild(host);
  });

  it("shadowRoot is null when mode is closed", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    host.attachShadow({ mode: "closed" });
    expect(host.shadowRoot).toBeNull();
    document.body.removeChild(host);
  });

  it("elements inside shadow DOM can be found via shadowRoot.querySelector", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });
    const btn = document.createElement("button");
    btn.setAttribute("data-testid", "shadow-btn");
    shadow.appendChild(btn);
    expect(host.shadowRoot!.querySelector("[data-testid='shadow-btn']")).not.toBeNull();
    document.body.removeChild(host);
  });
});
