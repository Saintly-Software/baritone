import type { Meta, StoryObj } from "@storybook/react-vite";
import { BODY_SIZES, INTENTS, SALIENCIES } from "../../theme/constants";
import { Text } from "./index";

const meta: Meta<typeof Text> = {
  title: "Text/Text",
  component: Text,
  args: { children: "The quick brown fox", variant: "base", saliency: "mid" },
  argTypes: {
    variant: { control: "select", options: BODY_SIZES },
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SALIENCIES },
  },
};
export default meta;

type Story = StoryObj<typeof Text>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8 }}>
      {BODY_SIZES.map((variant) => (
        <Text key={variant} as="p" variant={variant}>
          body/{variant} — The quick brown fox jumps over the lazy dog
        </Text>
      ))}
    </div>
  ),
};

export const Elements: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8 }}>
      <Text>as="div" (default) — a block-level container</Text>
      <Text as="p">as="p" — a paragraph</Text>
      <Text as="label">as="label" — an inline label</Text>
      <Text as="span">as="span" — inline text</Text>
    </div>
  ),
};

export const Saliencies: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8 }}>
      {SALIENCIES.map((saliency) => (
        <Text key={saliency} saliency={saliency} render={<p />}>
          neutral/{saliency} — the default body colour is mid
        </Text>
      ))}
    </div>
  ),
};

export const Intents: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8 }}>
      {INTENTS.map((intent) => (
        <Text key={intent} intent={intent} saliency="high" render={<p />}>
          {intent} text
        </Text>
      ))}
    </div>
  ),
};
