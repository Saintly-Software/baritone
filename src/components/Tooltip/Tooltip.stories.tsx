import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Icon } from "../Icon";
import { Tooltip } from "./index";

/**
 * `Tooltip` is the system's **accessible** tooltip. Unlike `InaccessibleTooltip`,
 * its trigger is always a real `<Tooltip.Trigger>` button, so the hint is
 * reachable by hover, keyboard focus, *and* touch. Keep the content strictly
 * supplemental — for anything a user must read, use `Popover`.
 */
const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  args: {
    content: "Copied to your clipboard",
    side: "top",
    align: "center",
  },
  argTypes: {
    side: { control: "select", options: ["top", "right", "bottom", "left"] },
    align: { control: "select", options: ["start", "center", "end"] },
    disabled: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "An accessible tooltip: a supplemental hint anchored to a Button, opening on hover and focus (never click) and reachable on touch. Built on base-ui, so aria-describedby wiring, focus handling, and dismissal come for free. Prefer Popover for content a user must read.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

const CopyGlyph = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  </Icon>
);

/**
 * Hover or tab to the button to reveal the hint. The `play` function drives the
 * hover and waits for the portaled tooltip to appear.
 */
export const Basic: Story = {
  render: (args) => (
    <div style={{ padding: 64 }}>
      <Tooltip {...args}>
        <Tooltip.Trigger startIcon={<CopyGlyph />} delay={0}>
          Copy
        </Tooltip.Trigger>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Copy" });
    await userEvent.hover(trigger);
    // The tooltip portals to the body, so query the document, not the canvas.
    await waitFor(() =>
      expect(within(document.body).getByText("Copied to your clipboard")).toBeInTheDocument(),
    );
  },
};
