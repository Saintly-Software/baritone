import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { LABEL_POSITIONS, SIZES } from "../../theme/constants";
import { Switch } from "./index";

// Distribute the omit across each member of `SwitchProps`' icon union so the
// discriminant survives (a plain `Omit<Union, …>` would collapse the three
// branches into one where every icon prop is loosely optional).
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

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
    invalid: false,
  },
  argTypes: {
    size: { control: "select", options: SIZES },
    labelPosition: { control: "inline-radio", options: LABEL_POSITIONS },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    invalid: { control: "boolean" },
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

export const Playground: Story = {};

/** Off, on, and disabled side by side. */
export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      <Switch label="Off" value={false} onChange={() => {}} />
      <Switch label="On" value onChange={() => {}} />
      <Switch label="Disabled" value={false} disabled onChange={() => {}} />
      <Switch label="Disabled + on" value disabled onChange={() => {}} />
    </div>
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

/** Invalid pulls the negative accent onto the track and wires `aria-invalid`. */
export const Invalid: Story = {
  args: {
    label: "Accept tracking",
    required: true,
    invalid: true,
  },
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
    description: "We'll only ping you about outages, never marketing.",
  },
};

/** An error message announced under the row when the field is `invalid`. */
export const WithErrorMessage: Story = {
  args: {
    label: "Accept tracking",
    labelPosition: "top",
    required: true,
    invalid: true,
    errorMessage: "You must accept to continue.",
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
