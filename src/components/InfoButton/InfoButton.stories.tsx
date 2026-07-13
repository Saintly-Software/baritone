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
export const Basic: Story = {};
