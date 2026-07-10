import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS, SURFACE_SALIENCIES } from "../../theme/constants";
import { Button } from "../Button";
import { Notice } from "./index";

// Throwaway glyph so the icon stories have something to render.
const InfoGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

const meta: Meta<typeof Notice> = {
  title: "Components/Notice",
  component: Notice,
  args: {
    intent: "primary",
    saliency: "high",
    shape: "square",
    children: "Heads up",
    description: "This is a notice with a short supporting description beneath its title.",
  },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SURFACE_SALIENCIES },
    shape: { control: "inline-radio", options: ["square", "pill"] },
    children: { control: "text" },
    description: { control: "text" },
  },
};
export default meta;

type Story = StoryObj<typeof Notice>;

export const Playground: Story = {
  args: { icon: <InfoGlyph /> },
};

/** Every intent, at both saliencies (`high` = washed fill, `low` = subtle). */
export const IntentsAndSaliencies: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
      {INTENTS.map((intent) =>
        SURFACE_SALIENCIES.map((saliency) => (
          <Notice
            key={`${intent}-${saliency}`}
            intent={intent}
            saliency={saliency}
            icon={<InfoGlyph />}
          >
            {intent} · {saliency}
          </Notice>
        )),
      )}
    </div>
  ),
};

/** Title only, then title + description, then + actions. */
export const Anatomy: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
      <Notice intent="primary" icon={<InfoGlyph />}>
        Just a title
      </Notice>
      <Notice
        intent="primary"
        icon={<InfoGlyph />}
        description="A description sits on the line beneath the title."
      >
        Title with description
      </Notice>
      <Notice
        intent="primary"
        icon={<InfoGlyph />}
        description="Actions render as a row beneath the text."
        actions={[
          <Button key="ok" size="sm">
            Got it
          </Button>,
          <Button key="dismiss" size="sm" saliency="low">
            Dismiss
          </Button>,
        ]}
      >
        Title with actions
      </Notice>
    </div>
  ),
};

/** `pill` fully rounds the ends, like a `Chip`. */
export const Shapes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
      <Notice intent="positive" shape="square" icon={<InfoGlyph />}>
        Square notice
      </Notice>
      <Notice intent="positive" shape="pill" icon={<InfoGlyph />}>
        Pill notice
      </Notice>
    </div>
  ),
};

/**
 * `Notice.Icon` tints the icon a different intent than the notice — here a
 * neutral notice with a warning-coloured icon.
 */
export const RecolouredIcon: Story = {
  render: () => (
    <Notice
      intent="neutral"
      icon={
        <Notice.Icon intent="warning" saliency="high">
          <InfoGlyph />
        </Notice.Icon>
      }
      description="The notice is neutral, but its icon is tinted `warning` via Notice.Icon."
    >
      Recoloured icon
    </Notice>
  ),
};
