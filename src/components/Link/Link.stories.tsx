import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "../Text";
import { Link } from "./index";

const meta: Meta<typeof Link> = {
  title: "Components/Link",
  component: Link,
  args: { children: "Read the docs", href: "https://example.com" },
};
export default meta;

type Story = StoryObj<typeof Link>;

export const Playground: Story = {};

export const Inline: Story = {
  render: () => (
    <Text render={<p style={{ maxWidth: "40ch" }} />}>
      Links inherit the surrounding type, so they sit naturally{" "}
      <Link href="https://example.com">inside a paragraph</Link> and stay underlined for
      accessibility — never colour alone.
    </Text>
  ),
};

// Router-agnostic: any component can be supplied via `render`. Here a plain
// element stands in for a framework's link (Next.js `<Link>`, React Router
// `<Link>`, TanStack Router, …) — it keeps the styling while owning navigation.
export const AsRouterLink: Story = {
  args: {
    children: "Go to the dashboard",
    render: <a href="/dashboard" data-router-link="" />,
  },
};
