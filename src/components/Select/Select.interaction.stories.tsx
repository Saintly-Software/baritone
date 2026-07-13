import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Select, type SelectOption } from "./index";

const FRUITS: SelectOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Dragonfruit", value: "dragonfruit" },
];

/**
 * Interaction coverage for `Select`. The `play` functions open the listbox and
 * drive selection, asserting the committed value and the ARIA state of options.
 */
const meta: Meta<typeof Select> = {
  title: "Interaction Tests/Select",
  component: Select,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Select>;

/** Opens the menu, picks an option, and asserts the trigger reflects it and the menu closes. */
export const SingleSelectPicksOption: Story = {
  render: () => {
    const [value, setValue] = React.useState<string | null>(null);
    return (
      <Select
        label="Favourite fruit"
        placeholder="Pick one"
        value={value}
        onChange={setValue}
        options={FRUITS}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: "Favourite fruit" });
    expect(trigger).toHaveTextContent("Pick one");

    await userEvent.click(trigger);
    const listbox = await within(document.body).findByRole("listbox");
    await userEvent.click(within(listbox).getByRole("option", { name: "Cherry" }));

    expect(trigger).toHaveTextContent("Cherry");
    await waitFor(() =>
      expect(within(document.body).queryByRole("listbox")).not.toBeInTheDocument(),
    );
  },
};

/**
 * A pre-seeded multi-select: the chosen option stays `aria-selected` while hover
 * only sets `data-highlighted`, so highlighting never changes what's selected.
 */
export const MultiSelectHoverSelectedOption: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>(["apple", "cherry"]);
    return (
      <Select
        multiple
        label="Fruit basket"
        placeholder="Pick some"
        value={value}
        onChange={setValue}
        options={FRUITS}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Fruit basket" }));

    const listbox = await within(document.body).findByRole("listbox");
    const apple = within(listbox).getByRole("option", { name: "Apple" });
    expect(apple).toHaveAttribute("aria-selected", "true");

    await userEvent.hover(apple);
    await waitFor(() => expect(apple).toHaveAttribute("data-highlighted"));
    // Hover highlights but must not change selection.
    expect(apple).toHaveAttribute("aria-selected", "true");
  },
};
