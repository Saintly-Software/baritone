import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Chip } from "./index";

describe("Chip", () => {
  it("renders children in a span by default", () => {
    render(<Chip>Beta</Chip>);
    const chip = screen.getByText("Beta");
    expect(chip.tagName).toBe("SPAN");
  });

  it("sets aria-disabled (not the disabled attribute) when disabled", () => {
    render(<Chip disabled>Off</Chip>);
    const chip = screen.getByText("Off");
    expect(chip).toHaveAttribute("aria-disabled", "true");
    expect(chip).not.toHaveAttribute("disabled");
  });

  it("supports the render prop for polymorphism and merges className", () => {
    render(
      <Chip render={<a href="/x" className="mine" />} intent="primary">
        Link chip
      </Chip>,
    );
    const link = screen.getByRole("link", { name: "Link chip" });
    expect(link).toHaveAttribute("href", "/x");
    expect(link.className).toContain("mine");
  });

  it("passes through className", () => {
    render(<Chip className="extra">X</Chip>);
    expect(screen.getByText("X").className).toContain("extra");
  });
});
