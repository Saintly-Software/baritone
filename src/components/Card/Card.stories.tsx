import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { INTENTS, SURFACE_SALIENCIES } from "../../theme/constants";
import { Button } from "../Button";
import { Chip } from "../Chip";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { Card } from "./index";

const meta: Meta<typeof Card> = {
  title: "Surfaces/Card",
  component: Card,
  args: { intent: "neutral", saliency: "low", padding: "md" },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SURFACE_SALIENCIES },
    padding: { control: "select", options: ["none", "sm", "md", "lg"] },
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
      padding={args.padding}
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
      padding={args.padding}
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
          padding={args.padding}
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
      padding={args.padding}
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
      padding={args.padding}
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
      padding={args.padding}
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

/** `Card.Rows` — a `dl` of key/value rows, with a rich title/actions row. */
export const Rows: Story = {
  render: (args) => (
    <Card
      intent={args.intent}
      saliency={args.saliency}
      padding={args.padding}
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

export const BleedAndDivider: Story = {
  render: (args) => (
    <Card
      intent={args.intent}
      saliency={args.saliency}
      padding={args.padding}
      style={{ maxWidth: 360 }}
    >
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
