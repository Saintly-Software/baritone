import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Text } from "./index";

const meta: Meta<typeof Text> = {
  title: "Interaction Tests/Text",
  component: Text,
};
export default meta;

type Story = StoryObj<typeof Text>;

export const RootDefaults: Story = {
  render: () => (
    <div>
      <Text>Default body copy</Text>
      <Text weight="bold">Bolded body copy</Text>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const base = getComputedStyle(canvas.getByText("Default body copy"));
    const bold = getComputedStyle(canvas.getByText("Bolded body copy"));

    expect(bold.fontSize).toBe(base.fontSize);
    expect(Number(bold.fontWeight)).toBeGreaterThan(Number(base.fontWeight));
  },
};

export const IntentColorResolves: Story = {
  render: () => (
    <div>
      <Text>Neutral text</Text>
      <Text intent="negative" saliency="high">
        Negative text
      </Text>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const neutral = getComputedStyle(canvas.getByText("Neutral text")).color;
    const negative = getComputedStyle(canvas.getByText("Negative text")).color;

    expect(neutral).not.toBe("");
    expect(negative).not.toBe(neutral);
  },
};
