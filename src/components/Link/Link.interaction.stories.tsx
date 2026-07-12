import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Text } from "../Text";
import { Link } from "./index";

/**
 * Interaction coverage for `Link`. The first story validates (via real computed
 * styles) that an inline link inherits its container's typography; the second
 * asserts the disabled button-appearance link explains itself on hover.
 */
const meta: Meta<typeof Link> = {
  title: "Components/Link",
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
    <Text as="p" variant="lg" weight="bold">
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
