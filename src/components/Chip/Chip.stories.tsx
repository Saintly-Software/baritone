import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { Icon } from "../Icon";
import { Popover } from "../Popover";
import { Text } from "../Text";
import { Chip } from "./index";

// Throwaway glyphs so the adornment stories have something to render.
const TagGlyph = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13.2V4h9.2l8.4 8.4a1 1 0 0 1 0 1z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  </Icon>
);

const CloseGlyph = () => (
  <Icon>
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  </Icon>
);

const ExternalGlyph = () => (
  <Icon>
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 5h5v5M19 5l-9 9M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" />
    </svg>
  </Icon>
);

const meta: Meta<typeof Chip> = {
  title: "Components/Chip",
  component: Chip,
  args: { children: "Chip", intent: "neutral", saliency: "mid", size: "md" },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SALIENCIES },
    size: { control: "select", options: SIZES },
    shape: { control: "inline-radio", options: ["square", "pill"] },
    loading: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof Chip>;

export const Playground: Story = {};

export const IntentsAndSaliencies: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {INTENTS.map((intent) => (
        <div key={intent} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {SALIENCIES.map((saliency) => (
            <Chip key={saliency} intent={intent} saliency={saliency}>
              {intent}/{saliency}
            </Chip>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {SIZES.map((size) => (
        <Chip key={size} intent="primary" saliency="high" size={size}>
          {size}
        </Chip>
      ))}
    </div>
  ),
};

/**
 * `shape` switches the chip's silhouette: `square` (default) keeps the shared
 * component radius — softly rounded corners — while `pill` fully rounds the ends
 * into a Bootstrap-style pill/badge.
 */
export const Shapes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Chip intent="primary" saliency="high" shape="square">
        square
      </Chip>
      <Chip intent="primary" saliency="high" shape="pill">
        pill
      </Chip>
      <Chip
        intent="neutral"
        saliency="mid"
        shape="pill"
        leadAdornments={[<Chip.Adornment icon={<TagGlyph />} />]}
        trailAdornments={[
          <Chip.Adornment icon={<CloseGlyph />} label="Remove" onClick={() => alert("removed")} />,
        ]}
      >
        Pill with adornments
      </Chip>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, intent: "primary", saliency: "high", children: "Disabled" },
};

/**
 * `loading` replaces the chip's entire content — adornments and label — with a
 * centred spinner, and marks the chip `aria-busy` + inert. The chip keeps its
 * height; its width collapses to the spinner.
 */
export const Loading: Story = {
  args: { loading: true, intent: "primary", saliency: "high", children: "Saving…" },
};

/** The spinner is sized in `em`, so it tracks each chip size. */
export const LoadingSizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {SIZES.map((size) => (
        <Chip key={size} intent="primary" saliency="high" size={size} loading>
          {size}
        </Chip>
      ))}
    </div>
  ),
};

export const AsLink: Story = {
  args: {
    intent: "secondary",
    saliency: "low",
    render: <a href="https://example.com" />,
    children: "Link chip",
  },
};

/**
 * Pass `onClick` to make the chip's text label itself clickable — it renders as
 * a real `<button>` (keyboard-focusable, Enter/Space-activated). Adornments keep
 * their own actions, so the label and a trailing "×" are separate hit targets. A
 * disabled chip's label goes inert but stays focusable (`aria-disabled`).
 */
export const ClickableLabel: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Chip intent="primary" saliency="mid" onClick={() => alert("label clicked")}>
        Clickable
      </Chip>

      {/* Clickable label + independent remove button. */}
      <Chip
        intent="neutral"
        saliency="mid"
        onClick={() => alert("filter by tag")}
        trailAdornments={[
          <Chip.Adornment icon={<CloseGlyph />} label="Remove" onClick={() => alert("removed")} />,
        ]}
      >
        Filter
      </Chip>

      {/* Disabled: label inert but still focusable. */}
      <Chip intent="primary" saliency="high" disabled onClick={() => alert("nope")}>
        Disabled
      </Chip>
    </div>
  ),
};

/**
 * Pass a configured `<Popover>` to `popover` to open it from the chip's text
 * label. The label renders as a real `<button>` that base-ui wires as the
 * popover's trigger (`aria-haspopup` / `aria-expanded` / `aria-controls`), so it's
 * keyboard-operable. Adornments keep their own actions, and a disabled chip's
 * label stays focusable but won't open the popover.
 */
