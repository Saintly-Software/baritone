import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Icon } from "../Icon";
import { LinkProvider } from "../LinkProvider";
import { Text } from "../Text";
import { Link } from "./index";

// A left-arrow glyph for the icon-only "back" navigation stories.
const ArrowLeft = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11 5l1.4 1.4L7.8 11H20v2H7.8l4.6 4.6L11 19l-7-7z" />
    </svg>
  </Icon>
);

/**
 * Interaction coverage for `Link`. `InheritsTypography` validates (via real
 * computed styles) that an inline link inherits its container's typography;
 * `DisabledButtonTooltip` asserts the disabled button-appearance link explains
 * itself on hover; the icon-only button stories check that an icon-only
 * button-link is named solely by its `aria-label` when live
 * (`IconOnlyButtonAccessibleName`) and that its disabled form stays perceivable
 * and still explains itself (`DisabledIconOnlyButtonTooltip`); the chip stories
 * cover the chip-appearance's disabled tooltip and `LinkProvider` routing.
 */
const meta: Meta<typeof Link> = {
  title: "Interaction Tests/Link",
  component: Link,
};
export default meta;

type Story = StoryObj<typeof Link>;

/**
 * An inline link blends into surrounding copy: with no typography of its own it
 * inherits the container `Text`'s size and weight. The `play` asserts the link's
 * computed font-size and weight equal the container's.
 */
export const InheritsTypography: Story = {
  render: () => (
    <Text as="p" size="lg" weight="bold">
      Read the <Link href="/docs">documentation</Link> before you begin.
    </Text>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "documentation" });
    const container = link.closest("p");
    expect(container).not.toBeNull();

    const linkStyle = getComputedStyle(link);
    const containerStyle = getComputedStyle(container as HTMLElement);
    expect(linkStyle.fontSize).toBe(containerStyle.fontSize);
    expect(linkStyle.fontWeight).toBe(containerStyle.fontWeight);
  },
};

/**
 * A disabled button-appearance link is inert (no longer a link) but still explains
 * itself: hovering it opens the `disabledReason` tooltip.
 */
export const DisabledButtonTooltip: Story = {
  name: "Disabled button link tooltip",
  render: () => (
    <div style={{ padding: 48 }}>
      <Link appearance="button" href="/dashboard" disabled disabledReason="Sign in first">
        Open dashboard
      </Link>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByText("Open dashboard"));
    await waitFor(
      () => expect(within(document.body).getByText("Sign in first")).toBeInTheDocument(),
      { timeout: 3000 },
    );
  },
};

/**
 * The icon-only button-appearance link is a real anchor named solely by its
 * required `aria-label` (there's no visible text). The `play` asserts the anchor
 * exposes that accessible name and carries no visible text content.
 */
export const IconOnlyButtonAccessibleName: Story = {
  name: "Icon-only button link accessible name",
  render: () => (
    <div style={{ padding: 48 }}>
      <Link
        appearance="button"
        intent="primary"
        href="/entries/42"
        icon={<ArrowLeft />}
        aria-label="Back to entry details"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Back to entry details" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/entries/42");
    // Icon-only: the glyph is the whole content, so there's no visible text.
    expect(link).toHaveTextContent("");
  },
};

/**
 * A disabled icon-only button-appearance link is inert (no longer a link) but
 * keeps its accessible name and still explains itself: hovering it opens the
 * `disabledReason` tooltip.
 */
export const DisabledIconOnlyButtonTooltip: Story = {
  name: "Disabled icon-only button link tooltip",
  render: () => (
    <div style={{ padding: 48 }}>
      <Link
        appearance="button"
        intent="primary"
        href="/entries/42"
        icon={<ArrowLeft />}
        aria-label="Back to entry details"
        disabled
        disabledReason="Sign in first"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Inert: out of the link a11y tree (a role-less element), with its name
    // re-exposed as visually-hidden content rather than a prohibited aria-label.
    expect(canvas.queryByRole("link")).toBeNull();
    const inert = canvas.getByText("Back to entry details").closest("[aria-disabled]");
    expect(inert).not.toBeNull();
    expect(inert).not.toHaveAttribute("aria-label");
    await userEvent.hover(inert as HTMLElement);
    await waitFor(
      () => expect(within(document.body).getByText("Sign in first")).toBeInTheDocument(),
      { timeout: 3000 },
    );
  },
};

/**
 * A disabled chip-appearance link is inert (no longer a link) but still explains
 * itself: hovering it opens the `disabledReason` tooltip.
 */
export const DisabledChipTooltip: Story = {
  name: "Disabled chip link tooltip",
  render: () => (
    <div style={{ padding: 48 }}>
      <Link
        appearance="chip"
        intent="primary"
        href="/notes?tags=music"
        disabled
        disabledReason="Sign in to browse tags"
      >
        Music
      </Link>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByText("Music"));
    await waitFor(
      () => expect(within(document.body).getByText("Sign in to browse tags")).toBeInTheDocument(),
      { timeout: 3000 },
    );
  },
};

/**
 * Under a `LinkProvider`, an internal chip-link routes through the app's router
 * while keeping the chip styling. The `play` asserts the routed anchor carries the
 * router marker and that clicking it navigates through the router (no full load).
 */
export const ChipRoutesThroughProvider: Story = {
  name: "Chip link routes through LinkProvider",
  render: () => {
    const [navigations, setNavigations] = React.useState<string[]>([]);
    return (
      <LinkProvider
        render={({ href, children, ...props }) => (
          <a
            {...props}
            href={href}
            data-router-link=""
            onClick={(event) => {
              // Route through the "router" (record + prevent the full-page load)
              // so a click is observable without leaving the story.
              event.preventDefault();
              setNavigations((prev) => [...prev, href]);
            }}
          >
            {children}
          </a>
        )}
      >
        <Link appearance="chip" intent="primary" saliency="low" href="/notes?tags=music">
          Music
        </Link>
        {/* Surface the recorded navigations for the assertion below. */}
        <output data-testid="navlog">{navigations.join(",")}</output>
      </LinkProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Music" });
    expect(link).toHaveAttribute("data-router-link", "");
    await userEvent.click(link);
    await waitFor(() =>
      expect(canvas.getByTestId("navlog")).toHaveTextContent("/notes?tags=music"),
    );
  },
};
