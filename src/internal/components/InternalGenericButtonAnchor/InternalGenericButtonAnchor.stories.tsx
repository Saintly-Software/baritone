import type { Meta, StoryObj } from "@storybook/react-vite";
import { InternalGenericButtonAnchor } from "./index";

/**
 * `InternalGenericButtonAnchor` is not part of the public API — it's the shared
 * primitive behind "this thing might be a link, a button, or nothing". It renders
 * whichever element the props imply and carries **no styling of its own**, so the
 * stories add a little inline CSS purely so the elements are visible.
 *
 * Which element it renders (first match wins): `render` → the router link element
 * (internal navigation); `href` → an external `<a>`; neither → a `<button>`. A
 * disabled *link* collapses to an inert `<div>`; a disabled *button* keeps
 * `aria-disabled` (so it stays focusable) and swallows its click.
 */
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

/** No `href`/`render` → a real `<button type="button">`. */
export const AsButton: Story = {
  args: { children: "Button", style: demo, onClick: () => alert("clicked") },
};

/** `href` (no `render`) → an external `<a>`; `target="_blank"` gets a safe `rel`. */
export const AsExternalLink: Story = {
  args: {
    children: "External link",
    href: "https://example.com",
    target: "_blank",
    style: demo,
  },
};

/**
 * `render` → the consumer's router link drives navigation while the primitive
 * merges the shared props onto it. Here a plain `<a>` stands in for a real
 * `<RouterLink>` / `<NextLink>`.
 */
export const AsInternalLink: Story = {
  args: {
    children: "Internal (router) link",
    render: <a href="/settings" data-router />,
    style: demo,
  },
};

/** A disabled link has no honest HTML form, so it renders an inert `<div>`. */
export const DisabledLinkBecomesDiv: Story = {
  args: {
    children: "Disabled link (renders a div)",
    href: "https://example.com",
    disabled: true,
    style: { ...demo, opacity: 0.5, cursor: "not-allowed" },
  },
};

/** A disabled button stays a focusable `<button aria-disabled>`; its click is swallowed. */
export const DisabledButton: Story = {
  args: {
    children: "Disabled button",
    disabled: true,
    onClick: () => alert("should not fire"),
    style: { ...demo, opacity: 0.5, cursor: "not-allowed" },
  },
};
