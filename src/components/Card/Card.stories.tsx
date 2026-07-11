import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { INTENTS, SURFACE_SALIENCIES } from "../../theme/constants";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Chip } from "../Chip";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { Card } from "./index";

const meta: Meta<typeof Card> = {
  title: "Surfaces/Card",
  component: Card,
  args: { intent: "neutral", saliency: "high" },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SURFACE_SALIENCIES },
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

/** A small decorative glyph for the icon/chip demos. */
function FolderGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

export const Playground: Story = {
  render: (args) => (
    <Card {...args} style={{ maxWidth: 320 }}>
      <Text render={<p />}>
        A surface that contains other elements. Most surfaces use the neutral intent.
      </Text>
    </Card>
  ),
};

export const WithHeaderAndFooter: Story = {
  render: (args) => (
    <Card
      intent={args.intent}
      saliency={args.saliency}
      as="section"
      style={{ maxWidth: 360 }}
      header={<Card.Header title="Card title" subtitle="A short supporting subtitle" />}
      footer={
        <Card.Footer
          actions={
            <Card.Actions
              actions={[
                <Button intent="secondary" saliency="low">
                  Cancel
                </Button>,
                <Button intent="primary" saliency="high">
                  Save
                </Button>,
              ]}
            />
          }
        />
      }
    >
      <Text render={<p />}>
        The header and footer are passed as props; the content sits between them. The footer's
        actions are a `Card.Actions`, anchored to the end.
      </Text>
    </Card>
  ),
};

/** Header with a leading `icon` and a trailing status `chip`. */
export const HeaderIconAndChip: Story = {
  render: (args) => (
    <Card
      intent={args.intent}
      saliency={args.saliency}
      style={{ maxWidth: 360 }}
      header={
        <Card.Header
          title="Production"
          subtitle="api.example.com"
          icon={
            <Icon size="lg">
              <FolderGlyph />
            </Icon>
          }
          chip={
            <Chip intent="positive" saliency="low" size="sm">
              Healthy
            </Chip>
          }
        />
      }
    >
      <Text render={<p />}>The header takes an `icon` on the start and a `chip` on the end.</Text>
    </Card>
  ),
};

/**
 * Clickable: the whole surface activates, but only the header title is the real
 * `<button>` (stretched over the card with an `::after` overlay) — so the
 * accessible name is just the title, not the whole card. Following
 * https://inclusive-components.design/cards/.
 */
export const Clickable: Story = {
  render: (args) => {
    function ClickableCard() {
      const [count, setCount] = React.useState(0);
      return (
        <Card
          intent={args.intent}
          saliency={args.saliency}
          style={{ maxWidth: 320 }}
          onClick={() => setCount((c) => c + 1)}
          header={<Card.Header title="Activate this card" />}
        >
          {/* The card is a container now, so block content is fine. */}
          <Text render={<p />} variant="sm" saliency="low">
            Pressed {count} {count === 1 ? "time" : "times"}.
          </Text>
        </Card>
      );
    }
    return <ClickableCard />;
  },
};

/**
 * Linkable: the header title is the one real `<a>`, stretched over the whole
 * surface — so the entire card navigates on click while only the title names the
 * link.
 */
export const Linkable: Story = {
  render: (args) => (
    <Card
      intent={args.intent}
      saliency={args.saliency}
      style={{ maxWidth: 320 }}
      href="https://example.com"
      target="_blank"
      rel="noreferrer"
      header={<Card.Header title="Read the docs" subtitle="example.com" />}
    >
      <Text render={<p />}>The entire surface navigates on click, with hover/active states.</Text>
    </Card>
  ),
};

/**
 * Because the card is a container (not itself a button/anchor), it can hold
 * *other* controls: here the whole card links to the project while a footer
 * button stays an independent click target. The old whole-card-is-a-control model
 * couldn't nest these.
 */
export const LinkableWithNestedActions: Story = {
  render: (args) => (
    <Card
      intent={args.intent}
      saliency={args.saliency}
      style={{ maxWidth: 360 }}
      href="https://example.com"
      header={<Card.Header title="Acme Design System" subtitle="example.com" />}
      footer={
        <Card.Footer
          actions={
            <Card.Actions
              actions={[
                <Button intent="secondary" saliency="low" size="sm" onClick={() => {}}>
                  Star
                </Button>,
              ]}
            />
          }
        />
      }
    >
      <Text render={<p />}>
        Opening the card follows the link; the Star button is a separate action that doesn't
        navigate.
      </Text>
    </Card>
  ),
};

/**
 * Router-agnostic: the Card carries no framework navigation props (`to` /
 * `params` / `search` / `preload`). To wire it to your app's router, keep `href`
 * (the resolved URL — it names the link and is the no-JS fallback) and pass your
 * router's link via `render`, which owns navigation while keeping the overlay
 * styling. Here a plain element stands in for a framework's `<Link>` (Next.js,
 * React Router, TanStack Router, …).
 */
