import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
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

/** A badge takes one of four shapes: a count, text, an icon, or a bare dot. */
export const Shapes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <Badge intent="primary" saliency="high" count={5} />
      <Badge intent="primary" saliency="high" text="NEW" />
      <Badge intent="primary" saliency="high" icon={<BellGlyph />} />
      <Badge intent="primary" saliency="high" />
    </div>
  ),
};

export const IntentsAndSaliencies: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {INTENTS.map((intent) => (
        <div key={intent} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {SALIENCIES.map((saliency) => (
            <Badge key={saliency} intent={intent} saliency={saliency} count={8} />
          ))}
        </div>
      ))}
    </div>
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
