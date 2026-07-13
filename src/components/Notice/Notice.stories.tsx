import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS, SURFACE_SALIENCIES } from "../../theme/constants";
import { IntentSaliencyMatrix } from "../_stories/IntentSaliencyMatrix";
import { Icon } from "../Icon";
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

/**
 * Kitchen sink — one notice exercising the full surface in a single composition:
 * a leading `icon`, a status `chip` on the title line, a `description`, a
 * dismiss `close`, and a row of `actions` (a primary button, a link, and an
 * icon-only control). The `intent`, `saliency`, and `shape` controls drive it.
 */
export const KitchenSink: Story = {
  render: (args) => (
    <Notice
      {...args}
      icon={<InfoGlyph />}
      chip={
        <Notice.Chip intent={args.intent} shape="pill">
          New
        </Notice.Chip>
      }
      close={<Notice.Close label="Dismiss" onClick={() => alert("dismissed")} />}
      actions={[
        <Notice.Action key="save" intent={args.intent} onClick={() => {}}>
          Save
        </Notice.Action>,
        <Notice.Action key="docs" saliency="low" href="#">
          Read the docs
        </Notice.Action>,
        <Notice.Action
          key="more"
          saliency="low"
          icon={
            <Icon>
              <InfoGlyph />
            </Icon>
          }
          label="More options"
          onClick={() => {}}
        />,
      ]}
    />
  ),
};

/** Every intent, at both saliencies (`high` = washed fill, `low` = subtle). */
export const IntentsAndSaliencies: Story = {
  render: () => (
    <IntentSaliencyMatrix intents={INTENTS} saliencies={SURFACE_SALIENCIES}>
      {(intent, saliency) => (
        <Notice intent={intent} saliency={saliency} icon={<InfoGlyph />}>
          {intent}
        </Notice>
      )}
    </IntentSaliencyMatrix>
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
          <Notice.Action key="ok" intent="primary" onClick={() => {}}>
            Got it
          </Notice.Action>,
          <Notice.Action key="learn" saliency="low" href="#">
            Learn more
          </Notice.Action>,
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
  tags: ["!dev"],
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

/** `inline` shrinks the notice to its content instead of filling the width. */
export const Inline: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <Notice intent="neutral" inline icon={<InfoGlyph />}>
        Inline notice
      </Notice>
      <Notice intent="positive" inline shape="pill" icon={<InfoGlyph />}>
        Inline pill
      </Notice>
    </div>
  ),
};

/**
 * `disabled` dims the whole notice and makes its actions/close inert (they stay
 * focusable — `aria-disabled`, never the native attribute).
 */
export const Disabled: Story = {
  render: () => (
    <Notice
      intent="primary"
      disabled
      icon={<InfoGlyph />}
      description="The action and dismiss are inert while the notice is disabled."
      close={() => {}}
      actions={[
        <Notice.Action key="ok" intent="primary" onClick={() => {}}>
          Got it
        </Notice.Action>,
      ]}
    >
      Disabled notice
    </Notice>
  ),
};
