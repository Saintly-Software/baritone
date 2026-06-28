import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { ToggleGroup } from "./index";

type View = "list" | "board" | "calendar";

// A tiny controlled host mirroring the documented usage, so the type-safe
// render-prop pattern is exercised exactly as a consumer would write it.
function ViewToggle({
  value: initial = "list",
  onChange,
  disabled,
}: {
  value?: View;
  onChange?: (value: View) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = React.useState<View>(initial);
  return (
    <ToggleGroup
      aria-label="View"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      disabled={disabled}
    >
      {({ ToggleGroupItem }) => (
        <>
          <ToggleGroupItem value="list">List</ToggleGroupItem>
          <ToggleGroupItem value="board">Board</ToggleGroupItem>
          <ToggleGroupItem value="calendar">Calendar</ToggleGroupItem>
        </>
      )}
    </ToggleGroup>
  );
}

describe("ToggleGroup", () => {
  it("renders a named group with one toggle button per item", () => {
    render(<ViewToggle />);
    expect(screen.getByRole("group", { name: "View" })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "List" })).toBeInTheDocument();
  });

  it("reflects the controlled value as the pressed segment", () => {
    render(<ViewToggle value="board" />);
    expect(screen.getByRole("button", { name: "Board" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onChange with the selected value when a segment is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ViewToggle onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Board" }));

    expect(onChange).toHaveBeenCalledWith("board");
    expect(screen.getByRole("button", { name: "Board" })).toHaveAttribute("aria-pressed", "true");
  });

  it("defaults a segment's label to its value", () => {
    render(
      <ToggleGroup<View> aria-label="View" value="list" onChange={() => {}}>
        {({ ToggleGroupItem }) => (
          <>
            <ToggleGroupItem value="list" />
            <ToggleGroupItem value="board" />
          </>
        )}
      </ToggleGroup>,
    );
    expect(screen.getByRole("button", { name: "list" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "board" })).toBeInTheDocument();
  });

  it("focuses the selected segment on Tab (roving tab stop), not the first", async () => {
    const user = userEvent.setup();
    render(<ViewToggle value="board" />);

    await user.tab();
    // Tab enters the group on the *selected* segment, even though it isn't first.
    expect(screen.getByRole("button", { name: "Board" })).toHaveFocus();
  });

  it("moves focus with the arrows without selecting, and selects on Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ViewToggle value="list" onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole("button", { name: "List" })).toHaveFocus();

    // The arrow keys move the roving focus but must NOT select (no auto-activation).
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Board" })).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();

    // Enter selects the focused segment.
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("board");
  });

  it("keeps the current selection when the active segment is pressed again", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ViewToggle value="list" onChange={onChange} />);

    // Re-pressing the selected segment must not clear it — one value is always set.
    await user.click(screen.getByRole("button", { name: "List" }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
  });

  it("marks a disabled group with aria-disabled and keeps its segments tabbable", async () => {
    const user = userEvent.setup();
    render(<ViewToggle value="board" disabled />);

    // The group carries the disabled semantics...
    expect(screen.getByRole("group", { name: "View" })).toHaveAttribute("aria-disabled", "true");
    // ...but no segment gets the native attribute that would drop it from focus.
    const selected = screen.getByRole("button", { name: "Board" });
    expect(selected).not.toBeDisabled();

    // Tab still reaches the group, landing on the selected segment.
    await user.tab();
    expect(selected).toHaveFocus();
  });

  it("still arrow-navigates while disabled, but cannot change the value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ViewToggle value="list" disabled onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole("button", { name: "List" })).toHaveFocus();

    // Arrow keys keep working even though the group is disabled...
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Board" })).toHaveFocus();

    // ...but activating the focused segment can't change the value.
    await user.keyboard("{Enter}");
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
  });

  it("does not change value when a disabled group's segment is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ViewToggle value="list" disabled onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Board" }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
  });
});
