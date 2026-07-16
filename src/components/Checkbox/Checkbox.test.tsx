import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import type { DistributiveOmit } from "../../utils/types";
import { Checkbox } from "./index";

// A tiny controlled host mirroring the documented usage, so the tests exercise
// the component exactly as a consumer would wire it.
function Subscribe({
  value: initial = false,
  onChange,
  ...rest
}: {
  value?: boolean;
  onChange?: (value: boolean) => void;
} & Partial<
  DistributiveOmit<
    React.ComponentProps<typeof Checkbox>,
    "value" | "onChange" | "label" | "aria-label" | "aria-labelledby"
  >
>) {
  const [value, setValue] = React.useState(initial);
  return (
    <Checkbox
      label="Subscribe"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      {...rest}
    />
  );
}

describe("Checkbox", () => {
  it("renders a checkbox named by its label", () => {
    render(<Subscribe />);
    const box = screen.getByRole("checkbox", { name: "Subscribe" });
    expect(box).toBeInTheDocument();
    expect(box).not.toBeChecked();
  });

  it("reflects the controlled value as checked", () => {
    render(<Subscribe value />);
    expect(screen.getByRole("checkbox", { name: "Subscribe" })).toBeChecked();
  });

  it("calls onChange with the next value when clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Subscribe onChange={onChange} />);

    await user.click(screen.getByRole("checkbox", { name: "Subscribe" }));

    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("checkbox", { name: "Subscribe" })).toBeChecked();
  });

  it("toggles when its label is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Subscribe onChange={onChange} />);

    await user.click(screen.getByText("Subscribe"));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("toggles with the keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Subscribe onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole("checkbox", { name: "Subscribe" })).toHaveFocus();

    await user.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Subscribe disabled onChange={onChange} />);

    await user.click(screen.getByRole("checkbox", { name: "Subscribe" }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("checkbox", { name: "Subscribe" })).not.toBeChecked();
  });

  it("uses aria-disabled (not the disabled attribute) so it can still be tabbed to", async () => {
    const user = userEvent.setup();
    render(<Subscribe disabled />);
    const box = screen.getByRole("checkbox", { name: "Subscribe" });

    expect(box).toHaveAttribute("aria-disabled", "true");
    // The native attribute would yank it out of the tab order.
    expect(box).not.toBeDisabled();

    await user.tab();
    expect(box).toHaveFocus();
  });

  it("does not toggle via the keyboard when disabled, even though it's focused", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Subscribe disabled onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole("checkbox", { name: "Subscribe" })).toHaveFocus();

    await user.keyboard(" ");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("marks itself required", () => {
    render(<Subscribe required />);
    expect(screen.getByRole("checkbox", { name: "Subscribe" })).toHaveAttribute(
      "aria-required",
      "true",
    );
  });

  it("reflects an invalid state", () => {
    render(<Subscribe state="invalid" />);
    expect(screen.getByRole("checkbox", { name: "Subscribe" })).toHaveAttribute("data-invalid");
  });

  it("renders without a label", () => {
    render(<Checkbox value={false} onChange={() => {}} />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("reports aria-checked=mixed when indeterminate", () => {
    render(<Subscribe indeterminate />);
    expect(screen.getByRole("checkbox", { name: "Subscribe" })).toHaveAttribute(
      "aria-checked",
      "mixed",
    );
  });

  it("still toggles from the indeterminate state, firing onChange with a boolean", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Subscribe indeterminate onChange={onChange} />);

    await user.click(screen.getByRole("checkbox", { name: "Subscribe" }));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("names a label-less box with aria-label", () => {
    render(<Checkbox value={false} onChange={() => {}} aria-label="Select row" />);
    expect(screen.getByRole("checkbox", { name: "Select row" })).toBeInTheDocument();
  });

  it("names a label-less box with aria-labelledby", () => {
    render(
      <>
        <span id="ext-label">External label</span>
        <Checkbox value={false} onChange={() => {}} aria-labelledby="ext-label" />
      </>,
    );
    expect(screen.getByRole("checkbox", { name: "External label" })).toBeInTheDocument();
  });

  // `label` used to silently win over `aria-label`. They're mutually exclusive
  // now — the box would show one name and announce another — so the pair is a
  // type error, and a JS caller that gets past the types gets a thrown error.
  it("throws when label and aria-label are both passed", () => {
    expect(() =>
      render(
        // @ts-expect-error — mutually exclusive: the union rejects this at compile time.
        <Checkbox label="Subscribe" aria-label="Ignored" value={false} onChange={() => {}} />,
      ),
    ).toThrow(/mutually exclusive/);
  });

  it("describes the box with its helpText", () => {
    render(<Subscribe helpText="We send at most one email a week." />);
    expect(screen.getByRole("checkbox", { name: "Subscribe" })).toHaveAccessibleDescription(
      "We send at most one email a week.",
    );
  });

  // One message slot: the same line stays put and changes *presentation* with
  // `state`, rather than a separate error line appearing.
  it("renders the helpText as an error when invalid", () => {
    const { rerender } = render(<Subscribe helpText="Required" />);
    // Neutral: the line is there, with no warning glyph.
    expect(screen.getByText("Required").querySelector("svg")).toBeNull();

    rerender(<Subscribe state="invalid" helpText="Required" />);
    // Invalid: the same line, now carrying HelpText's warning glyph.
    expect(screen.getByText("Required").querySelector("svg")).not.toBeNull();
  });
});
