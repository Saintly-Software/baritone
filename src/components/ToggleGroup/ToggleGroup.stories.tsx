import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { type FormState, INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { IntentSaliencyMatrix } from "../_stories/IntentSaliencyMatrix";
import type { DistributiveOmit } from "../../utils/types";
import { ToggleGroup } from "./index";

type View = "list" | "board" | "calendar";

// The knobs both hosts forward, minus the naming: each host below picks exactly
// one naming prop for itself, since they're mutually exclusive. `DistributiveOmit`
// (not the built-in `Omit`) is what keeps those arms apart while stripping them —
// a plain `Omit` over a union collapses it into one object with every arm's keys.
type ViewToggleKnobs = DistributiveOmit<
  React.ComponentProps<typeof ToggleGroup<View>>,
  "value" | "onChange" | "children" | "label" | "aria-label" | "aria-labelledby"
>;

// ToggleGroup is controlled, so the stories drive it from local state — the same
// shape a consumer would use. This is the *toolbar* host: no visible label, so it
// names itself with `aria-label`.
function ViewToggle({
  "aria-label": ariaLabel = "View",
  ...props
}: ViewToggleKnobs & { "aria-label"?: string }) {
  const [value, setValue] = React.useState<View>("board");
  return (
    <ToggleGroup aria-label={ariaLabel} value={value} onChange={setValue} {...props}>
      {({ ToggleGroupItem }) => (
        <>
          <ToggleGroupItem value="list">List</ToggleGroupItem>
          <ToggleGroupItem value="board">Board</ToggleGroupItem>
          <ToggleGroupItem value="calendar">Calendar</ToggleGroupItem>
        </>
      )}
    </ToggleGroup>
  );
}

const meta: Meta<typeof ViewToggle> = {
  title: "Form Controls/ToggleGroup",
  component: ViewToggle,
  args: {
    intent: "neutral",
    saliency: "high",
    size: "md",
    disabled: false,
  },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    saliency: { control: "inline-radio", options: SALIENCIES },
    size: { control: "inline-radio", options: SIZES },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof ViewToggle>;

export const Playground: Story = {};

export const IntentsAndSaliencies: Story = {
  render: () => (
    <IntentSaliencyMatrix intents={INTENTS} saliencies={SALIENCIES}>
      {(intent, saliency) => (
        <ViewToggle
          intent={intent}
          saliency={saliency}
          aria-label={`View (${intent} ${saliency})`}
        />
      )}
    </IntentSaliencyMatrix>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      {SIZES.map((size) => (
        <ViewToggle key={size} size={size} aria-label={`View (${size})`} />
      ))}
    </div>
  ),
};

// A labelled form-control host: same segmented control, now with a group label,
// inline help, and validation wiring — the form-control mode from DES-40. Named
// by a visible `label` instead of `aria-label`.
function LabelledViewToggle({ label, ...props }: ViewToggleKnobs & { label: React.ReactNode }) {
  const [value, setValue] = React.useState<View>("board");
  return (
    <ToggleGroup label={label} value={value} onChange={setValue} {...props}>
      {({ ToggleGroupItem }) => (
        <>
          <ToggleGroupItem value="list">List</ToggleGroupItem>
          <ToggleGroupItem value="board">Board</ToggleGroupItem>
          <ToggleGroupItem value="calendar">Calendar</ToggleGroupItem>
        </>
      )}
    </ToggleGroup>
  );
}

export const FormControl: Story = {
  render: () => (
    <LabelledViewToggle label="Default view" required helpText="Applies to newly created boards." />
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
  disabled?: boolean;
  state?: FormState;
  helpText?: string;
}

// Disabled and invalid, folded into one table alongside the default.
const stateRows: StateRow[] = [
  { label: "default" },
  { label: "disabled", disabled: true },
  { label: "invalid", state: "invalid", helpText: "Pick a default view to continue." },
];

/** Every state (rows) against the rendered control (right column). */
export const States: Story = {
  render: () => (
    <table style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={thStyle}>State</th>
          <th style={thStyle}>ToggleGroup</th>
        </tr>
      </thead>
      <tbody>
        {stateRows.map((row) => (
          <tr key={row.label}>
            <th scope="row" style={{ ...thStyle, ...cellStyle }}>
              {row.label}
            </th>
            <td style={cellStyle}>
              <LabelledViewToggle
                label="Default view"
                required
                disabled={row.disabled}
                state={row.state}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};