export const AsRouterLink: Story = {
  render: (args) => (
    <Card
      intent={args.intent}
      saliency={args.saliency}
      style={{ maxWidth: 320 }}
      href="/posts/accessible-cards"
      render={<a data-router-link="" />}
      header={<Card.Header title="Read the post" subtitle="in Guides" />}
    >
      <Text render={<p />}>
        The router owns navigation; the DS keeps `href` for the accessible name and the no-JS
        fallback.
      </Text>
    </Card>
  ),
};

/**
 * `download`: a plain anchor attribute on a linkable card. `download` (boolean)
 * saves the target using the server/URL filename; a string sets a suggested
 * filename. It's forwarded straight to the overlay `<a>`.
 */
export const Downloadable: Story = {
  render: (args) => (
    <Card
      intent={args.intent}
      saliency={args.saliency}
      style={{ maxWidth: 320 }}
      href="/files/q3-report.pdf"
      download="quarterly-report.pdf"
      header={
        <Card.Header
          title="Quarterly report"
          subtitle="PDF · 2.4 MB"
          icon={
            <Icon size="lg">
              <FolderGlyph />
            </Icon>
          }
        />
      }
    >
      <Text render={<p />}>Clicking the card downloads the file as `quarterly-report.pdf`.</Text>
    </Card>
  ),
};

/**
 * Collapsible: a disclosure **button** in the header (the chevron) toggles it —
 * only the header shows when closed, and the body + footer collapse away. Because
 * only the button toggles (not the whole header), the header can carry its own
 * content like the status chip.
 */
export const Collapsible: Story = {
  render: (args) => (
    <Card
      intent={args.intent}
      saliency={args.saliency}
      style={{ maxWidth: 360 }}
      collapsible
      defaultOpen
      header={
        <Card.Header
          title="Shipping details"
          subtitle="2–4 business days"
          chip={
            <Chip intent="primary" saliency="low" size="sm">
              Free
            </Chip>
          }
        />
      }
      footer={
        <Card.Footer
          actions={
            <Card.Actions
              actions={[
                <Button intent="primary" saliency="high" size="sm">
                  Track
                </Button>,
              ]}
            />
          }
        />
      }
    >
      <Text render={<p />}>
        We ship worldwide with tracked carriers. Collapse the card to show only the header.
      </Text>
    </Card>
  ),
};

/**
 * `selected` — the accented "chosen" state. The intended pattern is a real
 * control inside the card (here a `Checkbox`) that owns the state for assistive
 * tech; `selected` accents the surface edge to reinforce it for sighted users, so
 * selection is never conveyed by colour alone. Toggle a box to see the accent
 * follow it.
 */
export const Selected: Story = {
  render: (args) => {
    function SelectableCards() {
      const [picked, setPicked] = React.useState<Record<string, boolean>>({ pro: true });
      const plans = [
        { id: "starter", name: "Starter", meta: "For individuals" },
        { id: "pro", name: "Pro", meta: "For growing teams" },
        { id: "enterprise", name: "Enterprise", meta: "For large orgs" },
      ];
      return (
        <div style={{ display: "grid", gap: 12, maxWidth: 360 }}>
          {plans.map((plan) => (
            <Card
              key={plan.id}
              intent={args.intent}
              saliency={args.saliency}
              selected={picked[plan.id] ?? false}
              header={<Card.Header title={plan.name} subtitle={plan.meta} />}
            >
              <Checkbox
                label={`Select ${plan.name}`}
                value={picked[plan.id] ?? false}
                onChange={(next) => setPicked((prev) => ({ ...prev, [plan.id]: next }))}
              />
            </Card>
          ))}
        </div>
      );
    }
    return <SelectableCards />;
  },
};

/**
 * When the card itself is the control, `selected` is announced *on* it: a
 * clickable card becomes a toggle button (`aria-pressed`), so the whole surface
 * is the selection target. Useful for a grid of options where each card toggles.
 */
export const SelectableToggle: Story = {
  render: (args) => {
    function ToggleCards() {
      const [picked, setPicked] = React.useState<string | null>("weekly");
      const options = [
        { id: "daily", name: "Daily digest" },
        { id: "weekly", name: "Weekly summary" },
        { id: "off", name: "No emails" },
      ];
      return (
        <div style={{ display: "grid", gap: 12, maxWidth: 360 }}>
          {options.map((option) => (
            <Card
              key={option.id}
              intent={args.intent}
              saliency={args.saliency}
              selected={picked === option.id}
              onClick={() => setPicked(option.id)}
              header={<Card.Header title={option.name} />}
            />
          ))}
        </div>
      );
    }
    return <ToggleCards />;
  },
};

/** `Card.Rows` — a `dl` of key/value rows, with a rich title/actions row. */
export const Rows: Story = {
  render: (args) => (
    <Card
      intent={args.intent}
      saliency={args.saliency}
      style={{ maxWidth: 360 }}
      header={<Card.Header title="Subscription" />}
    >
      <Card.Rows
        rows={[
          <Card.Row term="Plan" description="Pro (annual)" />,
          <Card.Row term="Seats" description="12 of 20" />,
          <Card.Row term="Renews" description="Jan 1, 2027" />,
          <Card.Row
            title="Payment method"
            subtitle="Visa ending 4242"
            actions={
              <Card.Actions
                actions={[
                  <Button intent="secondary" saliency="low" size="sm">
                    Update
                  </Button>,
                ]}
              />
            }
          />,
        ]}
      />
    </Card>
  ),
};

