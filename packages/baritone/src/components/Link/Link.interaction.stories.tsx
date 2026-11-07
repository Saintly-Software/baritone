import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { LinkProvider } from "../LinkProvider";
import { Text } from "../Text";
import { Link } from "./index";

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M11 5l1.4 1.4L7.8 11H20v2H7.8l4.6 4.6L11 19l-7-7z" />
  </svg>
);

const meta: Meta<typeof Link> = {
  title: "Interaction Tests/Link",
  component: Link,
};
export default meta;

type Story = StoryObj<typeof Link>;

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
    expect(link).toHaveTextContent("");
  },
};

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
