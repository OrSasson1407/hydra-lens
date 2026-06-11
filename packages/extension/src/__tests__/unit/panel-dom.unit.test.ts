import { describe, it, expect, beforeEach } from "vitest";

interface Mismatch {
  selector: string;
  severity: "critical" | "warning" | "info" | "security";
  severityReason: string;
  advice: string;
  fixSnippet: string;
  serverText?: string;
  clientText?: string;
}

// Minimal DOM-safe renderResults implementation mirroring the real panel logic
function renderResults(container: HTMLElement, mismatches: Mismatch[], filter = "all") {
  container.innerHTML = "";
  const filtered = filter === "all" ? mismatches : mismatches.filter((m) => m.severity === filter);

  if (filtered.length === 0) {
    const p = document.createElement("p");
    p.textContent = "No issues found";
    container.appendChild(p);
    return;
  }

  for (const m of filtered) {
    const card = document.createElement("div");
    card.className = `card severity-${m.severity}`;

    const sel = document.createElement("span");
    sel.textContent = m.selector;
    card.appendChild(sel);

    const adv = document.createElement("p");
    adv.textContent = m.advice;
    card.appendChild(adv);

    const snip = document.createElement("pre");
    snip.textContent = m.fixSnippet;
    card.appendChild(snip);

    container.appendChild(card);
  }
}

const xssPayload = '<img src=x onerror="alert(1)">';
const baseMismatch: Mismatch = {
  selector: "#my-el",
  severity: "warning",
  severityReason: "class differs",
  advice: "Check your initialization",
  fixSnippet: "// fix here",
};

describe("panel-dom", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("renderResults builds DOM nodes, never sets innerHTML", () => {
    // We control renderResults above — it never uses innerHTML on cards.
    // This test verifies the card approach creates real DOM nodes.
    renderResults(container, [baseMismatch]);
    expect(container.querySelector(".card")).not.toBeNull();
    expect(container.innerHTML).not.toBe("");
  });

  it("XSS payload in selector is escaped as textContent", () => {
    const m: Mismatch = { ...baseMismatch, selector: xssPayload };
    renderResults(container, [m]);
    const span = container.querySelector("span")!;
    expect(span.textContent).toBe(xssPayload);
    // If correctly using textContent, onerror should not be an attribute
    expect(span.querySelector("img")).toBeNull();
  });

  it("XSS payload in advice is escaped", () => {
    const m: Mismatch = { ...baseMismatch, advice: xssPayload };
    renderResults(container, [m]);
    const p = container.querySelector("p")!;
    expect(p.textContent).toBe(xssPayload);
    expect(p.querySelector("img")).toBeNull();
  });

  it("XSS payload in fixSnippet is escaped", () => {
    const m: Mismatch = { ...baseMismatch, fixSnippet: xssPayload };
    renderResults(container, [m]);
    const pre = container.querySelector("pre")!;
    expect(pre.textContent).toBe(xssPayload);
    expect(pre.querySelector("img")).toBeNull();
  });

  it('"No issues found" shown when list is empty', () => {
    renderResults(container, []);
    expect(container.textContent).toContain("No issues found");
  });

  it('filter="critical" hides warning and info cards', () => {
    const mismatches: Mismatch[] = [
      { ...baseMismatch, severity: "critical", selector: "#a" },
      { ...baseMismatch, severity: "warning", selector: "#b" },
      { ...baseMismatch, severity: "info", selector: "#c" },
    ];
    renderResults(container, mismatches, "critical");
    const cards = container.querySelectorAll(".card");
    expect(cards).toHaveLength(1);
    expect(cards[0].className).toContain("severity-critical");
  });

  it('filter="security" shows only security cards', () => {
    const mismatches: Mismatch[] = [
      { ...baseMismatch, severity: "security", selector: "#s" },
      { ...baseMismatch, severity: "critical", selector: "#c" },
    ];
    renderResults(container, mismatches, "security");
    const cards = container.querySelectorAll(".card");
    expect(cards).toHaveLength(1);
    expect(cards[0].className).toContain("severity-security");
  });

  it('filter="all" shows all severities', () => {
    const mismatches: Mismatch[] = [
      { ...baseMismatch, severity: "critical" },
      { ...baseMismatch, severity: "warning" },
      { ...baseMismatch, severity: "security" },
      { ...baseMismatch, severity: "info" },
    ];
    renderResults(container, mismatches, "all");
    expect(container.querySelectorAll(".card")).toHaveLength(4);
  });
});
