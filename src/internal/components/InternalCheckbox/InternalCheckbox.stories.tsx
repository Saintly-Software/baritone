import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { FORM_STATES, SIZES } from "../../../theme/constants";
import { InternalCheckbox } from "./index";

/**
 * `InternalCheckbox` is not part of the public API — it's a presentational "fake
 * checkbox" (no `<input>`) the system composes from. These stories document the
 * look across states and show the accessible composition pattern: slot a real,
 * visually-hidden control inside so `:focus-within` can light the ring.
 */
const meta: Meta<typeof InternalCheckbox> = {
  title: "Internal/InternalCheckbox",
  component: InternalCheckbox,
  parameters: {
    docs: {
      description: {
        component:
          "Internal-only presentational checkbox. It is not an `<input>` and is not focusable; it just renders the checked / indeterminate / unchecked / disabled / hover / press / focus-ring look. The focus ring is drawn with `:focus-within`, so a focusable element slotted inside (e.g. a visually-hidden input) lights it when tabbed to. Semantics and behaviour are the consumer's responsibility.",
      },
    },
  },
  argTypes: {
    checked: { control: "inline-radio", options: [false, true, "indeterminate"] },
    size: { control: "select", options: SIZES },
    state: { control: "select", options: FORM_STATES },
    disabled: { control: "boolean" },
  },
  args: {
    checked: true,
    size: "md",
    state: "neutral",
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<typeof InternalCheckbox>;

export const Playground: Story = {};

/** All three value states, normal and disabled. */
export const States: Story = {
  render: () => (
    <div
      style={{ display: "grid", gridTemplateColumns: "auto auto", gap: 16, alignItems: "center" }}
    >
      {(
        [
          ["unchecked", false],
          ["checked", true],
          ["indeterminate", "indeterminate"],
        ] as const
      ).map(([label, value]) => (
        <React.Fragment key={label}>
          <InternalCheckbox checked={value} />
          <span>{label}</span>
        </React.Fragment>
      ))}
      <InternalCheckbox checked disabled />
      <span>disabled</span>
    </div>
  ),
};

/** `sm` / `md` / `lg`, each shown checked and indeterminate. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
      {SIZES.map((size) => (
        <div key={size} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <InternalCheckbox size={size} checked />
          <InternalCheckbox size={size} checked="indeterminate" />
          <span>{size}</span>
        </div>
      ))}
    </div>
  ),
};

/** The accent + focus colour follows the form `state`. */
export const FormStates: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      {FORM_STATES.map((state) => (
        <div key={state} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <InternalCheckbox state={state} checked />
          <span>{state}</span>
        </div>
      ))}
    </div>
  ),
};

const visuallyHidden: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  border: 0,
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  overflow: "hidden",
  whiteSpace: "nowrap",
};

/**
 * The intended accessible composition: a `<label>` wraps a visually-hidden real
 * `<input>` (which owns the state, keyboard, and accessible name) plus the box.
 * Tab to it to see the `:focus-within` ring; click the label to toggle.
 */
export const AccessibleComposition: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(true);
    return (
      <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <InternalCheckbox checked={checked}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            style={visuallyHidden}
          />
        </InternalCheckbox>
        Email me about product updates
      </label>
    );
  },
};
