import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { Icon } from "../Icon";
import { ToggleButton, type ToggleButtonBaseProps } from "./index";

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
function ControlledToggle(props: ToggleButtonBaseProps) {
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

/**
 * Uncontrolled + state-aware slots: no `value`/`onChange` wiring, and both the
 * glyph and the accessible name flip with the pressed state. `defaultValue` seeds
 * the initial state.
 */
export const UncontrolledWithCallbackSlots: Story = {
  render: () => (
    <ToggleButton
      defaultValue={false}
      aria-label={(pressed) => (pressed ? "Unmute" : "Mute")}
      icon={(pressed) => (
        <Icon>
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            {pressed ? (
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
            ) : (
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            )}
          </svg>
        </Icon>
      )}
      intent="primary"
    />
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
