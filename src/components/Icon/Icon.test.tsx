import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon } from "./index";

const Svg = () => (
  <svg viewBox="0 0 16 16" data-testid="svg">
    <path d="M0 0h16v16H0z" />
  </svg>
);

describe("Icon", () => {
  it("is decorative (aria-hidden) by default", () => {
    const { container } = render(
      <Icon>
        <Svg />
      </Icon>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
    expect(wrapper).not.toHaveAttribute("role");
  });

  it("exposes role=img and an accessible name when labelled", () => {
    render(
      <Icon label="Search">
        <Svg />
      </Icon>,
    );
    expect(screen.getByRole("img", { name: "Search" })).toBeInTheDocument();
  });
});
