import type { Meta, StoryObj } from "@storybook/react-vite";
import { InternalChip } from "./index";

/**
 * `InternalChip` is not part of the public API — it's the engine behind `Link`'s
 * `appearance="chip"`, and it shares the chip look (`chipBoxClassName`) with the
 * public `Chip` so the two never drift. The full set of consumer controls is
 * documented under `Components/Link` (the chip stories); these stories just show
 * the internal in isolation.
 */
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

/** The pass-through path: a plain chip-styled external anchor. */
export const Playground: Story = {
  args: {
    intent: "primary",
    saliency: "low",
    size: "sm",
    href: "https://example.com",
    children: "Music",
  },
};

/** Disabled collapses to an inert element that keeps the chip styling. */
export const Disabled: Story = {
  args: {
    intent: "primary",
    href: "/tags/music",
    disabled: true,
    disabledReason: "Sign in to browse tags.",
    children: "Music",
  },
};
