import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Combobox, type ComboboxOption, type ComboboxOptionGroup } from "./index";

const FRUITS: ComboboxOption[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date" },
  { value: "elderberry", label: "Elderberry" },
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

/**
 * Interaction coverage for `Combobox`. The `play` functions open the popup and
 * exercise multi-select highlighting, list virtualization, the free-text "Add"
 * row, and the async error state.
 */
const meta: Meta<typeof Combobox> = {
  title: "Interaction Tests/Combobox",
  component: Combobox,
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

/**
 * Grouped options render under labelled headings; typing filters within each
 * group and drops groups with no remaining matches.
 */
export const GroupedFiltering: Story = {
  name: "Grouped filtering",
  render: () => <Combobox label="Fruit" options={GROUPED} placeholder="Search fruit…" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("combobox", { name: "Fruit" }));

    // Both groups show initially, each a labelled role="group".
    expect(await body.findByRole("group", { name: "Citrus" })).toBeInTheDocument();
    expect(body.getByRole("group", { name: "Berries" })).toBeInTheDocument();

    // Filtering to a berry drops the empty Citrus group.
    await userEvent.keyboard("straw");
    await waitFor(() =>
      expect(body.queryByRole("group", { name: "Citrus" })).not.toBeInTheDocument(),
    );
    expect(body.getByRole("group", { name: "Berries" })).toBeInTheDocument();
    const options = body.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("Strawberry");
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

/**
 * A mocked async search that stays pending: typing kicks off `onSearch`, the popup
 * enters `loading` and holds there so the snapshot captures the in-menu spinner.
 */
export const AsyncSearchLoading: Story = {
  name: "Async search loading",
  render: () => <PendingSearchExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "City" });
    await userEvent.click(input);
    await userEvent.keyboard("london");

    // The spinner and its "Searching…" copy live in the portaled popup.
    await waitFor(() => expect(within(document.body).getByText("Searching…")).toBeInTheDocument());
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

// A mock remote search that never resolves: any query leaves the popup in the
// loading state, so the story captures the in-menu spinner.
function PendingSearchExample() {
  const [loading, setLoading] = React.useState(false);

  const onSearch = React.useCallback((query: string) => {
    setLoading(query.trim() !== "");
  }, []);

  return (
    <Combobox
      label="City"
      placeholder="Search cities…"
      search={{ loading, error: undefined, results: [], onSearch }}
    />
  );
}

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
