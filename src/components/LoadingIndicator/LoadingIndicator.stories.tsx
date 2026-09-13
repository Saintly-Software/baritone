import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { IntentSaliencyMatrix } from "../_stories/IntentSaliencyMatrix";
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

export const IntentsAndSaliencies: Story = {
  render: () => (
    <IntentSaliencyMatrix intents={INTENTS} saliencies={SALIENCIES}>
      {(intent, saliency) => (
        <LoadingIndicator
          intent={intent}
          saliency={saliency}
          aria-label={`${intent} ${saliency}`}
        />
      )}
    </IntentSaliencyMatrix>
  ),
};

export const CustomLabel: Story = {
  args: { label: "Fetching results…" },
};

export const Decorative: Story = {
  args: { "aria-hidden": true },
};
