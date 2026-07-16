import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import * as React from "react";
import { FORM_STATES, type FormState, SIZES } from "../../theme/constants";
import type { DistributiveOmit } from "../../utils/types";
import { Checkbox } from "./index";

// Checkbox is controlled, so the stories drive it from local state — the same
// shape a consumer would use.
function ControlledCheckbox(
  props: DistributiveOmit<React.ComponentProps<typeof Checkbox>, "value" | "onChange">,
) {
  const [value, setValue] = React.useState(false);
  return <Checkbox value={value} onChange={setValue} {...props} />;
}

const meta: Meta<typeof ControlledCheckbox> = {
  title: "Form Controls/Checkbox",
  component: ControlledCheckbox,
  args: {
    label: "Email me about product updates",
    size: "md",
    state: "neutral",
    disabled: false,
    required: false,
    indeterminate: false,
  },
  argTypes: {
    size: { control: "select", options: SIZES },
    state: { control: "select", options: FORM_STATES },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    indeterminate: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof ControlledCheckbox>;

// Interactive default — renamed from "Playground". Ships with `helpText` so the
// default view shows the described-by wiring, not a bare box.
export const Basic: Story = {
  args: {
    helpText: "We send at most one email a week. Unsubscribe anytime.",
  },
};

const thStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  opacity: 0.6,
  textAlign: "left",
  padding: "10px 16px",
  whiteSpace: "nowrap",
};

const cellStyle: CSSProperties = {
  padding: "10px 16px",
  borderTop: "1px solid rgba(128,128,128,0.25)",
};

interface StateRow {
  label: string;
  value?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  state?: FormState;
}

// Every meaningful checkbox state, including the combinations (invalid ×
// checked/indeterminate × disabled) that don't get their own story.
const stateRows: StateRow[] = [
  { label: "Unchecked" },
  { label: "Checked", value: true },
  { label: "Indeterminate", indeterminate: true },
  { label: "Disabled", disabled: true },
  { label: "Disabled + checked", disabled: true, value: true },
  { label: "Invalid", state: "invalid" },
  { label: "Checked + invalid", state: "invalid", value: true },
  { label: "Disabled + invalid", disabled: true, state: "invalid" },
  { label: "Disabled + checked + invalid", disabled: true, value: true, state: "invalid" },
  { label: "Invalid + indeterminate", state: "invalid", indeterminate: true },
  {
    label: "Invalid + indeterminate + disabled",
    state: "invalid",
    indeterminate: true,
    disabled: true,
  },
];

/** Every state (rows) against the rendered control (right column). */
export const States: Story = {
  render: () => (
    <table style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={thStyle}>State</th>
          <th style={thStyle}>Checkbox</th>
        </tr>
      </thead>
      <tbody>
        {stateRows.map((row) => (
          <tr key={row.label}>
            <th scope="row" style={{ ...thStyle, ...cellStyle }}>
              {row.label}
            </th>
            <td style={cellStyle}>
              <Checkbox
                aria-label={row.label}
                value={row.value ?? false}
                indeterminate={row.indeterminate}
                disabled={row.disabled}
                state={row.state}
                onChange={() => {}}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

/** `sm` / `md` / `lg`, each shown checked. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {SIZES.map((size) => (
        <Checkbox key={size} label={`Size ${size}`} size={size} value onChange={() => {}} />
      ))}
    </div>
  ),
};
