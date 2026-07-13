import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { INTENTS, SURFACE_SALIENCIES } from "../../theme/constants";
import { IntentSaliencyMatrix } from "../_stories/IntentSaliencyMatrix";
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

/**
 * Kitchen sink — one card exercising the full surface in a single composition:
 * a header with a leading `icon` and trailing status `chip`, a collapsible
 * disclosure, full-bleed media (`Card.Bleed`), a `Card.Divider`, a key/value
 * `Card.Rows` group (including a rich title/action row), and footer actions.
 */
export const KitchenSink: Story = {
  render: (args) => (
    <Card
      intent={args.intent}
      saliency={args.saliency}
      as="section"
      collapsible
      defaultOpen
      style={{ maxWidth: 400 }}
      header={
        <Card.Header
          title="Quarterly report"
          subtitle="Finance · Q3 2026"
          icon={
            <Icon size="lg">
              <FolderGlyph />
            </Icon>
          }
          chip={
            <Chip intent="positive" saliency="low" size="sm">
              Ready
            </Chip>
          }
        />
      }
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
        A header with a leading icon and a trailing chip, a collapsible disclosure, full-bleed
        media, a divider, and a key/value row group — closed off with footer actions.
      </Text>
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
      <Card.Divider />
      <Card.Rows
        rows={[
          <Card.Row term="Plan" description="Pro (annual)" />,
          <Card.Row term="Seats" description="12 of 20" />,
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

/** Every `intent` (rows) against every surface `saliency` (columns). */
export const IntentsAndSaliencies: Story = {
  render: () => (
    <IntentSaliencyMatrix intents={INTENTS} saliencies={SURFACE_SALIENCIES}>
      {(intent, saliency) => (
        <Card intent={intent} saliency={saliency} style={{ width: 160 }}>
          <Text render={<p />} variant="sm">
            Surface text
          </Text>
        </Card>
      )}
    </IntentSaliencyMatrix>
  ),
};
