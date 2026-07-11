import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { Select, type SelectOption } from "./index";

const OPTIONS: SelectOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Elderberry", value: "elderberry", disabled: true },
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

  it("shows the error message only when invalid", () => {
    const { rerender } = render(<SingleHost state="neutral" errorMessage="Required" />);
    expect(screen.queryByText("Required")).not.toBeInTheDocument();

    rerender(<SingleHost state="invalid" errorMessage="Required" />);
    expect(screen.getByText("Required")).toBeInTheDocument();
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
});
