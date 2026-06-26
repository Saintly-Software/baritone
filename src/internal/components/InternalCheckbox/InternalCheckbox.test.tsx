import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { InternalCheckbox } from "./index";

describe("InternalCheckbox", () => {
  it("is a fake checkbox — renders no <input> of its own", () => {
    const { container } = render(<InternalCheckbox checked />);
    expect(container.querySelector("input")).toBeNull();
  });

  it("reflects the unchecked state", () => {
    const { container } = render(<InternalCheckbox data-testid="cb" />);
    const box = screen.getByTestId("cb");
    expect(box).toHaveAttribute("data-unchecked");
    expect(box).not.toHaveAttribute("data-checked");
    expect(box).not.toHaveAttribute("data-indeterminate");
    // The empty box still mounts an indicator (kept for the scale animation).
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("reflects the checked state", () => {
    render(<InternalCheckbox data-testid="cb" checked />);
    const box = screen.getByTestId("cb");
    expect(box).toHaveAttribute("data-checked");
    expect(box).not.toHaveAttribute("data-unchecked");
  });

  it("reflects the indeterminate state", () => {
    render(<InternalCheckbox data-testid="cb" checked="indeterminate" />);
    const box = screen.getByTestId("cb");
    expect(box).toHaveAttribute("data-indeterminate");
    expect(box).not.toHaveAttribute("data-checked");
    expect(box).not.toHaveAttribute("data-unchecked");
  });

  it("marks itself disabled", () => {
    render(<InternalCheckbox data-testid="cb" disabled />);
    expect(screen.getByTestId("cb")).toHaveAttribute("data-disabled");
  });

  it("is not disabled by default", () => {
    render(<InternalCheckbox data-testid="cb" />);
    expect(screen.getByTestId("cb")).not.toHaveAttribute("data-disabled");
  });

  it("is not itself a tab stop, but lights up via a focusable child (focus-within)", async () => {
    const user = userEvent.setup();
    render(
      <InternalCheckbox data-testid="cb">
        <input type="checkbox" aria-label="Subscribe" />
      </InternalCheckbox>,
    );
    const box = screen.getByTestId("cb");
    expect(box).not.toHaveAttribute("tabindex");

    await user.tab();
    const input = screen.getByRole("checkbox", { name: "Subscribe" });
    expect(input).toHaveFocus();
    // The focusable control lives inside the box, so :focus-within applies to it.
    expect(box).toContainElement(input);
  });

  it("forwards className and arbitrary props to the box", () => {
    render(<InternalCheckbox data-testid="cb" className="custom" aria-hidden />);
    const box = screen.getByTestId("cb");
    expect(box.className).toContain("custom");
    expect(box).toHaveAttribute("aria-hidden", "true");
  });

  it("forwards a ref to the box element", () => {
    let node: HTMLSpanElement | null = null;
    render(
      <InternalCheckbox
        ref={(el) => {
          node = el;
        }}
      />,
    );
    expect(node).toBeInstanceOf(HTMLSpanElement);
  });
});
