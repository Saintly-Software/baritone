import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import {
  type FormState,
  INTENTS,
  type LabelPosition,
  SALIENCIES,
  SIZES,
} from "../../theme/constants";
import { IntentSaliencyMatrix } from "../_stories/IntentSaliencyMatrix";
import type { DistributiveOmit } from "../../utils/types";
import { ToggleGroup } from "./index";

type View = "list" | "board" | "calendar";

// The knobs both hosts forward, minus the naming: each host below picks exactly
// one naming prop for itself, since they're mutually exclusive. `DistributiveOmit`
// (not the built-in `Omit`) is what keeps those arms apart while stripping them —
// a plain `Omit` over a union collapses it into one object with every arm's keys.
// `clearable` is stripped too: these hosts are strict single-select, so they never
// forward it (leaving it in would drag `value`/`onChange` toward the nullable arm).
type ViewToggleKnobs = DistributiveOmit<
  React.ComponentProps<typeof ToggleGroup<View>>,
  "value" | "onChange" | "clearable" | "children" | "label" | "aria-label" | "aria-labelledby"
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
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    width: { control: "inline-radio", options: [undefined, "fill", "fit", "inherit"] },
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

// A `clearable` host: starts with nothing selected, and re-pressing the active
// segment clears it back to that empty state. `value` and `onChange` are widened
// to `View | null`.
function ClearableViewToggle(props: ViewToggleKnobs & { "aria-label"?: string }) {
  const { "aria-label": ariaLabel = "View", ...rest } = props;
  const [value, setValue] = React.useState<View | null>(null);
  return (
    <ToggleGroup aria-label={ariaLabel} clearable value={value} onChange={setValue} {...rest}>
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

export const Clearable: Story = {
  render: () => <ClearableViewToggle />,
};

// The vertical arm: segments stacked in a column, arrow-navigated Up/Down. Left
// as an intrinsic-width (shrink-wrapped) group so the `align-items: stretch`
// is visible — every segment shares the widest label's width.
export const Vertical: Story = {
  render: () => <ViewToggle orientation="vertical" aria-label="View (vertical)" />,
};

// A vertical group asked to *fill* a fixed-width sidebar — `width="fill"` spans
// the container, and `align-items: stretch` makes each segment share that width.
// The dashed box stands in for the sidebar.
export const VerticalFilled: Story = {
  render: () => (
    <div
      style={{
        width: 220,
        padding: 16,
        border: "1px dashed rgba(128,128,128,0.5)",
        borderRadius: 8,
      }}
    >
      <ViewToggle orientation="vertical" width="fill" aria-label="View (filled sidebar)" />
    </div>
  ),
};

// Sanity-check the `size` variants stacked in a column: the focus ring (an
// `outline`, so it never shifts layout) must not clip against the segment above
// or below. Tab into each group and arrow down to see the ring between segments.
export const VerticalSizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24, justifyItems: "start" }}>
      {SIZES.map((size) => (
        <ViewToggle
          key={size}
          orientation="vertical"
          size={size}
          aria-label={`View (vertical ${size})`}
        />
      ))}
    </div>
  ),
};

const LABEL_POSITIONS: LabelPosition[] = ["top", "start", "end"];

// Form-control mode in a column, across every `labelPosition` — the awkward
// layout case. The label, the inline help, and (in the second row) the invalid
// state must all still sit where they should when the group itself is vertical.
export const VerticalFormControl: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 32, justifyItems: "start" }}>
      {LABEL_POSITIONS.map((labelPosition) => (
        <div key={labelPosition} style={{ display: "grid", gap: 16, justifyItems: "start" }}>
          <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.6 }}>
            labelPosition="{labelPosition}"
          </div>
          <LabelledViewToggle
            label="Default view"
            orientation="vertical"
            labelPosition={labelPosition}
            helpText="Applies to newly created boards."
          />
          <LabelledViewToggle
            label="Default view"
            orientation="vertical"
            labelPosition={labelPosition}
            state="invalid"
            helpText="Pick a default view to continue."
          />
        </div>
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