export const WithPopover: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Chip
        intent="primary"
        saliency="mid"
        popover={
          <Popover header={<Popover.Header title="Build #1429" subtitle="Passed in 2m 14s" />}>
            <Text variant="sm">All 312 checks green. Deployed to staging.</Text>
          </Popover>
        }
      >
        Passing
      </Chip>

      {/* Popover-triggering label alongside an independent remove button. */}
      <Chip
        intent="neutral"
        saliency="mid"
        popover={
          <Popover>
            <Text variant="sm">Tagged by 4 people.</Text>
          </Popover>
        }
        trailAdornments={[
          <Chip.Adornment icon={<CloseGlyph />} label="Remove" onClick={() => alert("removed")} />,
        ]}
      >
        Details
      </Chip>

      {/* Disabled: the label trigger is inert but still focusable. */}
      <Chip
        intent="primary"
        saliency="high"
        disabled
        popover={
          <Popover>
            <Text variant="sm">You won't see me.</Text>
          </Popover>
        }
      >
        Disabled
      </Chip>
    </div>
  ),
};

/**
 * Adornments are `Chip.Adornment`s passed to `leadAdornments` / `trailAdornments`.
 * Each is one of three kinds: a regular icon, a clickable `<button>` (`onClick`),
 * or a link `<a>` (`href`). They inherit the chip's colour.
 */
export const Adornments: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      {/* Regular leading icon. */}
      <Chip
        intent="primary"
        saliency="mid"
        leadAdornments={[<Chip.Adornment icon={<TagGlyph />} />]}
      >
        Label
      </Chip>

      {/* Clickable trailing "remove" button. */}
      <Chip
        intent="neutral"
        saliency="mid"
        trailAdornments={[
          <Chip.Adornment icon={<CloseGlyph />} label="Remove" onClick={() => alert("removed")} />,
        ]}
      >
        Removable
      </Chip>

      {/* Link trailing adornment. */}
      <Chip
        intent="secondary"
        saliency="low"
        trailAdornments={[
          <Chip.Adornment icon={<ExternalGlyph />} label="Open docs" href="https://example.com" />,
        ]}
      >
        Docs
      </Chip>

      {/* Both ends. */}
      <Chip
        intent="positive"
        saliency="mid"
        leadAdornments={[<Chip.Adornment icon={<TagGlyph />} />]}
        trailAdornments={[
          <Chip.Adornment icon={<CloseGlyph />} label="Dismiss" onClick={() => alert("dismiss")} />,
        ]}
      >
        Both ends
      </Chip>
    </div>
  ),
};

/**
 * `handleRemove` is a shortcut for the common "removable chip": supply it and the
 * chip appends a built-in clickable remove "×" as the *last* trailing adornment —
 * after any `trailAdornments` you pass — so you don't have to wire up the close
 * button yourself.
 */
export const Removable: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      {/* Just a removable chip. */}
      <Chip intent="neutral" saliency="mid" handleRemove={() => alert("removed")}>
        Removable
      </Chip>

      {/* The built-in "×" sits after a supplied leading + trailing adornment. */}
      <Chip
        intent="primary"
        saliency="mid"
        leadAdornments={[<Chip.Adornment icon={<TagGlyph />} />]}
        trailAdornments={[
          <Chip.Adornment icon={<ExternalGlyph />} label="Open docs" href="https://example.com" />,
        ]}
        handleRemove={() => alert("removed")}
      >
        Tag
      </Chip>

      {/* Disabled: the remove "×" goes inert but stays focusable. */}
      <Chip intent="primary" saliency="high" disabled handleRemove={() => alert("nope")}>
        Disabled
      </Chip>
    </div>
  ),
};

/**
 * An adornment inherits the chip's intent by default; set its own `intent` to
 * tint just that adornment (it keeps the chip's saliency).
 */
export const AdornmentIntentOverride: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Chip
        intent="neutral"
        saliency="mid"
        trailAdornments={[
          <Chip.Adornment
            icon={<CloseGlyph />}
            label="Remove"
            intent="negative"
            onClick={() => alert("removed")}
          />,
        ]}
      >
        Inherited label, negative ×
      </Chip>
      <Chip
        intent="neutral"
        saliency="mid"
        leadAdornments={[<Chip.Adornment icon={<TagGlyph />} intent="positive" />]}
      >
        Positive tag
      </Chip>
    </div>
  ),
};

/**
 * A disabled chip drags its clickable adornments along: they go inert but stay
 * keyboard-focusable (`aria-disabled`, per the system convention).
 */
export const DisabledWithAdornments: Story = {
  args: {
    disabled: true,
    intent: "primary",
    saliency: "high",
    children: "Disabled",
    leadAdornments: [<Chip.Adornment icon={<TagGlyph />} />],
    trailAdornments: [
      <Chip.Adornment icon={<CloseGlyph />} label="Remove" onClick={() => alert("removed")} />,
    ],
  },
};
