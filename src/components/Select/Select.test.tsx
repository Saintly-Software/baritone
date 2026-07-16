import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { Select, type SelectOption, type SelectOptionGroup } from "./index";

const OPTIONS: SelectOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Elderberry", value: "elderberry", disabled: true },
];

const GROUPED: SelectOptionGroup[] = [
  {
    label: "Citrus",
    options: [
      { label: "Lemon", value: "lemon" },
      { label: "Lime", value: "lime" },
    ],
  },
  {
    label: "Berries",
    options: [
      { label: "Strawberry", value: "strawberry" },
      { label: "Blueberry", value: "blueberry" },
    ],
  },
];

// Controlled single-select host, mirroring documented usage.
function SingleHost({
  value: initial = null,
  onChange,
  ...rest
}: {
  value?: string | null;
  onChange?: (value: string | null) => void;
} & Partial<React.ComponentProps<typeof Select>>) {
  const [value, setValue] = React.useState<string | null>(initial);
  return (
    <Select
      label="Fruit"
      placeholder="Pick one"
      options={OPTIONS}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      {...(rest as object)}
    />
  );
}

// Controlled multi-select host.
function MultiHost({
  value: initial = [],
  onChange,
}: {
  value?: string[];
  onChange?: (value: string[]) => void;
}) {
  const [value, setValue] = React.useState<string[]>(initial);
  return (
    <Select
      multiple
      label="Fruit"
      placeholder="Pick some"
      options={OPTIONS}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

describe("Select", () => {
  it("renders a combobox named by its label", () => {
    render(<SingleHost />);
    expect(screen.getByRole("combobox", { name: "Fruit" })).toBeInTheDocument();
  });

  it("shows the placeholder when nothing is selected", () => {
    render(<SingleHost />);
    expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveTextContent("Pick one");
  });

  it("reflects the controlled value on the trigger", () => {
    render(<SingleHost value="banana" />);
    expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveTextContent("Banana");
  });

  it("opens the listbox and lists every option", async () => {
    const user = userEvent.setup();
    render(<SingleHost />);

    await user.click(screen.getByRole("combobox", { name: "Fruit" }));

    const listbox = await screen.findByRole("listbox");
    expect(within(listbox).getAllByRole("option")).toHaveLength(OPTIONS.length);
  });

  it("selects an option, committing the value and closing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SingleHost onChange={onChange} />);

    await user.click(screen.getByRole("combobox", { name: "Fruit" }));
    await user.click(await screen.findByRole("option", { name: "Cherry" }));

    expect(onChange).toHaveBeenCalledWith("cherry");
    expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveTextContent("Cherry");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("does not select a disabled option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SingleHost onChange={onChange} />);

    await user.click(screen.getByRole("combobox", { name: "Fruit" }));
    await user.click(await screen.findByRole("option", { name: "Elderberry" }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("clears the value with the clear button", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SingleHost value="apple" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Clear selection" }));

    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveTextContent("Pick one");
  });

  it("hides the clear button when hideClearButton is set", () => {
    render(<SingleHost value="apple" hideClearButton />);
    expect(screen.queryByRole("button", { name: "Clear selection" })).not.toBeInTheDocument();
  });

  it("has no clear button when there is no value", () => {
    render(<SingleHost />);
    expect(screen.queryByRole("button", { name: "Clear selection" })).not.toBeInTheDocument();
  });

  it("toggles values in multiple mode and marks selected options", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MultiHost value={["apple"]} onChange={onChange} />);

    await user.click(screen.getByRole("combobox", { name: "Fruit" }));

    expect(await screen.findByRole("option", { name: "Apple" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    // Selecting a second option keeps the popup open and appends to the array.
    await user.click(screen.getByRole("option", { name: "Banana" }));
    expect(onChange).toHaveBeenCalledWith(["apple", "banana"]);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  // One message slot: the same line stays put and changes *presentation* with
  // `state`, rather than a separate error line appearing.
  it("renders the helpText as an error when invalid", () => {
    const { rerender } = render(<SingleHost state="neutral" helpText="Required" />);
    expect(screen.getByText("Required").querySelector("svg")).toBeNull();

    rerender(<SingleHost state="invalid" helpText="Required" />);
    expect(screen.getByText("Required").querySelector("svg")).not.toBeNull();
  });

  it("uses aria-disabled (not the disabled attribute) so it stays tabbable", async () => {
    const user = userEvent.setup();
    render(<SingleHost value="apple" disabled />);
    const trigger = screen.getByRole("combobox", { name: "Fruit" });

    expect(trigger).toHaveAttribute("aria-disabled", "true");
    expect(trigger).not.toBeDisabled();

    await user.tab();
    expect(trigger).toHaveFocus();
  });

  it("does not commit a selection while disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SingleHost disabled onChange={onChange} />);

    await user.click(screen.getByRole("combobox", { name: "Fruit" }));
    const banana = screen.queryByRole("option", { name: "Banana" });
    if (banana) await user.click(banana);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("marks the trigger busy while loading", () => {
    render(<SingleHost loading />);
    expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveAttribute("aria-busy", "true");
  });

  describe("grouped options", () => {
    function GroupedHost({ onChange }: { onChange?: (value: string | null) => void }) {
      const [value, setValue] = React.useState<string | null>(null);
      return (
        <Select
          label="Fruit"
          placeholder="Pick one"
          options={GROUPED}
          value={value}
          onChange={(next) => {
            setValue(next);
            onChange?.(next);
          }}
        />
      );
    }

    it("renders each group under a labelled heading with all its options", async () => {
      const user = userEvent.setup();
      render(<GroupedHost />);

      await user.click(screen.getByRole("combobox", { name: "Fruit" }));

      expect(await screen.findByRole("group", { name: "Citrus" })).toBeInTheDocument();
      expect(screen.getByRole("group", { name: "Berries" })).toBeInTheDocument();
      expect(screen.getAllByRole("option")).toHaveLength(4);
    });

    it("scopes each option to its group", async () => {
      const user = userEvent.setup();
      render(<GroupedHost />);

      await user.click(screen.getByRole("combobox", { name: "Fruit" }));

      const citrus = await screen.findByRole("group", { name: "Citrus" });
      expect(within(citrus).getByRole("option", { name: "Lemon" })).toBeInTheDocument();
      expect(within(citrus).queryByRole("option", { name: "Strawberry" })).not.toBeInTheDocument();
    });

    it("selects an option from a group, committing its value", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<GroupedHost onChange={onChange} />);

      await user.click(screen.getByRole("combobox", { name: "Fruit" }));
      await user.click(await screen.findByRole("option", { name: "Strawberry" }));

      expect(onChange).toHaveBeenCalledWith("strawberry");
      expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveTextContent("Strawberry");
    });
  });
});
