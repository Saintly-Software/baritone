import type { Meta, StoryObj } from "@storybook/react-vite";
import { InternalGenericButtonAnchor } from "./index";

const meta: Meta<typeof InternalGenericButtonAnchor> = {
  title: "Internal/InternalGenericButtonAnchor",
  component: InternalGenericButtonAnchor,
  parameters: {
    docs: {
      description: {
        component:
          "Internal-only, style-free primitive that renders as an internal (router) link, an external link, a button, or — for a disabled link — a plain div, following its `render`/`href`/`disabled` props. Not exported from the package.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof InternalGenericButtonAnchor>;

const demo = {
  display: "inline-flex",
  padding: "6px 12px",
  border: "1px solid currentColor",
  borderRadius: 6,
  cursor: "pointer",
} as const;

export const AsButton: Story = {
  args: { children: "Button", style: demo, onClick: () => alert("clicked") },
};

export const AsExternalLink: Story = {
  args: {
    children: "External link",
    href: "https://example.com",
    target: "_blank",
    style: demo,
  },
};

export const AsInternalLink: Story = {
  args: {
    children: "Internal (router) link",
    render: <a href="/settings" data-router />,
    style: demo,
  },
};

export const DisabledLinkBecomesDiv: Story = {
  args: {
    children: "Disabled link (renders a div)",
    href: "https://example.com",
    disabled: true,
    style: { ...demo, opacity: 0.5, cursor: "not-allowed" },
  },
};

export const DisabledButton: Story = {
  args: {
    children: "Disabled button",
    disabled: true,
    onClick: () => alert("should not fire"),
    style: { ...demo, opacity: 0.5, cursor: "not-allowed" },
  },
};