/**
 * The string-`header` shorthand — the recommended replacement for `Card.Layout`.
 * Pass a plain string `header` (rendered as a styled title) plus any of
 * `subheader` (a caption in the header), `description` (a body paragraph) and
 * `action` (a trailing control). `children` is optional, so these props alone make
 * a complete card.
 */
export const HeaderShorthand: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
      {/* header + description + action (the before/after example). */}
      <Card
        intent={args.intent}
        saliency={args.saliency}
        header="Two-factor authentication"
        description="Add an extra layer of security to your account."
        action={
          <Button intent="primary" saliency="high" size="sm">
            Enable
          </Button>
        }
      />
      {/* header + subheader (a tight caption) + action. */}
      <Card
        intent={args.intent}
        saliency={args.saliency}
        header="Connected apps"
        subheader="3 apps have access"
        action={
          <Button intent="neutral" saliency="mid" size="sm">
            Review
          </Button>
        }
      />
      {/* header + action only. */}
      <Card
        intent={args.intent}
        saliency={args.saliency}
        header="Slack"
        action={
          <Button intent="secondary" saliency="low" size="sm">
            Disconnect
          </Button>
        }
      />
    </div>
  ),
};

/**
 * `Card.Layout` — the card's *content* is one split row: a title/subtitle stack on
 * the start and an action on the end. It's the rich `Card.Row` shape without the
 * `<dl>` (and without borrowing the `header` slot for content that isn't a
 * header), so a card can simply *be* this row. The three common shapes: title +
 * subtitle + action, a bare title + action, and (drop the `title`) a
 * description + action.
 */
export const Layout: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
      <Card intent={args.intent} saliency={args.saliency}>
        <Card.Layout
          title="Two-factor authentication"
          subtitle="Add an extra layer of security to your account."
          action={
            <Button intent="primary" saliency="high" size="sm">
              Enable
            </Button>
          }
        />
      </Card>
      <Card intent={args.intent} saliency={args.saliency}>
        <Card.Layout
          title="Slack"
          action={
            <Button intent="secondary" saliency="low" size="sm">
              Disconnect
            </Button>
          }
        />
      </Card>
      <Card intent={args.intent} saliency={args.saliency}>
        <Card.Layout
          subtitle="You're using 8.2 GB of your 10 GB of storage."
          action={
            <Button intent="primary" saliency="high" size="sm">
              Upgrade
            </Button>
          }
        />
      </Card>
    </div>
  ),
};

/**
 * Because `Card.Layout` is content (not a header), it composes cleanly with
 * `as="article"`: each card is a self-contained article whose `title` is its
 * heading and whose action is its content — the natural shape for a list of
 * teasers. (When a card root is sectioning like this, a `Card.Header` also now
 * renders a real, scoped `<header>` element rather than a plain `<div>`.)
 */
export const ArticleList: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 12, maxWidth: 460 }}>
      {[
        { title: "Designing accessible cards", meta: "8 min read" },
        { title: "Tokens, themes, and you", meta: "5 min read" },
        { title: "Shipping a component library", meta: "12 min read" },
      ].map((post) => (
        <Card key={post.title} as="article" intent={args.intent} saliency={args.saliency}>
          <Card.Layout
            title={post.title}
            subtitle={post.meta}
            action={
              <Button intent="secondary" saliency="low" size="sm">
                Read
              </Button>
            }
          />
        </Card>
      ))}
    </div>
  ),
};

export const BleedAndDivider: Story = {
  render: (args) => (
    <Card intent={args.intent} saliency={args.saliency} style={{ maxWidth: 360 }}>
      <Card.Header title="Edge-to-edge content" />
      <Card.Bleed>
        <div
          style={{
            height: 120,
            background: "var(--placeholder, #8884)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Text>full-bleed media</Text>
        </div>
      </Card.Bleed>
      <Text render={<p />}>The block above bleeds past the card padding to touch both edges.</Text>
      <Card.Divider />
      <Text render={<p />} variant="sm" saliency="low">
        A divider spans the full width too.
      </Text>
    </Card>
  ),
};

export const Saliencies: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16 }}>
      {SURFACE_SALIENCIES.map((saliency) => (
        <Card key={saliency} saliency={saliency} style={{ width: 200 }}>
          <Text render={<p />}>neutral / {saliency}</Text>
        </Card>
      ))}
    </div>
  ),
};

export const NoticeIntents: Story = {
  name: "Intents (Notice-style)",
  render: () => (
    <div style={{ display: "grid", gap: 12, maxWidth: 360 }}>
      {INTENTS.map((intent) => (
        <Card key={intent} intent={intent} saliency="low">
          <Text render={<p />}>Your last payment was {intent}.</Text>
        </Card>
      ))}
    </div>
  ),
};
