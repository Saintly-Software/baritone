import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InternalSpinner } from "./index";

describe("InternalSpinner", () => {
  it("renders a decorative (aria-hidden) span", () => {
    const { container } = render(<InternalSpinner />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner.tagName).toBe("SPAN");
    // Decorative: the host announces the busy state, so the glyph is hidden.
    expect(spinner).toHaveAttribute("aria-hidden");
    // No accessible role/name of its own.
    expect(spinner).not.toHaveAttribute("role");
  });

  it("merges a host className onto the glyph", () => {
    const { container } = render(<InternalSpinner className="overlay" />);
    const spinner = container.firstChild as HTMLElement;
    // Keeps its own ring class and appends the host's positioning class.
    expect(spinner.className).toContain("overlay");
    expect(spinner.className.split(" ").length).toBeGreaterThan(1);
  });
});
