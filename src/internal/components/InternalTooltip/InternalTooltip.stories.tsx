import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../../components/Button";
import { InternalTooltip } from "./index";

/**
 * `InternalTooltip` is not part of the public API — it exists so internal
 * components can attach a supplemental hover/focus hint. These stories document
 * the behaviour; consumer-facing disclosure should use `Popover` instead.
 */
const meta: Meta<typeof InternalTooltip> = {
  title: "Internal/InternalTooltip",
  component: InternalTooltip,
  parameters: {
    docs: {
      description: {
        component:
          "Internal-only wrapper over base-ui Tooltip. The tooltip is fully accessible — base-ui handles the ARIA wiring, focus, and dismissal. It is kept out of the public surface not because it is inaccessible, but because tooltips are a pattern we do not want consumers relying on (invisible to touch, easy to overlook); consumer-facing disclosure should use Popover. Content here must stay supplemental.",
      },
    },
  },
  args: {
    content: "A supplemental hint",
    delay: 0,
  },
};
export default meta;

type Story = StoryObj<typeof InternalTooltip>;

export const Playground: Story = {
  render: (args) => (
    <InternalTooltip {...args}>
      <Button intent="primary" saliency="high">
        Hover or focus me
      </Button>
    </InternalTooltip>
  ),
};

export const Sides: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 48, padding: 64 }}>
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <InternalTooltip key={side} {...args} side={side} content={`side="${side}"`}>
          <Button intent="neutral" saliency="low">
            {side}
          </Button>
        </InternalTooltip>
      ))}
    </div>
  ),
};

export const PlainTrigger: Story = {
  render: (args) => (
    <InternalTooltip {...args} content="Works on any focusable element">
      <button type="button">Native button trigger</button>
    </InternalTooltip>
  ),
};
