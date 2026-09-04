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

const ListGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
  </svg>
);
const BoardGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M4 4h7v16H4zm9 0h7v16h-7z" />
  </svg>
);
const CalendarGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2zM5 9h14v10H5z" />
  </svg>
);

type ViewToggleKnobs = DistributiveOmit<
  React.ComponentProps<typeof ToggleGroup<View>>,
  "value" | "onChange" | "clearable" | "children" | "label" | "aria-label" | "aria-labelledby"
>;

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
    width: { control: "inline-radio", options: [undefined, "fill"] },
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

function IconedViewToggle() {
  const [value, setValue] = React.useState<View>("board");
  return (
    <ToggleGroup aria-label="View" value={value} onChange={setValue}>
      {({ ToggleGroupItem }) => (
        <>
          <ToggleGroupItem value="list" startIcon={<ListGlyph />}>
            List
          </ToggleGroupItem>
          <ToggleGroupItem value="board" startIcon={<BoardGlyph />}>
            Board
          </ToggleGroupItem>
          <ToggleGroupItem value="calendar" startIcon={<CalendarGlyph />}>
            Calendar
          </ToggleGroupItem>
        </>
      )}
    </ToggleGroup>
  );
}

export const WithIcons: Story = {
  render: () => <IconedViewToggle />,
  parameters: {
    docs: {
      description: {
        story:
          "Segments take `Button`'s icon vocabulary: `startIcon`/`endIcon` flank the label in a slot the button lays out, so the icon/label spacing and alignment are handled once by the design system rather than per call.",
      },
    },
  },
};

function IconOnlyViewToggle() {
  const [value, setValue] = React.useState<View>("board");
  return (
    <ToggleGroup aria-label="View" value={value} onChange={setValue}>
      {({ ToggleGroupItem }) => (
        <>
          <ToggleGroupItem value="list" aria-label="List" icon={<ListGlyph />} />
          <ToggleGroupItem value="board" aria-label="Board" icon={<BoardGlyph />} />
          <ToggleGroupItem value="calendar" aria-label="Calendar" icon={<CalendarGlyph />} />
        </>
      )}
    </ToggleGroup>
  );
}

export const IconOnly: Story = {
  render: () => <IconOnlyViewToggle />,
  parameters: {
    docs: {
      description: {
        story:
          "Pass `icon` (and no `children`) for an icon-only segment. The `aria-label` is then **required** — it's the accessible name, since there's no visible text — exactly as on an icon-only `Button`.",
      },
    },
  },
};

export const Vertical: Story = {
  render: () => <ViewToggle orientation="vertical" aria-label="View (vertical)" />,
};

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

export const HorizontalFilled: Story = {
  render: () => (
    <div
      style={{
        width: 420,
        padding: 16,
        border: "1px dashed rgba(128,128,128,0.5)",
        borderRadius: 8,
      }}
    >
      <ViewToggle width="fill" aria-label="View (filled toolbar)" />
    </div>
  ),
};

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
