import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { IntentSaliencyMatrix } from "../_stories/IntentSaliencyMatrix";
import { Popover } from "../Popover";
import { Text } from "../Text";
import { Chip } from "./index";

const TagGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13.2V4h9.2l8.4 8.4a1 1 0 0 1 0 1z" />
    <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const CloseGlyph = () => (
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
);

const ExternalGlyph = () => (
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
    <IntentSaliencyMatrix intents={INTENTS} saliencies={SALIENCIES}>
      {(intent, saliency) => (
        <Chip intent={intent} saliency={saliency}>
          Chip
        </Chip>
      )}
    </IntentSaliencyMatrix>
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

export const Loading: Story = {
  args: { loading: true, intent: "primary", saliency: "high", children: "Saving…" },
};

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

export const ClickableLabel: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Chip intent="primary" saliency="mid" onClick={() => alert("label clicked")}>
        Clickable
      </Chip>

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

      <Chip intent="primary" saliency="high" disabled onClick={() => alert("nope")}>
        Disabled
      </Chip>
    </div>
  ),
};

export const WithPopover: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Chip
        intent="primary"
        saliency="mid"
        popover={
          <Popover header={<Popover.Header title="Build #1429" subtitle="Passed in 2m 14s" />}>
            <Text size="sm">All 312 checks green. Deployed to staging.</Text>
          </Popover>
        }
      >
        Passing
      </Chip>

      <Chip
        intent="neutral"
        saliency="mid"
        popover={
          <Popover>
            <Text size="sm">Tagged by 4 people.</Text>
          </Popover>
        }
        trailAdornments={[
          <Chip.Adornment icon={<CloseGlyph />} label="Remove" onClick={() => alert("removed")} />,
        ]}
      >
        Details
      </Chip>

      <Chip
        intent="primary"
        saliency="high"
        disabled
        popover={
          <Popover>
            <Text size="sm">You won't see me.</Text>
          </Popover>
        }
      >
        Disabled
      </Chip>
    </div>
  ),
};

export const Adornments: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Chip
        intent="primary"
        saliency="mid"
        leadAdornments={[<Chip.Adornment icon={<TagGlyph />} />]}
      >
        Label
      </Chip>

      <Chip
        intent="neutral"
        saliency="mid"
        trailAdornments={[
          <Chip.Adornment icon={<CloseGlyph />} label="Remove" onClick={() => alert("removed")} />,
        ]}
      >
        Removable
      </Chip>

      <Chip
        intent="secondary"
        saliency="low"
        trailAdornments={[
          <Chip.Adornment icon={<ExternalGlyph />} label="Open docs" href="https://example.com" />,
        ]}
      >
        Docs
      </Chip>

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

export const IconShorthand: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Chip intent="primary" saliency="mid" icon={<TagGlyph />}>
        Tagged
      </Chip>

      <Chip
        intent="neutral"
        saliency="mid"
        icon={<TagGlyph />}
        leadAdornments={[<Chip.Adornment icon={<ExternalGlyph />} label="External" />]}
        handleRemove={() => alert("removed")}
      >
        Icon first
      </Chip>
    </div>
  ),
};

export const Removable: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Chip intent="neutral" saliency="mid" handleRemove={() => alert("removed")}>
        Removable
      </Chip>

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

      <Chip intent="primary" saliency="high" disabled handleRemove={() => alert("nope")}>
        Disabled
      </Chip>
    </div>
  ),
};

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

export const TrailingIcon: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Chip intent="primary" saliency="mid" icon={<TagGlyph />} trailIcon={<ExternalGlyph />}>
        Tagged
      </Chip>

      <Chip
        intent="neutral"
        saliency="mid"
        trailAdornments={[<Chip.Adornment icon={<TagGlyph />} />]}
        trailIcon={<ExternalGlyph />}
      >
        Trail last
      </Chip>
    </div>
  ),
};

export const CopyToClipboard: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Chip intent="neutral" saliency="mid" contentToCopy="npm i @saintly-software/baritone">
        npm i @saintly-software/baritone
      </Chip>

      <Chip intent="primary" saliency="mid" icon={<TagGlyph />} contentToCopy="DES-35">
        DES-35
      </Chip>
    </div>
  ),
};

export const Width: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 240 }}>
      <Chip intent="primary" saliency="mid" width="fit">
        fit — hugs content
      </Chip>
      <Chip intent="primary" saliency="mid" width="fill" trailIcon={<ExternalGlyph />}>
        fill — stretches to the container and truncates a very long label
      </Chip>
    </div>
  ),
};

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
