import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { Icon } from "../Icon";
import { LinkProvider } from "../LinkProvider";
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

// A left-arrow glyph for the icon-only "back" navigation stories.
const ArrowLeft = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11 5l1.4 1.4L7.8 11H20v2H7.8l4.6 4.6L11 19l-7-7z" />
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

/**
 * Pass `icon` + `aria-label` (and no `children`) for the icon-only, square
 * button-styled link — the anchor mirror of an icon-only `Button`. The
 * `aria-label` is **required**: it's the accessible name, since there's no
 * visible text. This is the honest way to name an icon-only navigation control —
 * no need to smuggle a name in through the `render` element.
 */
export const ButtonIconOnly: Story = {
  args: {
    appearance: "button",
    intent: "primary",
    saliency: "high",
    icon: <ArrowLeft />,
    "aria-label": "Back to entry details",
    href: "/entries/42",
    children: undefined,
  },
};

// The icon-only button-link stays a 1:1 square at every `size`, exactly like an
// icon-only `Button`.
export const ButtonIconOnlySizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {SIZES.map((size) => (
        <Link
          key={size}
          appearance="button"
          intent="primary"
          size={size}
          icon={<ArrowLeft />}
          aria-label={`Back (${size})`}
          href="https://example.com"
        />
      ))}
    </div>
  ),
};

// As an icon-only button-styled router link: `render` owns navigation, the square
// recipe owns the look, and the required `aria-label` names it.
export const ButtonIconOnlyAsRouterLink: Story = {
  args: {
    appearance: "button",
    intent: "primary",
    icon: <ArrowLeft />,
    "aria-label": "Back to entry details",
    render: <a href="/entries/42" data-router-link="" />,
    children: undefined,
  },
};

export const ChipAppearance: Story = {
  args: {
    appearance: "chip",
    intent: "primary",
    saliency: "low",
    size: "sm",
    children: "Music",
    href: "/notes?tags=music",
  },
  parameters: {
    docs: {
      description: {
        story:
          "`appearance=\"chip\"` renders a link that looks like a `Chip`, reusing Chip's recipe — same `intent`/`saliency`/`size`/`shape`/`width` knobs — but the element is a real anchor (or your router link via `render`). It's how a whole chip navigates, without putting an `href` on `Chip`.",
      },
    },
  },
};

export const ChipIntentsAndSaliencies: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {INTENTS.map((intent) => (
        <div key={intent} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {SALIENCIES.map((saliency) => (
            <Link
              key={saliency}
              appearance="chip"
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

export const ChipSizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {SIZES.map((size) => (
        <Link key={size} appearance="chip" intent="primary" size={size} href="https://example.com">
          {size}
        </Link>
      ))}
    </div>
  ),
};

/**
 * `shape` matches `Chip`: `square` (default) keeps the component radius, `pill`
 * fully rounds the ends.
 */
export const ChipShapes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Link appearance="chip" intent="primary" shape="square" href="https://example.com">
        square
      </Link>
      <Link appearance="chip" intent="primary" shape="pill" href="https://example.com">
        pill
      </Link>
    </div>
  ),
};

/**
 * `width="fill"` stretches the chip-link to its container — useful when chip-links
 * stack in a column and should share one edge. The label truncates.
 */
export const ChipFill: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 220 }}>
      <Link appearance="chip" intent="primary" width="fill" href="https://example.com">
        Music
      </Link>
      <Link appearance="chip" intent="secondary" width="fill" href="https://example.com">
        A rather long tag label that truncates
      </Link>
    </div>
  ),
};

/**
 * `icon` / `trailIcon` add **decorative** glyphs on each side of the label (like
 * `Chip`'s), inheriting the chip's colour. A chip-link stays one anchor — for an
 * interactive adornment (a remove "×"), use a `Chip`.
 */
export const ChipWithIcons: Story = {
  args: {
    appearance: "chip",
    intent: "primary",
    icon: <Sparkle />,
    trailIcon: <Sparkle />,
    children: "Music",
    href: "https://example.com",
  },
};

// External destination — a plain `<a>`, never routed by a `LinkProvider`.
export const ChipExternalLink: Story = {
  args: {
    appearance: "chip",
    intent: "neutral",
    href: "https://example.com",
    target: "_blank",
    children: "Docs",
  },
};

// As a chip-styled router link: a per-link `render` owns navigation (and carries
// typed router descriptors a string `href` can't express); the recipe owns the look.
export const ChipAsRouterLink: Story = {
  args: {
    appearance: "chip",
    intent: "primary",
    saliency: "low",
    children: "Music",
    render: <a href="/notes?tags=music" data-router-link="" />,
  },
};

/**
 * Under a `LinkProvider`, an internal `href` routes through the app's router while
 * keeping the chip styling — no per-link `render` needed. (The stand-in router
 * here marks its anchors `data-router-link`.)
 */
export const ChipWithLinkProvider: Story = {
  render: () => (
    <LinkProvider render={({ href, ...props }) => <a {...props} href={href} data-router-link="" />}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link appearance="chip" intent="primary" saliency="low" href="/notes?tags=music">
          Music (internal)
        </Link>
        <Link appearance="chip" intent="neutral" href="https://example.com">
          Docs (external)
        </Link>
      </div>
    </LinkProvider>
  ),
};

export const ChipDisabled: Story = {
  args: {
    appearance: "chip",
    intent: "primary",
    disabled: true,
    children: "Music",
    href: "/notes?tags=music",
    disabledReason: "Sign in to browse tags.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "A disabled chip-link has no honest HTML form, so it collapses to an inert element (out of the a11y tree as a link) while keeping the chip styling. Tab to or hover it to see the `disabledReason`.",
      },
    },
  },
};
