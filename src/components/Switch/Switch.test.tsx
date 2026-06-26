import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./index";

// A tiny controlled host mirroring the documented usage, so the tests exercise
// the component exactly as a consumer would wire it.
function Notifications({
  value: initial = false,
  onChange,
  ...rest
}: {
  value?: boolean;
  onChange?: (value: boolean) => void;
} & Partial<React.ComponentProps<typeof Switch>>) {
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

  it("marks itself required", () => {
    render(<Notifications required />);
    expect(screen.getByRole("switch", { name: "Notifications" })).toHaveAttribute(
      "aria-required",
      "true",
    );
  });

  it("reflects an invalid state", () => {
    render(<Notifications invalid />);
    expect(screen.getByRole("switch", { name: "Notifications" })).toHaveAttribute("data-invalid");
  });

  it("renders without a label", () => {
    render(<Switch value={false} onChange={() => {}} />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });
});
