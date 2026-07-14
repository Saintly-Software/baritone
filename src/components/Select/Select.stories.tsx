import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { type FormState, SIZES } from "../../theme/constants";
import { Select, type SelectOption, type SelectOptionGroup } from "./index";

const FRUITS: SelectOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Dragonfruit", value: "dragonfruit" },
  { label: "Elderberry (out of stock)", value: "elderberry", disabled: true },
  { label: "Fig", value: "fig" },
];

const GROUPED_FRUITS: SelectOptionGroup[] = [
  {
    label: "Citrus",
    options: [
      { label: "Lemon", value: "lemon" },
      { label: "Lime", value: "lime" },
      { label: "Orange", value: "orange" },
    ],
  },
  {
    label: "Berries",
    options: [
      { label: "Strawberry", value: "strawberry" },
      { label: "Blueberry", value: "blueberry" },
      { label: "Raspberry", value: "raspberry" },
    ],
  },
  {
    label: "Stone fruit",
    options: [
      { label: "Peach", value: "peach" },
      { label: "Plum", value: "plum" },
      { label: "Apricot (out of stock)", value: "apricot", disabled: true },
    ],
  },
];

const meta: Meta<typeof Select> = {
  title: "Form Controls/Select",
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

/** Single-select, controlled. */
export const Single: Story = {
  render: () => {
    const [value, setValue] = React.useState<string | null>(null);
    return (
      <Select
        label="Favourite fruit"
        placeholder="Pick one"
        description="Single selection."
        value={value}
        onChange={setValue}
        options={FRUITS}
      />
    );
  },
};

/** Multi-select: options render a composed checkbox; a clear button appears. */
export const Multiple: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>(["apple", "cherry"]);
    return (
      <Select
        multiple
        label="Fruit basket"
        placeholder="Pick some"
        description="Multiple selection."
        value={value}
        onChange={setValue}
        options={FRUITS}
      />
    );
  },
};

/** Options organised into titled groups, each rendered under a heading. */
export const Grouped: Story = {
  render: () => {
    const [value, setValue] = React.useState<string | null>(null);
    return (
      <Select
        label="Favourite fruit"
        placeholder="Pick one"
        description="Options grouped under headings."
        value={value}
        onChange={setValue}
        options={GROUPED_FRUITS}
      />
    );
  },
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
  loading?: boolean;
  description?: string;
  errorMessage?: string;
}

// Every validation state plus disabled / loading — the combinations that used to
// be their own stories, folded into one table.
const stateRows: StateRow[] = [
  { label: "neutral" },
  { label: "warning", state: "warning", description: "This choice seems unusual." },
  { label: "invalid", state: "invalid", errorMessage: "Please choose a fruit." },
  { label: "valid", state: "valid" },
  {
    label: "disabled",
    disabled: true,
    description: "Uses aria-disabled so it stays keyboard-reachable.",
  },
  { label: "loading", loading: true },
];

// Select is controlled, so each row drives its own local state.
function StateSelect(row: StateRow) {
  const [value, setValue] = React.useState<string | null>("apple");
  return (
    <Select
      label="Favourite fruit"
      placeholder="Pick one"
      value={value}
      onChange={setValue}
      options={FRUITS}
      state={row.state}
      disabled={row.disabled}
      loading={row.loading}
      description={row.description}
      errorMessage={row.errorMessage}
    />
  );
}

/** Every state (rows) against the rendered control (right column). */
export const States: Story = {
  render: () => (
    <table style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={thStyle}>State</th>
          <th style={thStyle}>Select</th>
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
                <StateSelect {...row} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

/** Control sizes. */
export const Sizes: Story = {
  render: () => {
    const [value, setValue] = React.useState<string | null>("banana");
    return (
      <div style={{ display: "grid", gap: 16 }}>
        {SIZES.map((size) => (
          <Select
            key={size}
            label={`Size ${size}`}
            size={size}
            value={value}
            onChange={setValue}
            options={FRUITS}
          />
        ))}
      </div>
    );
  },
};
