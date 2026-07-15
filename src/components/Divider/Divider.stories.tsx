import type { Meta, StoryObj } from "@storybook/react-vite";
import { BORDER_WIDTH_KEYS, INTENTS, SALIENCIES } from "../../theme/constants";
import { IntentSaliencyMatrix } from "../_stories/IntentSaliencyMatrix";
import { Text } from "../Text";
import { Divider } from "./index";

const meta: Meta<typeof Divider> = {
  title: "Components/Divider",
  component: Divider,
  args: {
    orientation: "horizontal",
    intent: "neutral",
    saliency: "low",
    thickness: "thin",
    labelPosition: "center",
  },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SALIENCIES },
    thickness: { control: "inline-radio", options: BORDER_WIDTH_KEYS },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    labelPosition: { control: "inline-radio", options: ["start", "center", "end"] },
    children: { control: "text" },
  },
  decorators: [
    // Horizontal dividers are full-width; cap them so the rule doesn't run the
    // whole viewport. The matrix opts out via `parameters.wide`.
    (Story, ctx) => (
      <div style={{ maxWidth: ctx.parameters.wide ? undefined : 360 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Divider>;

/** The default: a quiet `neutral` / `low` hairline between two blocks of content. */
export const Basic: Story = {
  render: (args) => (
    <>
      <Text>Above the rule</Text>
      <Divider {...args} my="4" />
      <Text>Below the rule</Text>
    </>
  ),
};

/**
 * `children` breaks the rule around a label — and, when it's a string, doubles as
 * the divider's accessible name (a `separator`'s children are presentational, so
 * the visible text alone would never be announced).
 */
export const Labelled: Story = {
  args: { children: "or" },
  render: (args) => (
    <>
      <Text>Sign in with email</Text>
      <Divider {...args} my="4" />
      <Text>Continue with a passkey</Text>
    </>
  ),
};

/** `labelPosition` slides the label along the rule. */
export const LabelPositions: Story = {
  render: (args) => (
    <>
      <Divider {...args} labelPosition="start" my="4">
        Start
      </Divider>
      <Divider {...args} labelPosition="center" my="4">
        Center
      </Divider>
      <Divider {...args} labelPosition="end" my="4">
        End
      </Divider>
    </>
  ),
};

/**
 * A `vertical` divider stretches to its flex row's height — no explicit height
 * needed — so it can split a row of controls or metadata.
 */
export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Text>Drafts</Text>
      <Divider {...args} />
      <Text>Sent</Text>
      <Divider {...args} />
      <Text>Archive</Text>
    </div>
  ),
};

/** A labelled `vertical` divider stacks the label between two rules. */
export const VerticalLabelled: Story = {
  // Kept as a test, hidden from the sidebar so the showcase stays focused.
  tags: ["!dev"],
  args: { orientation: "vertical", children: "or" },
  render: (args) => (
    <div style={{ display: "flex", alignItems: "stretch", gap: 12, height: 140 }}>
      <Text>Upload a file</Text>
      <Divider {...args} />
      <Text>Paste a link</Text>
    </div>
  ),
};

/**
 * Every `intent` (rows) at each `saliency` (columns). The rule reads the border
 * ramp, so it stays a hairline against the surface at every level — reach past
 * the default `neutral` / `low` only when the split itself carries meaning.
 */
export const IntentsAndSaliencies: Story = {
  parameters: { wide: true },
  render: () => (
    <IntentSaliencyMatrix intents={INTENTS} saliencies={SALIENCIES}>
      {(intent, saliency) => (
        <div style={{ width: 140 }}>
          <Divider intent={intent} saliency={saliency} aria-label={`${intent} ${saliency}`} />
        </div>
      )}
    </IntentSaliencyMatrix>
  ),
};

/** `thickness` picks a `borderWidth` token. */
export const Thickness: Story = {
  render: (args) => (
    <>
      {BORDER_WIDTH_KEYS.map((thickness) => (
        <Divider key={thickness} {...args} thickness={thickness} my="4">
          {thickness}
        </Divider>
      ))}
    </>
  ),
};

/**
 * The margin props (`my` / `mx` / …) space the rule from its neighbours, and
 * `slotProps.label` re-tunes the label `Text`.
 */
export const SpacingAndLabelSlot: Story = {
  // Kept as a test, hidden from the sidebar so the showcase stays focused.
  tags: ["!dev"],
  args: {
    children: "Today",
    my: "8",
    intent: "primary",
    slotProps: { label: { variant: "xs", weight: "bold", intent: "primary" } },
  },
  render: (args) => (
    <>
      <Text>Yesterday's activity</Text>
      <Divider {...args} />
      <Text>Today's activity</Text>
    </>
  ),
};
