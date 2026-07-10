import type { Meta, StoryObj } from "@storybook/react-vite";
import { SALIENCIES, SIZES } from "../../theme/constants";
import { Text } from "../Text";
import { InfoButton, type InfoButtonIntent } from "./index";

// `positive` is excluded from InfoButton — a success colour reads wrong on an
// informational affordance.
const INFO_INTENTS: InfoButtonIntent[] = ["primary", "secondary", "neutral", "warning", "negative"];

const meta: Meta<typeof InfoButton> = {
  title: "Components/InfoButton",
  component: InfoButton,
  args: {
    "aria-label": "More information",
    intent: "neutral",
    saliency: "low",
    size: "sm",
    disabled: false,
    children: (
      <Text render={<p />}>
        A short, informational note revealed on click. Press Escape or click outside to dismiss.
      </Text>
    ),
  },
  argTypes: {
    intent: { control: "select", options: INFO_INTENTS },
    saliency: { control: "select", options: SALIENCIES },
    size: { control: "select", options: SIZES },
    side: { control: "select", options: ["top", "right", "bottom", "left"] },
    align: { control: "select", options: ["start", "center", "end"] },
    disabled: { control: "boolean" },
    icon: { control: false },
    children: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A small icon-only button that opens an informational Popover. Built on the exported Popover (focus-managed, Escape / outside-click dismissal) with an icon-only trigger. `intent` / `saliency` / `size` style the trigger; the surface stays the default neutral Popover.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof InfoButton>;

/** The default "i" glyph. Click to reveal the note; Escape or outside-click closes it. */
export const Playground: Story = {};

export const WithHeader: Story = {
  args: {
    "aria-label": "About billing cycles",
    header: "Billing cycles",
    children: (
      <Text render={<p />}>
        Cycles renew on the 1st of each month. Changes take effect at the start of the next cycle.
      </Text>
    ),
  },
};

/** The trigger's colour scheme, shared with `Button` / `Chip`. */
export const IntentsAndSaliencies: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {INFO_INTENTS.map((intent) => (
        <div key={intent} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {SALIENCIES.map((saliency) => (
            <InfoButton
              key={saliency}
              aria-label={`${intent} ${saliency}`}
              intent={intent}
              saliency={saliency}
            >
              <Text render={<p />}>
                The {intent} intent at {saliency} saliency.
              </Text>
            </InfoButton>
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
        <InfoButton key={size} aria-label={`Info (${size})`} size={size}>
          <Text render={<p />}>The {size} trigger size.</Text>
        </InfoButton>
      ))}
    </div>
  ),
};

export const Sides: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, padding: 80 }}>
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <InfoButton key={side} aria-label={`Placed on ${side}`} side={side}>
          <Text render={<p />}>Placed on the {side}.</Text>
        </InfoButton>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, disabledReason: "Sign in to view details." },
  parameters: {
    docs: {
      description: {
        story:
          "Tab to or hover the button to see why it is disabled. The button keeps focus (aria-disabled), so the explanation is reachable by keyboard.",
      },
    },
  },
};
