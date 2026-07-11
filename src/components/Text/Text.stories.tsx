import type { Meta, StoryObj } from "@storybook/react-vite";
import { BODY_SIZES, INTENTS, SALIENCIES, TEXT_WEIGHTS } from "../../theme/constants";
import { Text } from "./index";

const meta: Meta<typeof Text> = {
  title: "Text/Text",
  component: Text,
  args: { children: "The quick brown fox", variant: "base", saliency: "mid" },
  argTypes: {
    variant: { control: "select", options: BODY_SIZES },
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SALIENCIES },
    weight: { control: "select", options: TEXT_WEIGHTS },
    italic: { control: "boolean" },
    align: { control: "inline-radio", options: ["start", "center"] },
    wrap: { control: "inline-radio", options: ["wrap", "nowrap"] },
    wordBreak: { control: "inline-radio", options: ["break-word", "normal"] },
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

export const Weights: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8 }}>
      {TEXT_WEIGHTS.map((weight) => (
        <Text key={weight} as="p" weight={weight}>
          weight={weight} — The quick brown fox jumps over the lazy dog
        </Text>
      ))}
    </div>
  ),
};

export const Italic: Story = {
  args: { italic: true, children: "Italicised body copy" },
};

export const Align: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8, width: 320 }}>
      <Text as="p" align="start">
        align="start" — leading-aligned text
      </Text>
      <Text as="p" align="center">
        align="center" — centred text
      </Text>
    </div>
  ),
};

export const Wrap: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8, width: 220 }}>
      <Text as="p" wrap="wrap">
        wrap="wrap" — this text is allowed to wrap onto multiple lines
      </Text>
      <Text as="p" wrap="nowrap">
        wrap="nowrap" — this text stays on a single line and overflows
      </Text>
    </div>
  ),
};

export const WordBreak: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8, width: 200 }}>
      <Text as="p" wordBreak="break-word">
        wordBreak="break-word" — supercalifragilisticexpialidocious
      </Text>
      <Text as="p" wordBreak="normal">
        wordBreak="normal" — supercalifragilisticexpialidocious
      </Text>
    </div>
  ),
};
