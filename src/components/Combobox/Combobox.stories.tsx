import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { FORM_STATES, type FormState, SIZES } from "../../theme/constants";
import { Icon } from "../Icon";
import { Combobox, type ComboboxOption, type ComboboxOptionGroup } from "./index";

/** A 24×24 line/solid glyph, sized by the wrapping `<Icon>` and coloured by the cell. */
function Glyph({ d, solid }: { d: string; solid?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill={solid ? "currentColor" : "none"}
      stroke={solid ? "none" : "currentColor"}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

// A handful of recognisable glyphs for the icon-grid story. `label` stays a real
// word so typeahead still filters by name.
const ICON_OPTIONS: ComboboxOption[] = [
  {
    value: "star",
    label: "Star",
    icon: (
      <Icon size="lg">
        <Glyph
          solid
          d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.1 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z"
        />
      </Icon>
    ),
  },
  {
    value: "heart",
    label: "Heart",
    icon: (
      <Icon size="lg">
        <Glyph
          solid
          d="M12 20.3l-1.4-1.3C6 14.9 3.5 12.6 3.5 9.6A4.1 4.1 0 0 1 7.6 5.5c1.3 0 2.6.6 3.4 1.6.8-1 2.1-1.6 3.4-1.6a4.1 4.1 0 0 1 4.1 4.1c0 3-2.5 5.3-7.1 9.4z"
        />
      </Icon>
    ),
  },
  {
    value: "bell",
    label: "Bell",
    icon: (
      <Icon size="lg">
        <Glyph d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
      </Icon>
    ),
  },
  {
    value: "bookmark",
    label: "Bookmark",
    icon: (
      <Icon size="lg">
        <Glyph d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </Icon>
    ),
  },
  {
    value: "flag",
    label: "Flag",
    icon: (
      <Icon size="lg">
        <Glyph d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22V15" />
      </Icon>
    ),
  },
  {
    value: "bolt",
    label: "Bolt",
    icon: (
      <Icon size="lg">
        <Glyph solid d="M13 2L3 14h7l-1 8 11-13h-8z" />
      </Icon>
    ),
  },
  {
    value: "tag",
    label: "Tag",
    icon: (
      <Icon size="lg">
        <Glyph d="M20.6 13.4l-8-8A2 2 0 0 0 11.2 5H5a2 2 0 0 0-2 2v6.2a2 2 0 0 0 .6 1.4l8 8a2 2 0 0 0 2.8 0l6.2-6.2a2 2 0 0 0 0-2.8z" />
      </Icon>
    ),
  },
  {
    value: "sun",
    label: "Sun",
    icon: (
      <Icon size="lg">
        <Glyph d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </Icon>
    ),
  },
];

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

// Short, tile-like labels that suit the grid view.
const COLORS: ComboboxOption[] = [
  { value: "red", label: "Red" },
  { value: "orange", label: "Orange" },
  { value: "amber", label: "Amber" },
  { value: "yellow", label: "Yellow" },
  { value: "lime", label: "Lime" },
  { value: "green", label: "Green" },
  { value: "teal", label: "Teal" },
  { value: "cyan", label: "Cyan" },
  { value: "blue", label: "Blue" },
  { value: "indigo", label: "Indigo" },
  { value: "violet", label: "Violet" },
  { value: "pink", label: "Pink" },
];

const GROUPED_COLORS: ComboboxOptionGroup[] = [
  {
    label: "Warm",
    options: [
      { value: "red", label: "Red" },
      { value: "orange", label: "Orange" },
      { value: "amber", label: "Amber" },
      { value: "yellow", label: "Yellow" },
      { value: "pink", label: "Pink" },
    ],
  },
  {
    label: "Cool",
    options: [
      { value: "green", label: "Green" },
      { value: "teal", label: "Teal" },
      { value: "blue", label: "Blue" },
      { value: "indigo", label: "Indigo" },
      { value: "violet", label: "Violet" },
    ],
  },
];

const GROUPED_FRUITS: ComboboxOptionGroup[] = [
  {
    label: "Citrus",
    options: [
      { value: "lemon", label: "Lemon" },
      { value: "lime", label: "Lime" },
      { value: "orange", label: "Orange" },
    ],
  },
  {
    label: "Berries",
    options: [
      { value: "strawberry", label: "Strawberry" },
      { value: "blueberry", label: "Blueberry" },
      { value: "raspberry", label: "Raspberry" },
    ],
  },
  {
    label: "Stone fruit",
    options: [
      { value: "peach", label: "Peach" },
      { value: "plum", label: "Plum" },
      { value: "apricot", label: "Apricot", disabled: true },
    ],
  },
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
    columns: { control: { type: "number", min: 1, max: 6 } },
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

const thStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  opacity: 0.6,
  textAlign: "left",
  padding: "16px 20px",
  whiteSpace: "nowrap",
  verticalAlign: "top",
};

const cellStyle: React.CSSProperties = {
  padding: "16px 20px",
  borderTop: "1px solid rgba(128,128,128,0.25)",
  verticalAlign: "top",
};

interface StateRow {
  label: string;
  state?: FormState;
  disabled?: boolean;
  defaultValue?: string;
  helpText?: string;
}

// Every validation state plus disabled — the combinations that used to be their
// own stories, folded into one table.
const stateRows: StateRow[] = [
  { label: "neutral" },
  { label: "warning", state: "warning", helpText: "Double-check this choice." },
  { label: "invalid", state: "invalid", helpText: "Please pick a fruit." },
  { label: "valid", state: "valid", defaultValue: "apple" },
  {
    label: "disabled",
    disabled: true,
    defaultValue: "apple",
    helpText: "Uses aria-disabled so it stays keyboard-reachable.",
  },
];

/** Every state (rows) against the rendered control (right column). */
export const States: Story = {
  render: () => (
    <table style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={thStyle}>State</th>
          <th style={thStyle}>Combobox</th>
        </tr>
      </thead>
      <tbody>
        {stateRows.map((row) => (
          <tr key={row.label}>
            <th scope="row" style={{ ...thStyle, ...cellStyle }}>
              {row.label}
            </th>
            <td style={cellStyle}>
              <div style={{ maxWidth: 320 }}>
                <Combobox
                  label="Fruit"
                  options={FRUITS}
                  state={row.state}
                  disabled={row.disabled}
                  defaultValue={row.defaultValue}
                  helpText={row.helpText}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

/** `freeText` lets the user commit a value that isn't in the list via an "Add …" row. */
export const FreeText: Story = {
  args: {
    label: "Tag",
    freeText: true,
    placeholder: "Pick or type a tag…",
    helpText: 'Type something not in the list to see the "Add …" option.',
  },
};

/** Options organised into titled groups; typeahead filters within each group and hides empty ones. */
export const Grouped: Story = {
  args: {
    label: "Fruit",
    placeholder: "Search fruit…",
    options: GROUPED_FRUITS,
  },
};

/** Grouped options with `multiple` — selections still surface as chips in the control. */
export const GroupedMultiple: Story = {
  args: {
    label: "Fruits",
    multiple: true,
    options: GROUPED_FRUITS,
    defaultValue: ["lemon", "strawberry"],
    placeholder: "Add more…",
  },
};

/**
 * `columns` lays the options out as a grid instead of a single column — arrow keys
 * then move in two dimensions. Best for short, tile-like options (colours, icons,
 * emoji). Typing still filters, re-tiling the rows as the list narrows.
 */
export const Grid: Story = {
  args: {
    label: "Colour",
    placeholder: "Search colours…",
    options: COLORS,
    columns: 4,
  },
};

/** A grid that keeps its group headings — each group tiles under its own label. */
export const GridGrouped: Story = {
  args: {
    label: "Colour",
    placeholder: "Search colours…",
    options: GROUPED_COLORS,
    columns: 3,
  },
};

/** A grid with `multiple` — chosen tiles show a check and surface as chips in the control. */
export const GridMultiple: Story = {
  args: {
    label: "Colours",
    multiple: true,
    options: COLORS,
    columns: 4,
    defaultValue: ["red", "blue"],
    placeholder: "Add more…",
  },
};

/**
 * Options can carry an `icon` (typically an `<Icon>`). In the grid it sits above
 * the label caption; the `label` stays the accessible name, so typeahead still
 * filters by name (try "b" for Bell / Bookmark / Bolt).
 */
export const GridIcons: Story = {
  args: {
    label: "Icon",
    placeholder: "Search icons…",
    options: ICON_OPTIONS,
    columns: 4,
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
      helpText='Try "a", or "xyz" for the error state.'
      search={{ loading, error, results, onSearch }}
    />
  );
}
