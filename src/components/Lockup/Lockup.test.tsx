import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Lockup } from "./index";

describe("Lockup", () => {
  it("renders title and subtitle text", () => {
    render(<Lockup title="Baritone" subtitle="Design system" />);
    expect(screen.getByText("Baritone")).toBeInTheDocument();
    expect(screen.getByText("Design system")).toBeInTheDocument();
  });

  it("renders in a div by default", () => {
    render(<Lockup title="Baritone" />);
    expect(screen.getByText("Baritone").closest("div")).toBeInTheDocument();
  });

  it("wraps the icon so it can carry an accessible label via slotProps", () => {
    render(<Lockup title="Baritone" icon={<svg />} slotProps={{ icon: { label: "Logo" } }} />);
    expect(screen.getByRole("img", { name: "Logo" })).toBeInTheDocument();
  });

  it("omits the icon and subtitle when not provided", () => {
    const { container } = render(<Lockup title="Baritone" />);
    expect(container.querySelectorAll("span").length).toBeLessThanOrEqual(2);
  });

  it("forwards slotProps to the title's Text (render override)", () => {
    render(<Lockup title="Baritone" slotProps={{ title: { render: <h2 /> } }} />);
    expect(screen.getByText("Baritone").tagName).toBe("H2");
  });

  it("can render as a different element via the render prop", () => {
    render(<Lockup title="Baritone" render={<header />} />);
    expect(screen.getByText("Baritone").closest("header")).toBeInTheDocument();
  });
});
