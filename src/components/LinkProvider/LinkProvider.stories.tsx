import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Link } from "../Link";
import { Text } from "../Text";
import { LinkProvider, type LinkRenderProps } from "./index";

/**
 * A tiny stand-in for a real router (Next.js / React Router / TanStack): it
 * intercepts internal link clicks, records the destination, and shows
 * client-side navigation without leaving Storybook. Swap for your framework's `<Link>`.
 */
function useMockRouter() {
  const [path, setPath] = React.useState("/");
  const render = React.useCallback(
    ({ href, children, ...props }: LinkRenderProps) => (
      <a
        {...props}
        href={href}
        onClick={(event) => {
          event.preventDefault();
          setPath(href);
        }}
      >
        {children}
      </a>
    ),
    [],
  );
  return { path, render };
}

function RouterDemo() {
  const router = useMockRouter();
  return (
    <LinkProvider render={router.render}>
      <div style={{ display: "grid", gap: 16, maxWidth: "48ch" }}>
        <Text size="sm" saliency="low">
          Client route (mock router): <code>{router.path}</code>
        </Text>

        <Text render={<p />}>
          These links have no <code>render</code> of their own — the{" "}
          <Link href="/dashboard">dashboard</Link> and <Link href="/settings">settings</Link> links
          route through the provider's router (watch the path above update on click), while{" "}
          <Link href="https://example.com">this external link</Link> and{" "}
          <Link href="mailto:hi@example.com">this mailto link</Link> stay plain anchors.
        </Text>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link appearance="button" href="/dashboard">
            Go to dashboard
          </Link>
          <Link appearance="button" saliency="low" href="https://example.com" target="_blank">
            External (new tab)
          </Link>
        </div>
      </div>
    </LinkProvider>
  );
}

const meta: Meta<typeof LinkProvider> = {
  title: "Components/LinkProvider",
  component: LinkProvider,
  parameters: {
    docs: {
      description: {
        component:
          "`LinkProvider` wires the design system's `Link` to your app's router once, for the whole tree. Every *internal* `Link` (inline or `appearance=\"button\"`) then renders through your router's link — keeping the system's styling while the router owns navigation — with external, new-tab, and `download` links falling back to a plain `<a>`. A per-link `render` still overrides the provider.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof LinkProvider>;

/**
 * A mock router provider wrapping a mix of internal and external links. Click the
 * internal ones to see the client route (top) change without a full page load;
 * the external / new-tab links stay ordinary anchors.
 */
export const WithMockRouter: Story = {
  render: () => <RouterDemo />,
};
