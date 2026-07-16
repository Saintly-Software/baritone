import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { FORM_STATES, type FormState, LABEL_POSITIONS, SIZES } from "../../theme/constants";
import type { DistributiveOmit } from "../../utils/types";
import { Switch } from "./index";

// Switch is controlled, so the stories drive it from local state — the same
// shape a consumer would use.
function ControlledSwitch(
  props: DistributiveOmit<React.ComponentProps<typeof Switch>, "value" | "onChange">,
) {
  const [value, setValue] = React.useState(false);
  return <Switch value={value} onChange={setValue} {...props} />;
}

const meta: Meta<typeof ControlledSwitch> = {
  title: "Form Controls/Switch",
  component: ControlledSwitch,
  args: {
    label: "Enable notifications",
    size: "md",
    labelPosition: "end",
    disabled: false,
    required: false,
    state: "neutral",
  },
  argTypes: {
    size: { control: "select", options: SIZES },
    labelPosition: { control: "inline-radio", options: LABEL_POSITIONS },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    state: { control: "select", options: FORM_STATES },
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

type Story = StoryObj<typeof ControlledSwitch>;

// Interactive default — renamed from "Playground".
export const Basic: Story = {};

const thStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  opacity: 0.6,
  textAlign: "left",
  padding: "10px 16px",
  whiteSpace: "nowrap",
};

const cellStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderTop: "1px solid rgba(128,128,128,0.25)",
};

interface StateRow {
  label: string;
  value?: boolean;
  disabled?: boolean;
  state?: FormState;
}

// Every meaningful switch state, including the invalid × checked × disabled
// combinations that don't get their own story.
const stateRows: StateRow[] = [
  { label: "Off" },
  { label: "On", value: true },
  { label: "Disabled", disabled: true },
  { label: "Disabled + on", disabled: true, value: true },
  { label: "Invalid", state: "invalid" },
  { label: "On + invalid", state: "invalid", value: true },
  { label: "Disabled + invalid", disabled: true, state: "invalid" },
  { label: "Disabled + on + invalid", disabled: true, value: true, state: "invalid" },
];

/** Every state (rows) against the rendered control (right column). */
export const States: Story = {
  render: () => (
    <table style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={thStyle}>State</th>
          <th style={thStyle}>Switch</th>
        </tr>
      </thead>
      <tbody>
        {stateRows.map((row) => (
          <tr key={row.label}>
            <th scope="row" style={{ ...thStyle, ...cellStyle }}>
              {row.label}
            </th>
            <td style={cellStyle}>
              <Switch
                aria-label={row.label}
                value={row.value ?? false}
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

/** `sm` / `md` / `lg`, each shown on. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {SIZES.map((size) => (
        <Switch key={size} label={`Size ${size}`} size={size} value onChange={() => {}} />
      ))}
    </div>
  ),
};

/**
 * `labelPosition` places the label `end` (default), `start`, or `top`. It's
 * flex-direction only — `start`/`end` are inline-logical, so they flip under RTL
 * without the DOM (or the accessible name) moving.
 */
export const LabelPositions: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      {LABEL_POSITIONS.map((labelPosition) => (
        <ControlledSwitch
          key={labelPosition}
          label={`labelPosition="${labelPosition}"`}
          labelPosition={labelPosition}
        />
      ))}
    </div>
  ),
};

/** The same three positions mirrored under `dir="rtl"`. */
export const LabelPositionsRTL: Story = {
  render: () => (
    <div dir="rtl" style={{ display: "grid", gap: 24 }}>
      {LABEL_POSITIONS.map((labelPosition) => (
        <ControlledSwitch
          key={labelPosition}
          label={`الموضع "${labelPosition}"`}
          labelPosition={labelPosition}
        />
      ))}
    </div>
  ),
};

/** Inline help under the row, wired to the control via `aria-describedby`. */
export const WithDescription: Story = {
  args: {
    label: "Notifications",
    labelPosition: "top",
    helpText: "We'll only ping you about outages, never marketing.",
  },
};

/** An error message announced under the row when the field is `invalid`. */
export const WithErrorMessage: Story = {
  args: {
    label: "Accept tracking",
    labelPosition: "top",
    required: true,
    state: "invalid",
  },
};

/**
 * With no visible `label`, name the control explicitly with `aria-label` — the
 * glyph stays decorative. Inspect the accessibility tree to confirm the name.
 */
export const IconOnly: Story = {
  render: () => (
    <ControlledSwitch
      aria-label="Wi-Fi"
      activeIcon={<CheckGlyph />}
      inactiveIcon={<CrossGlyph />}
    />
  ),
};

// Bare `currentColor` glyphs — the switch sizes and recolours them inside the
// thumb, so they only need a `viewBox` and paths.
function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.25} aria-hidden>
      <path d="M3.5 8.5 6.75 11.75 12.5 4.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.25} aria-hidden>
      <path d="M4.75 4.75 11.25 11.25M11.25 4.75 4.75 11.25" strokeLinecap="round" />
    </svg>
  );
}

/**
 * A glyph can ride inside the thumb. `icon` reuses one glyph for both states;
 * `activeIcon` + `inactiveIcon` show a different glyph per state (a check when
 * on, a cross when off here). The glyph is decorative — the `label` is still the
 * accessible name.
 */
export const WithIcons: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {SIZES.map((size) => (
        <ControlledSwitch
          key={size}
          label={`Wi-Fi (${size})`}
          size={size}
          activeIcon={<CheckGlyph />}
          inactiveIcon={<CrossGlyph />}
        />
      ))}
      <ControlledSwitch label="Same glyph both states" icon={<CheckGlyph />} />
    </div>
  ),
};
