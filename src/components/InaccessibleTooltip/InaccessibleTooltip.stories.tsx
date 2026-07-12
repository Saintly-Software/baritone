import type { Meta, StoryObj } from "@storybook/react-vite";
import { InaccessibleTooltip } from "./index";

/**
 * `InaccessibleTooltip` is the consumer-facing escape hatch for putting a
 * tooltip on an arbitrary element. It composes the (unexported) `InternalTooltip`
 * so the surface matches the rest of the system. The blunt name is intentional:
 * attaching tooltips to non-focusable elements hides the content from keyboard
 * and touch users, so keep what you put here strictly supplemental and prefer
 * `Popover` for anything a user actually needs to read.
 */
const meta: Meta<typeof InaccessibleTooltip> = {
  title: "Components/InaccessibleTooltip",
  component: InaccessibleTooltip,
  parameters: {
    docs: {
      description: {
        component:
          "Consumer-facing escape hatch: attaches a tooltip to any element on hover/focus, reusing the InternalTooltip surface for visual consistency. Accessibility is on the caller — the tooltip is only keyboard/focus reachable when the wrapped element is itself focusable. Use only for supplemental hints; prefer Popover for content users must read.",
      },
    },
  },
  args: {
    content: "A supplemental hint",
    delay: 0,
  },
};
export default meta;

type Story = StoryObj<typeof InaccessibleTooltip>;

/**
 * An arbitrary, non-focusable element. The tooltip shows on hover only — this is
 * exactly the accessibility gap the component's name warns about.
 */
export const Basic: Story = {
  render: (args) => (
    <InaccessibleTooltip {...args} content="Hover only — not keyboard reachable">
      <span style={{ textDecoration: "underline dotted", cursor: "help" }}>Hover this text</span>
    </InaccessibleTooltip>
  ),
};
