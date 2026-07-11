import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingIndicator } from "./index";

describe("LoadingIndicator", () => {
  it("renders a status region with the default SR-only 'Loading' label", () => {
    render(<LoadingIndicator />);
    const status = screen.getByRole("status");
    // The accessible name comes from the SR-only label.
    expect(status).toHaveTextContent("Loading");
  });

  it("rewords the announcement via `label`", () => {
    render(<LoadingIndicator label="Fetching results" />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Fetching results");
    expect(status).not.toHaveTextContent("Loading");
  });

  it("aria-hidden suppresses the label, role, and live region (decorative)", () => {
    const { container } = render(<LoadingIndicator aria-hidden data-testid="spinner" />);
    // No status role / accessible label when decorative.
    expect(screen.queryByRole("status")).toBeNull();
    const el = screen.getByTestId("spinner");
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).not.toHaveAttribute("role");
    // The SR-only "Loading" text is gone; only the decorative ring remains.
    expect(el).not.toHaveTextContent("Loading");
    // The ring itself is still present (and itself aria-hidden).
    expect(container.querySelector("[aria-hidden] [aria-hidden]")).not.toBeNull();
  });

  it("renders a decorative ring alongside the label by default", () => {
    render(<LoadingIndicator />);
    // The ring is the aria-hidden glyph nested inside the status region.
    const status = screen.getByRole("status");
    expect(status.querySelector("[aria-hidden]")).not.toBeNull();
  });

  it("passes through className and rest props", () => {
    render(<LoadingIndicator className="extra" id="loader" />);
    const status = screen.getByRole("status");
    expect(status.className).toContain("extra");
    expect(status).toHaveAttribute("id", "loader");
  });

  it("supports the render prop for polymorphism and merges className", () => {
    render(<LoadingIndicator render={<div className="mine" />} />);
    const status = screen.getByRole("status");
    expect(status.tagName).toBe("DIV");
    expect(status.className).toContain("mine");
  });

  it("has no native disabled affordance (non-interactive)", () => {
    render(<LoadingIndicator />);
    expect(screen.getByRole("status")).not.toHaveAttribute("disabled");
  });
});
