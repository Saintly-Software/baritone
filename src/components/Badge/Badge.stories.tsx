import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { IntentSaliencyMatrix } from "../_stories/IntentSaliencyMatrix";
import { Icon } from "../Icon";
import { Badge } from "./index";

// Throwaway glyph so the icon stories have something to render.
const BellGlyph = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  </Icon>
);

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  args: { count: 5, intent: "primary", saliency: "high", size: "md" },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SALIENCIES },
    size: { control: "select", options: SIZES },
    count: { control: "number" },
    max: { control: "number" },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

/** A badge takes one of five shapes: a count, text, an icon, a square swatch, or a bare dot. */
export const Shapes: Story = {
  render: () => {
    const shapes = [
      {
        kind: "Count",
        description: "A numeric value.",
        badge: <Badge intent="primary" saliency="high" count={5} />,
      },
      {
        kind: "Text",
        description: "A short label.",
        badge: <Badge intent="primary" saliency="high" text="NEW" />,
      },
      {
        kind: "Icon",
        description: "A glyph.",
        badge: <Badge intent="primary" saliency="high" icon={<BellGlyph />} />,
      },
      {
        kind: "Square",
        description: "A content-less colour swatch.",
        badge: <Badge intent="primary" saliency="high" square />,
      },
      {
        kind: "Dot",
        description: "A bare indicator with no content.",
        badge: <Badge intent="primary" saliency="high" />,
      },
    ];
    const cellStyle = {
      padding: "12px 16px",
      textAlign: "left",
      verticalAlign: "middle",
      borderBottom: "1px solid var(--baritone-color-border-subtle, #e0e0e0)",
    } satisfies CSSProperties;
    return (
      <table style={{ borderCollapse: "collapse", minWidth: 360 }}>
        <thead>
          <tr>
            <th style={{ ...cellStyle, fontWeight: 600 }}>Kind</th>
            <th style={{ ...cellStyle, fontWeight: 600 }}>Description</th>
            <th style={{ ...cellStyle, fontWeight: 600 }}>Example</th>
          </tr>
        </thead>
        <tbody>
          {shapes.map(({ kind, description, badge }) => (
            <tr key={kind}>
              <td style={{ ...cellStyle, fontWeight: 500 }}>{kind}</td>
              <td style={cellStyle}>{description}</td>
              <td style={cellStyle}>{badge}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
};

export const IntentsAndSaliencies: Story = {
  render: () => (
    <IntentSaliencyMatrix intents={INTENTS} saliencies={SALIENCIES}>
      {(intent, saliency) => <Badge intent={intent} saliency={saliency} count={8} />}
    </IntentSaliencyMatrix>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      {SIZES.map((size) => (
        <div key={size} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge intent="primary" saliency="high" size={size} count={8} />
          <Badge intent="primary" saliency="high" size={size} text="NEW" />
          <Badge intent="primary" saliency="high" size={size} icon={<BellGlyph />} />
          <Badge intent="primary" saliency="high" size={size} square />
          <Badge intent="primary" saliency="high" size={size} />
        </div>
      ))}
    </div>
  ),
};

/**
 * `max` caps a `count`: when the count exceeds it, the badge renders `{max}+`.
 * It only applies to the count shape.
 */
export const CountWithMax: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <Badge intent="negative" saliency="high" count={9} max={99} />
      <Badge intent="negative" saliency="high" count={99} max={99} />
      <Badge intent="negative" saliency="high" count={100} max={99} />
      <Badge intent="negative" saliency="high" count={1200} max={999} />
    </div>
  ),
};

/** A dot has no content — a bare indicator for "something's here" without a value. */
export const Dot: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      {INTENTS.map((intent) => (
        <Badge key={intent} intent={intent} saliency="high" />
      ))}
    </div>
  ),
};

/**
 * A square is a content-less colour swatch — a lightly-rounded block of colour,
 * one per intent, for palette chips and legends.
 */
export const Square: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      {INTENTS.map((intent) => (
        <Badge key={intent} intent={intent} saliency="high" square />
      ))}
    </div>
  ),
};
