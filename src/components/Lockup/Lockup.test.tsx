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

  it("keeps the text in the accessible tree when hideText is set", () => {
    render(<Lockup title="Baritone" subtitle="Design system" hideText />);
    // Still queryable (present for screen readers), just visually hidden.
    expect(screen.getByText("Baritone")).toBeInTheDocument();
    expect(screen.getByText("Design system")).toBeInTheDocument();
  });

  it("renders the title as a semantic heading when slotProps.title.level is set", () => {
    render(<Lockup title="Baritone" slotProps={{ title: { level: 2 } }} />);
    expect(screen.getByRole("heading", { level: 2, name: "Baritone" })).toBeInTheDocument();
  });

  it("renders the title as a non-heading Text by default", () => {
    render(<Lockup title="Baritone" />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("replaces slot content entirely via the slots prop", () => {
    render(
      <Lockup
        title="ignored"
        subtitle="ignored too"
        slots={{ title: <span>Custom title</span>, subtitle: <span>Custom subtitle</span> }}
      />,
    );
    expect(screen.getByText("Custom title")).toBeInTheDocument();
    expect(screen.getByText("Custom subtitle")).toBeInTheDocument();
    expect(screen.queryByText("ignored")).not.toBeInTheDocument();
    expect(screen.queryByText("ignored too")).not.toBeInTheDocument();
  });
});
