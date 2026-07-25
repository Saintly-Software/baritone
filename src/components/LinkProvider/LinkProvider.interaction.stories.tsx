import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Link } from "../Link";
import { LinkProvider, type LinkRenderProps } from "./index";

/**
 * Interaction coverage for `LinkProvider` in a real browser: an internal `Link`
 * with no `render` of its own routes through the provider's mock router (clicking
 * it updates the client route without a full-page load), while an external link
 * stays an ordinary anchor.
 */
const meta: Meta<typeof LinkProvider> = {
  title: "Interaction Tests/LinkProvider",
  component: LinkProvider,
};
export default meta;

type Story = StoryObj<typeof LinkProvider>;

function RoutingHarness() {
  const [path, setPath] = React.useState("/");
  const render = React.useCallback(
    ({ href, children, ...props }: LinkRenderProps) => (
      <a
        {...props}
        href={href}
        onClick={(event) => {
          // Prevent the frame from actually navigating so the click is observable.
          event.preventDefault();
          setPath(href);
        }}
      >
        {children}
      </a>
    ),
    [],
  );

  return (
    <LinkProvider render={render}>
      <div data-testid="route">{path}</div>
      <Link href="/dashboard">Dashboard</Link> <Link href="https://example.com">External</Link>
    </LinkProvider>
  );
}

export const RoutesInternalLinks: Story = {
  render: () => <RoutingHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The external link is never routed — it stays a plain anchor with its href.
    const external = canvas.getByRole("link", { name: "External" });
    expect(external).toHaveAttribute("href", "https://example.com");

    // Clicking the internal link routes through the provider (mock router updates
    // the path); the browser never leaves the story frame.
    expect(canvas.getByTestId("route")).toHaveTextContent("/");
    await userEvent.click(canvas.getByRole("link", { name: "Dashboard" }));
    await waitFor(() => expect(canvas.getByTestId("route")).toHaveTextContent("/dashboard"));
  },
};
