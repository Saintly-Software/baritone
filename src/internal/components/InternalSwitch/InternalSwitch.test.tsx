import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { InternalSwitch } from "./index";

describe("InternalSwitch", () => {
  it("is a fake switch — renders no <input> of its own", () => {
    const { container } = render(<InternalSwitch checked />);
    expect(container.querySelector("input")).toBeNull();
  });

  it("reflects the unchecked state", () => {
    render(<InternalSwitch data-testid="sw" />);
    const track = screen.getByTestId("sw");
    expect(track).toHaveAttribute("data-unchecked");
    expect(track).not.toHaveAttribute("data-checked");
  });

  it("reflects the checked state", () => {
    render(<InternalSwitch data-testid="sw" checked />);
    const track = screen.getByTestId("sw");
    expect(track).toHaveAttribute("data-checked");
    expect(track).not.toHaveAttribute("data-unchecked");
  });

  it("marks itself disabled", () => {
    render(<InternalSwitch data-testid="sw" disabled />);
    expect(screen.getByTestId("sw")).toHaveAttribute("data-disabled");
  });

  it("is not disabled by default", () => {
    render(<InternalSwitch data-testid="sw" />);
    expect(screen.getByTestId("sw")).not.toHaveAttribute("data-disabled");
  });

  it("is not itself a tab stop, but lights up via a focusable child (focus-within)", async () => {
    const user = userEvent.setup();
    render(
      <InternalSwitch data-testid="sw">
        <input type="checkbox" role="switch" aria-label="Wi-Fi" />
      </InternalSwitch>,
    );
    const track = screen.getByTestId("sw");
    expect(track).not.toHaveAttribute("tabindex");

    await user.tab();
    const input = screen.getByRole("switch", { name: "Wi-Fi" });
    expect(input).toHaveFocus();
    // The focusable control lives inside the track, so :focus-within applies to it.
    expect(track).toContainElement(input);
  });

  it("forwards className and arbitrary props to the track", () => {
    render(<InternalSwitch data-testid="sw" className="custom" aria-hidden />);
    const track = screen.getByTestId("sw");
    expect(track.className).toContain("custom");
    expect(track).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the active glyph in the thumb when checked", () => {
    render(
      <InternalSwitch
        checked
        activeIcon={<svg data-testid="on" />}
        inactiveIcon={<svg data-testid="off" />}
      />,
    );
    expect(screen.getByTestId("on")).toBeInTheDocument();
    expect(screen.queryByTestId("off")).toBeNull();
  });

  it("shows the inactive glyph in the thumb when unchecked", () => {
    render(
      <InternalSwitch
        activeIcon={<svg data-testid="on" />}
        inactiveIcon={<svg data-testid="off" />}
      />,
    );
    expect(screen.getByTestId("off")).toBeInTheDocument();
    expect(screen.queryByTestId("on")).toBeNull();
  });

  it("renders no glyph slot when neither icon is given", () => {
    const { container } = render(<InternalSwitch checked />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("forwards a ref to the track element", () => {
    let node: HTMLSpanElement | null = null;
    render(
      <InternalSwitch
        ref={(el) => {
          node = el;
        }}
      />,
    );
    expect(node).toBeInstanceOf(HTMLSpanElement);
  });
});
