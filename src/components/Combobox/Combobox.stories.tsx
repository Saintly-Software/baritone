import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { FORM_STATES, SIZES } from "../../theme/constants";
import { Combobox, type ComboboxOption } from "./index";

const FRUITS: ComboboxOption[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date" },
  { value: "elderberry", label: "Elderberry" },
  { value: "fig", label: "Fig" },
  { value: "grape", label: "Grape" },
  { value: "kiwi", label: "Kiwi", disabled: true },
  { value: "lemon", label: "Lemon" },
  { value: "mango", label: "Mango" },
];

const meta: Meta<typeof Combobox> = {
  title: "Form Controls/Combobox",
  component: Combobox,
  args: {
    label: "Fruit",
    placeholder: "Search fruit…",
    options: FRUITS,
    state: "neutral",
    size: "md",
  },
  argTypes: {
    state: { control: "select", options: FORM_STATES },
    size: { control: "select", options: SIZES },
    options: { control: false },
    search: { control: false },
  },
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

/** Synchronous options with built-in typeahead filtering. */
export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {SIZES.map((size) => (
        <Combobox key={size} label={`Size ${size}`} size={size} options={FRUITS} />
      ))}
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {FORM_STATES.map((state) => (
        <Combobox
          key={state}
          label={`State: ${state}`}
          options={FRUITS}
          state={state}
          description={state === "warning" ? "Double-check this choice." : undefined}
          errorMessage={state === "invalid" ? "Please pick a fruit." : undefined}
          defaultValue={state === "valid" ? "apple" : undefined}
        />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    label: "Fruit (disabled, still focusable)",
    disabled: true,
    defaultValue: "apple",
    description: "Uses aria-disabled so it stays keyboard-reachable.",
  },
};

/** `freeText` lets the user commit a value that isn't in the list via an "Add …" row. */
export const FreeText: Story = {
  args: {
    label: "Tag",
    freeText: true,
    placeholder: "Pick or type a tag…",
    description: 'Type something not in the list to see the "Add …" option.',
  },
};

/** `multiple` renders each selection as a removable chip inside the control. */
export const Multiple: Story = {
  args: {
    label: "Fruits",
    multiple: true,
    defaultValue: ["apple", "cherry"],
    placeholder: "Add more…",
  },
};

/** A mocked async search: `onSearch` debounces, the popup shows spinner / error / empty / results. */
export const AsyncSearch: Story = {
  render: () => <AsyncExample />,
};

/** `virtualized` windows a very long list so only the visible rows are mounted. */
export const Virtualized: Story = {
  render: () => {
    const many: ComboboxOption[] = React.useMemo(
      () =>
        Array.from({ length: 5000 }, (_, i) => ({
          value: `option-${i}`,
          label: `Option ${i + 1}`,
        })),
      [],
    );
    return <Combobox label="Row (5,000 options)" options={many} virtualized />;
  },
};

// ---------------------------------------------------------------------------

const CITIES = [
  "Amsterdam",
  "Berlin",
  "Chicago",
  "Denver",
  "Edinburgh",
  "Florence",
  "Geneva",
  "Helsinki",
  "Istanbul",
  "Jakarta",
  "Kyoto",
  "Lisbon",
  "Madrid",
  "Nairobi",
  "Oslo",
  "Paris",
  "Quito",
  "Rome",
  "Seoul",
  "Tokyo",
];

/**
 * Simulates a debounced, abortable remote search. The `onSearch` handler cancels
 * any in-flight timer before starting the next one — the same shape you'd use to
 * `abortController.abort()` a real request.
 */
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
      // Pretend "xyz" always errors, to exercise the error state.
      if (q.toLowerCase() === "xyz") {
        setError("Something went wrong. Try again.");
        setResults([]);
      } else {
        setResults(
          CITIES.filter((c) => c.toLowerCase().includes(q.toLowerCase())).map((c) => ({
            value: c.toLowerCase(),
            label: c,
          })),
        );
      }
      setLoading(false);
    }, 700);
  }, []);

  return (
    <Combobox
      label="City"
      placeholder="Search cities…"
      description='Try "a", or "xyz" for the error state.'
      search={{ loading, error, results, onSearch }}
    />
  );
}
