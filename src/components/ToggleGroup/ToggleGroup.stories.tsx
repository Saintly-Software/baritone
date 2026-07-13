import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { type FormState, INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { IntentSaliencyMatrix } from "../_stories/IntentSaliencyMatrix";
import { ToggleGroup } from "./index";

type View = "list" | "board" | "calendar";

// ToggleGroup is controlled, so the stories drive it from local state — the same
// shape a consumer would use.
function ViewToggle(
  props: Omit<React.ComponentProps<typeof ToggleGroup<View>>, "value" | "onChange" | "children">,
) {
  const [value, setValue] = React.useState<View>("board");
  return (
    <ToggleGroup aria-label="View" value={value} onChange={setValue} {...props}>
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
// inline help, and validation wiring — the form-control mode from DES-40.
function LabelledViewToggle(
  props: Omit<React.ComponentProps<typeof ToggleGroup<View>>, "value" | "onChange" | "children">,
) {
  const [value, setValue] = React.useState<View>("board");
  return (
    <ToggleGroup value={value} onChange={setValue} {...props}>
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
    <LabelledViewToggle
      label="Default view"
      required
      description="Applies to newly created boards."
    />
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
  errorMessage?: string;
}

// Disabled and invalid, folded into one table alongside the default.
const stateRows: StateRow[] = [
  { label: "default" },
  { label: "disabled", disabled: true },
  { label: "invalid", state: "invalid", errorMessage: "Pick a default view to continue." },
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
                errorMessage={row.errorMessage}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};
