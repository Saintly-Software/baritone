import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Combobox, type ComboboxOption, type ComboboxOptionGroup } from "./index";

const FRUITS: ComboboxOption[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

const GROUPED: ComboboxOptionGroup[] = [
  {
    label: "Citrus",
    options: [
      { value: "lemon", label: "Lemon" },
      { value: "lime", label: "Lime" },
    ],
  },
  {
    label: "Berries",
    options: [
      { value: "strawberry", label: "Strawberry" },
      { value: "blueberry", label: "Blueberry" },
    ],
  },
];

describe("Combobox", () => {
  it("associates its label with the input", () => {
    render(<Combobox label="Fruit" options={FRUITS} placeholder="Pick one" />);
    const input = screen.getByRole("combobox", { name: "Fruit" });
    expect(input).toHaveRole("combobox");
  });

  it("uses aria-disabled + readOnly and stays keyboard-focusable when disabled", async () => {
    const user = userEvent.setup();
    render(<Combobox label="Fruit" options={FRUITS} disabled />);
    const input = screen.getByRole("combobox", { name: "Fruit" });

    expect(input).toHaveAttribute("aria-disabled", "true");
    expect(input).toHaveAttribute("readonly");
    expect(input).not.toBeDisabled();

    await user.tab();
    expect(input).toHaveFocus();
  });

  it("opens the popup and renders the options, queryable in jsdom", async () => {
    const user = userEvent.setup();
    render(<Combobox label="Fruit" options={FRUITS} />);

    expect(screen.queryByRole("option")).not.toBeInTheDocument();

    await user.click(screen.getByRole("combobox", { name: "Fruit" }));

    const listbox = await screen.findByRole("listbox");
    expect(within(listbox).getAllByRole("option")).toHaveLength(3);
    expect(within(listbox).getByRole("option", { name: "Apple" })).toBeInTheDocument();
  });

  it("reports the selected option's value through onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Combobox label="Fruit" options={FRUITS} onValueChange={onValueChange} />);

    await user.click(screen.getByRole("combobox", { name: "Fruit" }));
    await user.click(await screen.findByRole("option", { name: "Banana" }));

    expect(onValueChange).toHaveBeenCalledWith("banana");
  });

  it("filters options as the user types", async () => {
    const user = userEvent.setup();
    render(<Combobox label="Fruit" options={FRUITS} />);

    await user.click(screen.getByRole("combobox", { name: "Fruit" }));
    await user.keyboard("ch");

    const listbox = await screen.findByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("Cherry");
  });

  describe("async search", () => {
    it("shows the loading spinner state", async () => {
      const user = userEvent.setup();
      render(<Combobox label="City" search={{ loading: true, results: [] }} />);

      await user.click(screen.getByRole("combobox", { name: "City" }));

      expect(await screen.findByText("Searching…")).toBeInTheDocument();
    });

    it("shows the error state", async () => {
      const user = userEvent.setup();
      render(<Combobox label="City" search={{ error: "Network error", results: [] }} />);

      await user.click(screen.getByRole("combobox", { name: "City" }));

      expect(await screen.findByText("Network error")).toBeInTheDocument();
    });

    it("shows the empty state when there are no results", async () => {
      const user = userEvent.setup();
      render(<Combobox label="City" search={{ results: [] }} />);

      await user.click(screen.getByRole("combobox", { name: "City" }));

      expect(await screen.findByText("No results found.")).toBeInTheDocument();
    });

    it("renders the results and calls onSearch as the query changes", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      render(
        <Combobox
          label="City"
          search={{ results: [{ value: "par", label: "Paris" }], onSearch }}
        />,
      );

      const input = screen.getByRole("combobox", { name: "City" });
      await user.click(input);
      await user.keyboard("pa");

      expect(onSearch).toHaveBeenCalled();
      expect(onSearch).toHaveBeenLastCalledWith("pa");
      expect(await screen.findByRole("option", { name: "Paris" })).toBeInTheDocument();
    });
  });

  it("offers a free-text 'Add' option and commits it when freeText is set", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Combobox label="Tag" options={FRUITS} freeText onValueChange={onValueChange} />);

    await user.click(screen.getByRole("combobox", { name: "Tag" }));
    await user.keyboard("mango");

    const createOption = await screen.findByRole("option", { name: /mango/i });
    await user.click(createOption);

    expect(onValueChange).toHaveBeenCalledWith("mango");
  });

  it("does not offer a free-text option without freeText", async () => {
    const user = userEvent.setup();
    render(<Combobox label="Fruit" options={FRUITS} />);

    await user.click(screen.getByRole("combobox", { name: "Fruit" }));
    await user.keyboard("mango");

    expect(await screen.findByText("No results found.")).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /add/i })).not.toBeInTheDocument();
  });

  describe("multiple", () => {
    it("renders a chip per selected value with a remove control", () => {
      render(
        <Combobox label="Fruit" options={FRUITS} multiple defaultValue={["apple", "cherry"]} />,
      );

      expect(screen.getByText("Apple")).toBeInTheDocument();
      expect(screen.getByText("Cherry")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Remove Apple" })).toBeInTheDocument();
    });

    it("reports an array of values through onValueChange", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Combobox
          label="Fruit"
          options={FRUITS}
          multiple
          defaultValue={["apple"]}
          onValueChange={onValueChange}
        />,
      );

      await user.click(screen.getByRole("combobox", { name: "Fruit" }));
      await user.click(await screen.findByRole("option", { name: "Banana" }));

      expect(onValueChange).toHaveBeenCalledWith(["apple", "banana"]);
    });
  });

  it("clears the value with the clear button", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Combobox
        label="Fruit"
        options={FRUITS}
        defaultValue="apple"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("shows the error message and marks the field invalid in the invalid state", () => {
    render(
      <Combobox label="Fruit" options={FRUITS} state="invalid" helpText="Please pick a fruit" />,
    );
    expect(screen.getByText("Please pick a fruit")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveAttribute("aria-invalid", "true");
  });

  describe("grouped options", () => {
    it("renders options under labelled group headings", async () => {
      const user = userEvent.setup();
      render(<Combobox label="Fruit" options={GROUPED} />);

      await user.click(screen.getByRole("combobox", { name: "Fruit" }));

      expect(await screen.findByRole("group", { name: "Citrus" })).toBeInTheDocument();
      expect(screen.getByRole("group", { name: "Berries" })).toBeInTheDocument();
      // Every option across every group is listed.
      expect(screen.getAllByRole("option")).toHaveLength(4);
    });

    it("scopes each option to its group", async () => {
      const user = userEvent.setup();
      render(<Combobox label="Fruit" options={GROUPED} />);

      await user.click(screen.getByRole("combobox", { name: "Fruit" }));

      const citrus = await screen.findByRole("group", { name: "Citrus" });
      expect(within(citrus).getByRole("option", { name: "Lemon" })).toBeInTheDocument();
      expect(within(citrus).queryByRole("option", { name: "Strawberry" })).not.toBeInTheDocument();
    });

    it("filters within groups and drops groups with no matches", async () => {
      const user = userEvent.setup();
      render(<Combobox label="Fruit" options={GROUPED} />);

      await user.click(screen.getByRole("combobox", { name: "Fruit" }));
      await user.keyboard("straw");

      expect(await screen.findByRole("group", { name: "Berries" })).toBeInTheDocument();
      expect(screen.queryByRole("group", { name: "Citrus" })).not.toBeInTheDocument();
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent("Strawberry");
    });

    it("reports the selected option's value from a group", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Combobox label="Fruit" options={GROUPED} onValueChange={onValueChange} />);

      await user.click(screen.getByRole("combobox", { name: "Fruit" }));
      await user.click(await screen.findByRole("option", { name: "Lime" }));

      expect(onValueChange).toHaveBeenCalledWith("lime");
    });
  });

  it("virtualizes long lists, mounting only a window of options", async () => {
    const user = userEvent.setup();
    const many: ComboboxOption[] = Array.from({ length: 1000 }, (_, i) => ({
      value: `item-${i}`,
      label: `Item ${i}`,
    }));
    render(<Combobox label="Item" options={many} virtualized />);

    await user.click(screen.getByRole("combobox", { name: "Item" }));

    const listbox = await screen.findByRole("listbox");
    const rendered = within(listbox).getAllByRole("option");
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.length).toBeLessThan(100);
    expect(within(listbox).getByRole("option", { name: "Item 0" })).toBeInTheDocument();
  });
});
