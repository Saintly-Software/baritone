import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
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
    (Story, ctx) => (
      <div style={{ maxWidth: ctx.parameters.wide ? undefined : 360 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Divider>;

export const Basic: Story = {
  render: (args) => (
    <>
      <Text>Above the rule</Text>
      <Divider {...args} my="4" />
      <Text>Below the rule</Text>
    </>
  ),
};

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

export const VerticalLabelled: Story = {
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

export const CustomThickness: Story = {
  render: (args) => (
    <div
      style={
        {
          "--borderWidth-hair": "0.5px",
          "--borderWidth-heavy": "4px",
        } as CSSProperties
      }
    >
      <Divider {...args} thickness="thick" my="4">
        thick — a built-in
      </Divider>
      <Divider {...args} thickness="hair" my="4">
        hair — a consumer-defined --borderWidth-hair
      </Divider>
      <Divider {...args} thickness="heavy" my="4">
        heavy — a consumer-defined --borderWidth-heavy
      </Divider>
    </div>
  ),
};

export const SpacingAndLabelSlot: Story = {
  tags: ["!dev"],
  args: {
    children: "Today",
    my: "8",
    intent: "primary",
    slotProps: { label: { size: "xs", weight: "bold", intent: "primary" } },
  },
  render: (args) => (
    <>
      <Text>Yesterday's activity</Text>
      <Divider {...args} />
      <Text>Today's activity</Text>
    </>
  ),
};
