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
    shape: { control: "inline-radio", options: ["round", "square"] },
    count: { control: "number" },
    max: { control: "number" },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

/**
 * A badge takes one of four content kinds — a count, text, an icon, or a bare
 * blank indicator — and each is independently `round` (default) or `square`.
 * That gives a 4 × 2 grid.
 */
export const Kinds: Story = {
  render: () => {
    const kinds = [
      {
        kind: "Count",
        description: "A numeric value.",
        content: { count: 5 } as const,
      },
      {
        kind: "Text",
        description: "A short label.",
        content: { text: "NEW" } as const,
      },
      {
        kind: "Icon",
        description: "A glyph.",
        content: { icon: <BellGlyph /> } as const,
      },
      {
        kind: "Blank",
        description: "A bare indicator with no content.",
        content: {} as const,
      },
    ];
    const cellStyle = {
      padding: "12px 16px",
      textAlign: "left",
      verticalAlign: "middle",
      borderBottom: "1px solid var(--baritone-color-border-subtle, #e0e0e0)",
    } satisfies CSSProperties;
    return (
      <table style={{ borderCollapse: "collapse", minWidth: 420 }}>
        <thead>
          <tr>
            <th style={{ ...cellStyle, fontWeight: 600 }}>Kind</th>
            <th style={{ ...cellStyle, fontWeight: 600 }}>Description</th>
            <th style={{ ...cellStyle, fontWeight: 600 }}>Round</th>
            <th style={{ ...cellStyle, fontWeight: 600 }}>Square</th>
          </tr>
        </thead>
        <tbody>
          {kinds.map(({ kind, description, content }) => (
            <tr key={kind}>
              <td style={{ ...cellStyle, fontWeight: 500 }}>{kind}</td>
              <td style={cellStyle}>{description}</td>
              <td style={cellStyle}>
                <Badge intent="primary" saliency="high" shape="round" {...content} />
              </td>
              <td style={cellStyle}>
                <Badge intent="primary" saliency="high" shape="square" {...content} />
              </td>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {(["round", "square"] as const).map((shape) => (
        <div key={shape} style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {SIZES.map((size) => (
            <div key={size} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Badge intent="primary" saliency="high" size={size} shape={shape} count={8} />
              <Badge intent="primary" saliency="high" size={size} shape={shape} text="NEW" />
              <Badge
                intent="primary"
                saliency="high"
                size={size}
                shape={shape}
                icon={<BellGlyph />}
              />
              <Badge intent="primary" saliency="high" size={size} shape={shape} />
            </div>
          ))}
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

/**
 * A blank badge has no content — a bare indicator for "something's here" without
 * a value. Round renders as a dot; square as a small rounded square.
 */
export const Blank: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {(["round", "square"] as const).map((shape) => (
        <div key={shape} style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {INTENTS.map((intent) => (
            <Badge key={intent} intent={intent} saliency="high" shape={shape} />
          ))}
        </div>
      ))}
    </div>
  ),
};

/**
 * The `square` shape is orthogonal to the content kind: any badge can be square,
 * swapping the fully-rounded silhouette for softly-rounded corners.
 */
export const Square: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Badge intent="primary" saliency="high" shape="square" count={8} />
      <Badge intent="primary" saliency="high" shape="square" count={100} max={99} />
      <Badge intent="primary" saliency="high" shape="square" text="NEW" />
      <Badge intent="primary" saliency="high" shape="square" icon={<BellGlyph />} />
      <Badge intent="primary" saliency="high" shape="square" />
    </div>
  ),
};

/**
 * The `color` escape hatch, for a badge whose fill is *data* rather than a
 * design decision — a per-tag colour, a customer-chosen label colour, a
 * language swatch. These are values the palette can't enumerate, because they
 * aren't the system's to choose.
 *
 * Prefer `intent`/`saliency` for everything the palette *can* express: those
 * badges re-theme with the rest of the system, these are frozen at whatever you
 * pass. `color` is mutually exclusive with `intent`/`saliency`.
 */
export const CustomColor: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <Badge color="#7c3aed" text="NEW" />
      <Badge color="#7c3aed" count={8} />
      <Badge color="#7c3aed" icon={<BellGlyph />} />
      <Badge color="#7c3aed" shape="square" text="BETA" />
      <Badge color="#7c3aed" />
    </div>
  ),
};

/**
 * The foreground is derived from the fill, not asked for: a caller supplying a
 * brand colour shouldn't also have to work out whether black or white text
 * survives on it. Relative-colour syntax reads the fill's oklch lightness and
 * snaps the text to whichever end stays legible — so these fills, running dark
 * to light, flip from white text to black on their own.
 */
export const CustomColorContrast: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      {["#0b1020", "#3730a3", "#7c3aed", "#e11d48", "#f59e0b", "#fde047", "#f8fafc"].map(
        (color) => (
          <Badge key={color} color={color} shape="square" size="lg" text={color} />
        ),
      )}
    </div>
  ),
};
