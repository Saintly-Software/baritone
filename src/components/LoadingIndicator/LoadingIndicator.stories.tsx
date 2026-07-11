import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { LoadingIndicator } from "./index";

const meta: Meta<typeof LoadingIndicator> = {
  title: "Components/LoadingIndicator",
  component: LoadingIndicator,
  args: {
    size: "md",
    variant: "spinner",
    intent: "neutral",
    saliency: "mid",
    label: "Loading",
  },
  argTypes: {
    size: { control: "inline-radio", options: SIZES },
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SALIENCIES },
    label: { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The public spinner. Wraps the system\'s shared `InternalSpinner` and gives it an accessible shell: a screen-reader `Loading` label under `role="status"`, with the ring itself decorative. Pass `aria-hidden` to render it purely decoratively (dropping the label) when the surrounding context already announces the busy state.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof LoadingIndicator>;

export const Playground: Story = {};

/** The three sizes track `Icon`'s ramp; `lg` also thickens the ring stroke. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
      {SIZES.map((size) => (
        <div key={size} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LoadingIndicator size={size} />
          <span>{size}</span>
        </div>
      ))}
    </div>
  ),
};

/** Standalone colour comes from the `component` token for the intent/saliency. */
export const Intents: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
      {INTENTS.map((intent) => (
        <div key={intent} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LoadingIndicator intent={intent} />
          <span>{intent}</span>
        </div>
      ))}
    </div>
  ),
};

/** A custom label rewords the screen-reader announcement. */
export const CustomLabel: Story = {
  args: { label: "Fetching results…" },
};

/**
 * Decorative: `aria-hidden` drops the `role="status"` live region and the
 * SR-only label, leaving a purely visual ring for contexts that announce the
 * busy state some other way (e.g. a host with `aria-busy`).
 */
export const Decorative: Story = {
  args: { "aria-hidden": true },
};
