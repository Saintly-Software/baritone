import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Text } from "./index";

/**
 * Interaction coverage for `Text`, validated against real computed styles: a bare
 * `Text` resolves to its root typography defaults, and `intent`/`saliency` resolve
 * to a distinct colour.
 */
const meta: Meta<typeof Text> = {
  title: "Components/Text",
  component: Text,
};
export default meta;

type Story = StoryObj<typeof Text>;

/**
 * With no ancestor to inherit from, a bare `Text` uses the base typography; a
 * `weight` override changes the weight without touching the size.
 */
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

    // The weight override leaves the size alone…
    expect(bold.fontSize).toBe(base.fontSize);
    // …but does make the text heavier.
    expect(Number(bold.fontWeight)).toBeGreaterThan(Number(base.fontWeight));
  },
};

/** `intent` + `saliency` resolve to a colour token distinct from the neutral default. */
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
