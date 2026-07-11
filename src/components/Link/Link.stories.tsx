import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { Link } from "./index";

// A throwaway glyph so the icon stories have something to render.
const Sparkle = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.4 6.5L21 11l-6.6 2.5L12 20l-2.4-6.5L3 11l6.6-2.5z" />
    </svg>
  </Icon>
);

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

export const ButtonAppearance: Story = {
  args: {
    appearance: "button",
    intent: "primary",
    saliency: "high",
    children: "Go to dashboard",
    href: "/dashboard",
  },
  parameters: {
    docs: {
      description: {
        story:
          '`appearance="button"` renders a link that looks like a `Button`, reusing Button\'s recipe — same `intent`/`saliency`/`size`/`loading`/icon knobs, but the element is a real anchor (or your router link via `render`).',
      },
    },
  },
};

export const ButtonIntentsAndSaliencies: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {INTENTS.map((intent) => (
        <div key={intent} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {SALIENCIES.map((saliency) => (
            <Link
              key={saliency}
              appearance="button"
              intent={intent}
              saliency={saliency}
              href="https://example.com"
            >
              {intent}/{saliency}
            </Link>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const ButtonSizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {SIZES.map((size) => (
        <Link key={size} appearance="button" size={size} href="https://example.com">
          {size}
        </Link>
      ))}
    </div>
  ),
};

export const ButtonWithIcons: Story = {
  args: {
    appearance: "button",
    intent: "primary",
    startIcon: <Sparkle />,
    endIcon: <Sparkle />,
    children: "With icons",
    href: "https://example.com",
  },
};

export const ButtonLoading: Story = {
  args: {
    appearance: "button",
    loading: true,
    children: "Redirecting…",
    href: "https://example.com",
  },
};

export const ButtonDisabled: Story = {
  args: {
    appearance: "button",
    disabled: true,
    children: "Unavailable",
    href: "https://example.com",
    disabledReason: "You need an account to open this.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "A disabled button-link has no honest HTML form, so it collapses to an inert element (out of the a11y tree as a link) while keeping the button styling. Tab to or hover it to see the `disabledReason`.",
      },
    },
  },
};

// As a button-styled router link: `render` owns navigation, the recipe owns the look.
export const ButtonAsRouterLink: Story = {
  args: {
    appearance: "button",
    intent: "primary",
    children: "Open settings",
    render: <a href="/settings" data-router-link="" />,
  },
};
