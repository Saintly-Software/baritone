import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { resolveWidth } from "../../styles/layoutProps";
import { atoms } from "../../styles/sprinkles.css";
import { fieldRoot } from "../Field/field.css";
import { ToggleGroup } from "./index";

type View = "list" | "board" | "calendar";

function ViewToggle({
  value: initial = "list",
  onChange,
  disabled,
  orientation,
}: {
  value?: View;
  onChange?: (value: View, event: Event) => void;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
}) {
  const [value, setValue] = React.useState<View>(initial);
  return (
    <ToggleGroup
      aria-label="View"
      value={value}
      onChange={(next, event) => {
        setValue(next);
        onChange?.(next, event);
      }}
      disabled={disabled}
      orientation={orientation}
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

    expect(onChange).toHaveBeenCalledWith("board", expect.any(Event));
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

  it("names a segment from aria-label when its children would flatten misleadingly", () => {
    render(
      <ToggleGroup<View> aria-label="View" value="list" onChange={() => {}}>
        {({ ToggleGroupItem }) => (
          <>
            <ToggleGroupItem value="list" aria-label="List view">
              List <span>3</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="board">
              Board <span>7</span>
            </ToggleGroupItem>
          </>
        )}
      </ToggleGroup>,
    );
    expect(screen.getByRole("button", { name: "List view" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "List 3" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Board 7" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "board" })).not.toBeInTheDocument();
  });

  it("focuses the selected segment on Tab (roving tab stop), not the first", async () => {
    const user = userEvent.setup();
    render(<ViewToggle value="board" />);

    await user.tab();
    expect(screen.getByRole("button", { name: "Board" })).toHaveFocus();
  });

  it("moves focus with the arrows without selecting, and selects on Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ViewToggle value="list" onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole("button", { name: "List" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Board" })).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();

    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("board", expect.any(Event));
  });

  it("keeps the current selection when the active segment is pressed again", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ViewToggle value="list" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "List" }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
  });

  describe("icons", () => {
    it("renders startIcon/endIcon around the label, keeping the label as the name", () => {
      render(
        <ToggleGroup<View> aria-label="View" value="list" onChange={() => {}}>
          {({ ToggleGroupItem }) => (
            <ToggleGroupItem
              value="list"
              startIcon={<span data-testid="start-glyph" aria-hidden />}
              endIcon={<span data-testid="end-glyph" aria-hidden />}
            >
              List
            </ToggleGroupItem>
          )}
        </ToggleGroup>,
      );
      const button = screen.getByRole("button", { name: "List" });
      expect(button).toContainElement(screen.getByTestId("start-glyph"));
      expect(button).toContainElement(screen.getByTestId("end-glyph"));
    });

    it("renders an icon-only segment named by its required aria-label, with no visible text", () => {
      render(
        <ToggleGroup<View> aria-label="View" value="list" onChange={() => {}}>
          {({ ToggleGroupItem }) => (
            <>
              <ToggleGroupItem
                value="list"
                aria-label="List view"
                icon={<span data-testid="glyph" aria-hidden />}
              />
              <ToggleGroupItem value="board">Board</ToggleGroupItem>
            </>
          )}
        </ToggleGroup>,
      );
      const iconOnly = screen.getByRole("button", { name: "List view" });
      expect(iconOnly).toContainElement(screen.getByTestId("glyph"));
      expect(iconOnly.textContent).toBe("");
      expect(iconOnly).toHaveAttribute("aria-pressed", "true");
    });

    it("selects an icon-only segment on click, like any other", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <ToggleGroup<View> aria-label="View" value="list" onChange={onChange}>
          {({ ToggleGroupItem }) => (
            <>
              <ToggleGroupItem value="list">List</ToggleGroupItem>
              <ToggleGroupItem value="board" aria-label="Board" icon={<span aria-hidden />} />
            </>
          )}
        </ToggleGroup>,
      );

      await user.click(screen.getByRole("button", { name: "Board" }));

      expect(onChange).toHaveBeenCalledWith("board", expect.any(Event));
    });

    it("type-enforces the icon-only arm", () => {
      render(
        <ToggleGroup<View> aria-label="View" value="list" onChange={() => {}}>
          {({ ToggleGroupItem }) => (
            <>
              {/* @ts-expect-error — icon-only requires an aria-label to name it. */}
              <ToggleGroupItem value="list" icon={<span aria-hidden />} />
              {/* @ts-expect-error — `icon` is mutually exclusive with `startIcon`/`endIcon`. */}
              <ToggleGroupItem
                value="board"
                aria-label="Board"
                icon={<span aria-hidden />}
                startIcon={<span aria-hidden />}
              />
            </>
          )}
        </ToggleGroup>,
      );
      expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    });
  });

  describe("orientation", () => {
    it("defaults to horizontal: Left/Right move focus, Up/Down don't", async () => {
      const user = userEvent.setup();
      render(<ViewToggle value="list" />);

      await user.tab();
      expect(screen.getByRole("button", { name: "List" })).toHaveFocus();

      await user.keyboard("{ArrowRight}");
      expect(screen.getByRole("button", { name: "Board" })).toHaveFocus();

      await user.keyboard("{ArrowDown}");
      expect(screen.getByRole("button", { name: "Board" })).toHaveFocus();
    });

    it("vertical: Up/Down move focus, Left/Right don't", async () => {
      const user = userEvent.setup();
      render(<ViewToggle value="list" orientation="vertical" />);

      await user.tab();
      expect(screen.getByRole("button", { name: "List" })).toHaveFocus();

      await user.keyboard("{ArrowDown}");
      expect(screen.getByRole("button", { name: "Board" })).toHaveFocus();

      await user.keyboard("{ArrowRight}");
      expect(screen.getByRole("button", { name: "Board" })).toHaveFocus();

      await user.keyboard("{ArrowUp}");
      expect(screen.getByRole("button", { name: "List" })).toHaveFocus();
    });

    it("reflects the axis on the group's data-orientation", () => {
      const { rerender } = render(<ViewToggle value="list" />);
      expect(screen.getByRole("group", { name: "View" })).toHaveAttribute(
        "data-orientation",
        "horizontal",
      );

      rerender(<ViewToggle value="list" orientation="vertical" />);
      expect(screen.getByRole("group", { name: "View" })).toHaveAttribute(
        "data-orientation",
        "vertical",
      );
      expect(screen.getByRole("group", { name: "View" })).not.toHaveAttribute("aria-orientation");
    });

    it("still lands Tab on the selected segment in a vertical group", async () => {
      const user = userEvent.setup();
      render(<ViewToggle value="board" orientation="vertical" />);

      await user.tab();
      expect(screen.getByRole("button", { name: "Board" })).toHaveFocus();
    });
  });

  describe("width", () => {
    function widthGroup(width?: "fill") {
      return render(
        <ToggleGroup<View> aria-label="View" width={width} value="list" onChange={() => {}}>
          {({ ToggleGroupItem }) => (
            <>
              <ToggleGroupItem value="list">List</ToggleGroupItem>
              <ToggleGroupItem value="board">Board</ToggleGroupItem>
            </>
          )}
        </ToggleGroup>,
      );
    }

    const fillAtom = atoms({ width: resolveWidth("fill") });

    it("spans the container and fills the wrapping Field when width='fill'", () => {
      const { container } = widthGroup("fill");
      expect(screen.getByRole("group", { name: "View" })).toHaveClass(fillAtom);
      expect(container.firstChild).toHaveClass(fieldRoot({ fit: "fill", labelPosition: "top" }));
    });

    it("shrink-wraps (Field fit='content', no width atom) when width is omitted", () => {
      const { container } = widthGroup();
      expect(screen.getByRole("group", { name: "View" })).not.toHaveClass(fillAtom);
      expect(container.firstChild).toHaveClass(fieldRoot({ fit: "content", labelPosition: "top" }));
    });
  });

  describe("clearable", () => {
    function ClearableViewToggle({
      value: initial = null,
      onChange,
    }: {
      value?: View | null;
      onChange?: (value: View | null, event: Event) => void;
    }) {
      const [value, setValue] = React.useState<View | null>(initial);
      return (
        <ToggleGroup
          aria-label="View"
          clearable
          value={value}
          onChange={(next, event) => {
            setValue(next);
            onChange?.(next, event);
          }}
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

    it("renders nothing selected when the value is null", () => {
      render(<ClearableViewToggle value={null} />);
      for (const name of ["List", "Board", "Calendar"]) {
        expect(screen.getByRole("button", { name })).toHaveAttribute("aria-pressed", "false");
      }
    });

    it("selects a segment from the empty state", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ClearableViewToggle value={null} onChange={onChange} />);

      await user.click(screen.getByRole("button", { name: "Board" }));

      expect(onChange).toHaveBeenCalledWith("board", expect.any(Event));
      expect(screen.getByRole("button", { name: "Board" })).toHaveAttribute("aria-pressed", "true");
    });

    it("clears the selection with null when the active segment is re-pressed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ClearableViewToggle value="list" onChange={onChange} />);

      await user.click(screen.getByRole("button", { name: "List" }));

      expect(onChange).toHaveBeenCalledWith(null, expect.any(Event));
      expect(screen.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "false");
    });

    it("keeps an empty-string segment unselected while the group value is null", () => {
      type Filter = "" | "unread";
      render(
        <ToggleGroup<Filter> aria-label="Filter" clearable value={null} onChange={() => {}}>
          {({ ToggleGroupItem }) => (
            <>
              <ToggleGroupItem value="">All</ToggleGroupItem>
              <ToggleGroupItem value="unread">Unread</ToggleGroupItem>
            </>
          )}
        </ToggleGroup>,
      );
      expect(screen.getByRole("button", { name: "All" })).not.toHaveAttribute(
        "data-composite-item-active",
      );
      expect(screen.getByRole("button", { name: "Unread" })).not.toHaveAttribute(
        "data-composite-item-active",
      );
    });
  });

  it("marks a disabled group with aria-disabled and keeps its segments tabbable", async () => {
    const user = userEvent.setup();
    render(<ViewToggle value="board" disabled />);

    expect(screen.getByRole("group", { name: "View" })).toHaveAttribute("aria-disabled", "true");
    const selected = screen.getByRole("button", { name: "Board" });
    expect(selected).not.toBeDisabled();

    await user.tab();
    expect(selected).toHaveFocus();
  });

  it("still arrow-navigates while disabled, but cannot change the value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ViewToggle value="list" disabled onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole("button", { name: "List" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Board" })).toHaveFocus();

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

  describe("form-control mode", () => {
    it("names the group from the visible label", () => {
      render(
        <ToggleGroup<View> label="Default view" value="list" onChange={() => {}}>
          {({ ToggleGroupItem }) => (
            <>
              <ToggleGroupItem value="list">List</ToggleGroupItem>
              <ToggleGroupItem value="board">Board</ToggleGroupItem>
            </>
          )}
        </ToggleGroup>,
      );
      const group = screen.getByRole("group", { name: "Default view" });
      expect(group).toBeInTheDocument();
      expect(group).not.toHaveAttribute("aria-label");
    });

    it("throws when label and aria-label are both passed", () => {
      expect(() =>
        render(
          // @ts-expect-error — mutually exclusive: the union rejects this at compile time.
          <ToggleGroup<View>
            aria-label="ignored"
            label="Default view"
            value="list"
            onChange={() => {}}
          >
            {({ ToggleGroupItem }) => <ToggleGroupItem value="list">List</ToggleGroupItem>}
          </ToggleGroup>,
        ),
      ).toThrow(/mutually exclusive/);
    });

    it("wires inline help to the group via aria-describedby", () => {
      render(
        <ToggleGroup<View>
          label="Default view"
          helpText="Applies to new boards."
          value="list"
          onChange={() => {}}
        >
          {({ ToggleGroupItem }) => <ToggleGroupItem value="list">List</ToggleGroupItem>}
        </ToggleGroup>,
      );
      const group = screen.getByRole("group", { name: "Default view" });
      const describedBy = group.getAttribute("aria-describedby");
      expect(describedBy).toBeTruthy();
      expect(screen.getByText("Applies to new boards.")).toHaveAttribute("id", describedBy);
    });

    it("flags the group invalid and reddens the helpText when state is invalid", () => {
      render(
        <ToggleGroup<View>
          label="Default view"
          state="invalid"
          helpText="Pick a view."
          value="list"
          onChange={() => {}}
        >
          {({ ToggleGroupItem }) => <ToggleGroupItem value="list">List</ToggleGroupItem>}
        </ToggleGroup>,
      );
      const group = screen.getByRole("group", { name: "Default view" });
      expect(group).toHaveAttribute("aria-invalid", "true");
      const line = screen.getByText("Pick a view.");
      expect(group.getAttribute("aria-describedby")).toBe(line.getAttribute("id"));
      expect(line.querySelector("svg")).not.toBeNull();
    });

    it("leaves the helpText neutral, and the group valid, outside the invalid state", () => {
      render(
        <ToggleGroup<View>
          label="Default view"
          helpText="Pick a view."
          value="list"
          onChange={() => {}}
        >
          {({ ToggleGroupItem }) => <ToggleGroupItem value="list">List</ToggleGroupItem>}
        </ToggleGroup>,
      );
      expect(screen.getByText("Pick a view.").querySelector("svg")).toBeNull();
      expect(screen.getByRole("group")).not.toHaveAttribute("aria-invalid");
    });

    it("marks a required group with aria-required", () => {
      render(
        <ToggleGroup<View> label="Default view" required value="list" onChange={() => {}}>
          {({ ToggleGroupItem }) => <ToggleGroupItem value="list">List</ToggleGroupItem>}
        </ToggleGroup>,
      );
      expect(screen.getByRole("group", { name: "Default view" })).toHaveAttribute(
        "aria-required",
        "true",
      );
    });

    it("keeps label / help / invalid wiring on a vertical group with an inline label", () => {
      render(
        <ToggleGroup<View>
          label="Default view"
          orientation="vertical"
          labelPosition="start"
          state="invalid"
          helpText="Pick a view."
          value="list"
          onChange={() => {}}
        >
          {({ ToggleGroupItem }) => (
            <>
              <ToggleGroupItem value="list">List</ToggleGroupItem>
              <ToggleGroupItem value="board">Board</ToggleGroupItem>
            </>
          )}
        </ToggleGroup>,
      );
      const group = screen.getByRole("group", { name: "Default view" });
      expect(group).toHaveAttribute("data-orientation", "vertical");
      expect(group).toHaveAttribute("aria-invalid", "true");
      const line = screen.getByText("Pick a view.");
      expect(group.getAttribute("aria-describedby")).toBe(line.getAttribute("id"));
    });
  });
});
