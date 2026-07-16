import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import type { DistributiveOmit } from "../../utils/types";
import { Switch } from "./index";

// A tiny controlled host mirroring the documented usage, so the tests exercise
// the component exactly as a consumer would wire it.
function Notifications({
  value: initial = false,
  onChange,
  ...rest
}: DistributiveOmit<
  React.ComponentProps<typeof Switch>,
  "value" | "onChange" | "label" | "aria-label" | "aria-labelledby"
> & {
  value?: boolean;
  onChange?: (value: boolean) => void;
}) {
  const [value, setValue] = React.useState(initial);
  return (
    <Switch
      label="Notifications"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      {...rest}
    />
  );
}

describe("Switch", () => {
  it("renders a switch named by its label", () => {
    render(<Notifications />);
    const toggle = screen.getByRole("switch", { name: "Notifications" });
    expect(toggle).toBeInTheDocument();
    expect(toggle).not.toBeChecked();
  });

  it("reflects the controlled value as checked", () => {
    render(<Notifications value />);
    expect(screen.getByRole("switch", { name: "Notifications" })).toBeChecked();
  });

  it("calls onChange with the next value when clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Notifications onChange={onChange} />);

    await user.click(screen.getByRole("switch", { name: "Notifications" }));

    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("switch", { name: "Notifications" })).toBeChecked();
  });

  it("toggles when its label is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Notifications onChange={onChange} />);

    await user.click(screen.getByText("Notifications"));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("toggles with the keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Notifications onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole("switch", { name: "Notifications" })).toHaveFocus();

    await user.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Notifications disabled onChange={onChange} />);

    await user.click(screen.getByRole("switch", { name: "Notifications" }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("switch", { name: "Notifications" })).not.toBeChecked();
  });

  it("uses aria-disabled (not the disabled attribute) so it can still be tabbed to", async () => {
    const user = userEvent.setup();
    render(<Notifications disabled />);
    const toggle = screen.getByRole("switch", { name: "Notifications" });

    expect(toggle).toHaveAttribute("aria-disabled", "true");
    // The native attribute would yank it out of the tab order.
    expect(toggle).not.toBeDisabled();

    await user.tab();
    expect(toggle).toHaveFocus();
  });

  it("does not toggle via the keyboard when disabled, even though it's focused", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Notifications disabled onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole("switch", { name: "Notifications" })).toHaveFocus();

    await user.keyboard(" ");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("marks itself required", () => {
    render(<Notifications required />);
    expect(screen.getByRole("switch", { name: "Notifications" })).toHaveAttribute(
      "aria-required",
      "true",
    );
  });

  it("reflects an invalid state", () => {
    render(<Notifications state="invalid" />);
    expect(screen.getByRole("switch", { name: "Notifications" })).toHaveAttribute("data-invalid");
  });

  it("renders without a label", () => {
    render(<Switch value={false} onChange={() => {}} />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("reuses the `icon` shorthand for both states", async () => {
    const user = userEvent.setup();
    render(<Notifications icon={<svg data-testid="glyph" />} />);

    // Off: the single glyph is present…
    expect(screen.getByTestId("glyph")).toBeInTheDocument();

    // …and still present after toggling on.
    await user.click(screen.getByRole("switch", { name: "Notifications" }));
    expect(screen.getByTestId("glyph")).toBeInTheDocument();
  });

  it("swaps activeIcon / inactiveIcon with the state", async () => {
    const user = userEvent.setup();
    render(
      <Notifications
        activeIcon={<svg data-testid="on" />}
        inactiveIcon={<svg data-testid="off" />}
      />,
    );

    // Off shows only the inactive glyph.
    expect(screen.getByTestId("off")).toBeInTheDocument();
    expect(screen.queryByTestId("on")).toBeNull();

    await user.click(screen.getByRole("switch", { name: "Notifications" }));

    // On shows only the active glyph.
    expect(screen.getByTestId("on")).toBeInTheDocument();
    expect(screen.queryByTestId("off")).toBeNull();
  });

  it("keeps the label as the accessible name — the glyph is decorative", () => {
    render(<Notifications value icon={<svg data-testid="glyph" />} />);
    // The switch is still named by its label, not by anything in the thumb.
    expect(screen.getByRole("switch", { name: "Notifications" })).toBeInTheDocument();
  });

  it("names an unlabelled switch via aria-label", () => {
    render(<Switch aria-label="Wi-Fi" value={false} onChange={() => {}} />);
    expect(screen.getByRole("switch", { name: "Wi-Fi" })).toBeInTheDocument();
  });

  // `label` used to silently win over `aria-label`. They're mutually exclusive
  // now — the track would show one name and announce another — so the pair is a
  // type error, and a JS caller that gets past the types gets a thrown error.
  it("throws when label and aria-label are both passed", () => {
    expect(() =>
      render(
        // @ts-expect-error — mutually exclusive: the union rejects this at compile time.
        <Switch label="Notifications" aria-label="ignored" value={false} onChange={() => {}} />,
      ),
    ).toThrow(/mutually exclusive/);
  });

  it("points at an external label via aria-labelledby", () => {
    render(
      <>
        <span id="ext-label">External name</span>
        <Switch aria-labelledby="ext-label" value={false} onChange={() => {}} />
      </>,
    );
    expect(screen.getByRole("switch", { name: "External name" })).toBeInTheDocument();
  });

  it("wires description text via aria-describedby", () => {
    render(<Notifications helpText="We'll only ping you about outages." />);
    const toggle = screen.getByRole("switch", { name: "Notifications" });
    expect(toggle).toHaveAccessibleDescription("We'll only ping you about outages.");
  });

  // One message slot: the same line stays put and changes *presentation* with
  // `state`, rather than a separate error line appearing.
  it("renders the helpText as an error when invalid", () => {
    const { rerender } = render(<Notifications helpText="Required" />);
    expect(screen.getByText("Required").querySelector("svg")).toBeNull();

    rerender(<Notifications state="invalid" helpText="Required" />);
    expect(screen.getByText("Required").querySelector("svg")).not.toBeNull();
  });

  it("keeps the accessible name stable across label positions", () => {
    for (const labelPosition of ["top", "start", "end"] as const) {
      const { unmount } = render(<Notifications labelPosition={labelPosition} />);
      expect(screen.getByRole("switch", { name: "Notifications" })).toBeInTheDocument();
      unmount();
    }
  });
});
