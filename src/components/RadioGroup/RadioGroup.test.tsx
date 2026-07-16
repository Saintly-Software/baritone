import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import type { DistributiveOmit } from "../../utils/types";
import { RadioGroup } from "./index";

type ThemeValue = "system" | "light" | "dark";

// A tiny controlled host mirroring the documented usage, so the type-safe
// render-prop pattern is exercised exactly as a consumer would write it. The
// host owns the naming (`label="Theme"` below), so the labelling props are
// stripped from what it forwards — they're mutually exclusive, and a `rest` that
// could smuggle in an `aria-label` would conflict with that `label`.
function ThemeSwitcher({
  value: initial = "system",
  onChange,
  ...rest
}: {
  value?: ThemeValue;
  onChange?: (value: ThemeValue) => void;
} & Partial<
  DistributiveOmit<
    React.ComponentProps<typeof RadioGroup<ThemeValue>>,
    "label" | "aria-label" | "aria-labelledby" | "value" | "onChange" | "children"
  >
>) {
  const [value, setValue] = React.useState<ThemeValue>(initial);
  return (
    <RadioGroup
      label="Theme"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      {...rest}
    >
      {({ RadioGroupItem }) => (
        <>
          <RadioGroupItem value="dark" />
          <RadioGroupItem value="light" />
          <RadioGroupItem value="system" />
        </>
      )}
    </RadioGroup>
  );
}

describe("RadioGroup", () => {
  it("renders one radio per item, labelled by the group", () => {
    render(<ThemeSwitcher />);
    expect(screen.getByRole("radiogroup", { name: "Theme" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "dark" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "light" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "system" })).toBeInTheDocument();
  });

  it("reflects the controlled value as checked", () => {
    render(<ThemeSwitcher value="light" />);
    expect(screen.getByRole("radio", { name: "light" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "dark" })).not.toBeChecked();
  });

  it("calls onChange with the selected value when an option is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ThemeSwitcher onChange={onChange} />);

    await user.click(screen.getByRole("radio", { name: "dark" }));

    expect(onChange).toHaveBeenCalledWith("dark");
    expect(screen.getByRole("radio", { name: "dark" })).toBeChecked();
  });

  it("supports keyboard arrow navigation between options", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ThemeSwitcher value="dark" onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole("radio", { name: "dark" })).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(onChange).toHaveBeenLastCalledWith("light");
  });

  it("renders children as the label, overriding the default", () => {
    render(
      <RadioGroup label="Theme" value="dark" onChange={() => {}}>
        {({ RadioGroupItem }) => <RadioGroupItem value="dark">Dark mode</RadioGroupItem>}
      </RadioGroup>,
    );
    expect(screen.getByRole("radio", { name: "Dark mode" })).toBeInTheDocument();
  });

  it("does not change value when the group is disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ThemeSwitcher value="system" disabled onChange={onChange} />);

    await user.click(screen.getByRole("radio", { name: "dark" }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("radio", { name: "system" })).toBeChecked();
  });

  it("marks a disabled group with aria-disabled and keeps its options tabbable", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher value="system" disabled />);

    // The group carries the disabled semantics...
    expect(screen.getByRole("radiogroup", { name: "Theme" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    // ...but no radio gets the native attribute that would remove it from focus.
    const selected = screen.getByRole("radio", { name: "system" });
    expect(selected).not.toBeDisabled();

    // Tab reaches the group, landing on the selected (roving) option.
    await user.tab();
    expect(selected).toHaveFocus();
  });

  it("disables a single item without disabling the group", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RadioGroup label="Theme" value="system" onChange={onChange}>
        {({ RadioGroupItem }) => (
          <>
            <RadioGroupItem value="dark" disabled />
            <RadioGroupItem value="light" />
          </>
        )}
      </RadioGroup>,
    );

    const dark = screen.getByRole("radio", { name: "dark" });
    // The disabled option uses aria-disabled, so it stays focusable/reachable
    // (e.g. by arrow keys) rather than being skipped entirely like a native one.
    expect(dark).toHaveAttribute("aria-disabled", "true");
    expect(dark).not.toBeDisabled();
    dark.focus();
    expect(dark).toHaveFocus();

    await user.click(dark);
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("radio", { name: "light" }));
    expect(onChange).toHaveBeenCalledWith("light");
  });

  it("announces an error message when invalid", () => {
    render(<ThemeSwitcher state="invalid" errorMessage="Pick a theme" />);
    expect(screen.getByText("Pick a theme")).toBeInTheDocument();
  });

  it("works with a numeric enum, not just strings", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    enum Density {
      Compact = 0,
      Cozy = 1,
    }
    render(
      <RadioGroup label="Density" value={Density.Compact} onChange={onChange}>
        {({ RadioGroupItem }) => (
          <>
            <RadioGroupItem value={Density.Compact}>Compact</RadioGroupItem>
            <RadioGroupItem value={Density.Cozy}>Cozy</RadioGroupItem>
          </>
        )}
      </RadioGroup>,
    );

    await user.click(screen.getByRole("radio", { name: "Cozy" }));
    expect(onChange).toHaveBeenCalledWith(Density.Cozy);
  });
});
