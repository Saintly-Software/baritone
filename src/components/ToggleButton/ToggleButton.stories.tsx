import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { Icon } from "../Icon";
import { ToggleButton } from "./index";

// A throwaway glyph so the stories have something to render.
const StarIcon = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.4 6.5L21 11l-6.6 2.5L12 20l-2.4-6.5L3 11l6.6-2.5z" />
    </svg>
  </Icon>
);

// ToggleButton is controlled, so the stories drive it from local state — the
// same shape a consumer would use.
function ControlledToggle(
  props: Omit<React.ComponentProps<typeof ToggleButton>, "value" | "onChange">,
) {
  const [value, setValue] = React.useState(false);
  return <ToggleButton value={value} onChange={setValue} {...props} />;
}

const meta: Meta<typeof ControlledToggle> = {
  title: "Components/ToggleButton",
  component: ControlledToggle,
  args: {
    "aria-label": "Favourite",
    icon: <StarIcon />,
    intent: "primary",
    saliency: "high",
    size: "md",
    disabled: false,
  },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SALIENCIES },
    size: { control: "select", options: SIZES },
    disabled: { control: "boolean" },
    icon: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof ControlledToggle>;

/** Click to toggle. Off renders as a `low`-saliency ghost; on fills in. */
export const Playground: Story = {};

/**
 * The on look at each intent / saliency (the toggle starts pressed). Compare with
 * the off column on the far left, which always renders at `low` saliency.
 */
export const IntentsAndSaliencies: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {INTENTS.map((intent) => (
        <div key={intent} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <ToggleButton
            value={false}
            onChange={() => {}}
            aria-label={`${intent} off`}
            icon={<StarIcon />}
            intent={intent}
          />
          {SALIENCIES.map((saliency) => (
            <ControlledToggle
              key={saliency}
              aria-label={`${intent} ${saliency}`}
              icon={<StarIcon />}
              intent={intent}
              saliency={saliency}
            />
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
        <ControlledToggle
          key={size}
          aria-label={`Favourite (${size})`}
          icon={<StarIcon />}
          intent="primary"
          size={size}
        />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, disabledReason: "Sign in to save favourites." },
  parameters: {
    docs: {
      description: {
        story:
          "Tab to or hover the button to see why it is disabled. The button keeps focus (aria-disabled), so the explanation is reachable by keyboard.",
      },
    },
  },
};
