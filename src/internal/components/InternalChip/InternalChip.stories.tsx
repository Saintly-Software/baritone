import type { Meta, StoryObj } from "@storybook/react-vite";
import { InternalChip } from "./index";

const meta: Meta<typeof InternalChip> = {
  title: "Internal/InternalChip",
  component: InternalChip,
  parameters: {
    docs: {
      description: {
        component:
          'Internal-only implementation behind `Link`\'s `appearance="chip"`. Renders a chip-styled anchor (or router link) from the shared `chipBoxClassName` recipe, with an optional decorative `icon`/`trailIcon` and the disabled-collapse + tooltip behaviour. Not exported from the package.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof InternalChip>;

export const Playground: Story = {
  args: {
    intent: "primary",
    saliency: "low",
    size: "sm",
    href: "https://example.com",
    children: "Music",
  },
};

export const Disabled: Story = {
  args: {
    intent: "primary",
    href: "/tags/music",
    disabled: true,
    disabledReason: "Sign in to browse tags.",
    children: "Music",
  },
};
