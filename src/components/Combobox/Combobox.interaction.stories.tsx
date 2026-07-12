import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Combobox, type ComboboxOption } from "./index";

const FRUITS: ComboboxOption[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date" },
  { value: "elderberry", label: "Elderberry" },
];

/**
 * Interaction coverage for `Combobox`. The `play` functions open the popup and
 * exercise multi-select highlighting, list virtualization, the free-text "Add"
 * row, and the async error state.
 */
const meta: Meta<typeof Combobox> = {
  title: "Form Controls/Combobox",
  component: Combobox,
  tags: ["!dev"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 340 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Combobox>;

/**
 * A pre-seeded multi-select: a chosen option stays `aria-selected` while hovering
 * another only sets `data-highlighted` — highlighting never changes selection.
 */
export const MultiSelectHighlight: Story = {
  name: "Multi-select highlight",
  render: () => (
    <Combobox label="Fruit" options={FRUITS} multiple defaultValue={["apple", "cherry"]} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Fruit" }));

    const listbox = await within(document.body).findByRole("listbox");
    const apple = within(listbox).getByRole("option", { name: "Apple" });
    expect(apple).toHaveAttribute("aria-selected", "true");

    const banana = within(listbox).getByRole("option", { name: "Banana" });
    await userEvent.hover(banana);
    await waitFor(() => expect(banana).toHaveAttribute("data-highlighted"));
    // Highlighting a different row must not disturb the existing selection.
    expect(apple).toHaveAttribute("aria-selected", "true");
  },
};

/** A 5,000-option list virtualizes: only a small window of rows is mounted. */
export const VirtualizedWindowing: Story = {
  name: "Virtualized windowing",
  render: () => {
    const many: ComboboxOption[] = React.useMemo(
      () =>
        Array.from({ length: 5000 }, (_, i) => ({
          value: `option-${i}`,
          label: `Option ${i + 1}`,
        })),
      [],
    );
    return <Combobox label="Row" options={many} virtualized />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Row" }));

    const listbox = await within(document.body).findByRole("listbox");
    const rendered = within(listbox).getAllByRole("option");
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.length).toBeLessThan(100);
  },
};

/** With `freeText`, typing a value not in the list offers an "Add" row to commit it. */
export const FreeTextAddRow: Story = {
  name: "Free-text add row",
  render: () => (
    <Combobox label="Tag" options={FRUITS} freeText placeholder="Pick or type a tag…" />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Tag" }));
    await userEvent.keyboard("kumquat");

    const addRow = await within(document.body).findByRole("option", { name: /kumquat/i });
    expect(addRow).toBeInTheDocument();
  },
};

/** A mocked async search: querying "xyz" resolves to the error copy, replacing the spinner. */
export const AsyncSearchError: Story = {
  name: "Async search error",
  render: () => <AsyncExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "City" });
    await userEvent.click(input);
    await userEvent.keyboard("xyz");

    await waitFor(
      () =>
        expect(
          within(document.body).getByText("Something went wrong. Try again."),
        ).toBeInTheDocument(),
      { timeout: 3000 },
    );
  },
};

// A debounced, abortable mock remote search: "xyz" always errors.
function AsyncExample() {
  const [results, setResults] = React.useState<ComboboxOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  const onSearch = React.useCallback((query: string) => {
    clearTimeout(timer.current);
    const q = query.trim();
    if (q === "") {
      setResults([]);
      setLoading(false);
      setError(undefined);
      return;
    }
    setLoading(true);
    setError(undefined);
    timer.current = setTimeout(() => {
      if (q.toLowerCase() === "xyz") {
        setError("Something went wrong. Try again.");
        setResults([]);
      } else {
        setResults([{ value: q.toLowerCase(), label: q }]);
      }
      setLoading(false);
    }, 500);
  }, []);

  return (
    <Combobox
      label="City"
      placeholder="Search cities…"
      search={{ loading, error, results, onSearch }}
    />
  );
}
