import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { Icon } from "../Icon";
import { Button } from "./index";

// A throwaway glyph so the start/end icon stories have something to render.
const Sparkle = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.4 6.5L21 11l-6.6 2.5L12 20l-2.4-6.5L3 11l6.6-2.5z" />
    </svg>
  </Icon>
);

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  args: {
    children: "Button",
    intent: "primary",
    saliency: "high",
    size: "md",
    disabled: false,
    loading: false,
  },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SALIENCIES },
    size: { control: "select", options: SIZES },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const IntentsAndSaliencies: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {INTENTS.map((intent) => (
        <div key={intent} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {SALIENCIES.map((saliency) => (
            <Button key={saliency} intent={intent} saliency={saliency}>
              {intent}/{saliency}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {SIZES.map((size) => (
        <Button key={size} intent="primary" saliency="high" size={size}>
          {size}
        </Button>
      ))}
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    startIcon: <Sparkle />,
    endIcon: <Sparkle />,
    children: "With icons",
  },
};

export const Loading: Story = {
  args: { loading: true, children: "Saving…" },
};

export const Disabled: Story = {
  args: { disabled: true, children: "Disabled" },
};

export const DisabledWithReason: Story = {
  args: {
    disabled: true,
    children: "Publish",
    disabledReason: "Add a title before publishing.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Tab to or hover the button to see why it is disabled. The button keeps focus (aria-disabled), so the explanation is reachable by keyboard.",
      },
    },
  },
};
