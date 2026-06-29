import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { Chip } from "../Chip";
import { Icon } from "../Icon";
import type { ChipListItem } from "./index";
import { ChipList } from "./index";

const TagGlyph = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13.2V4h9.2l8.4 8.4a1 1 0 0 1 0 1z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  </Icon>
);

const TAGS: ChipListItem[] = [
  { id: "react", children: "React" },
  { id: "typescript", children: "TypeScript" },
  { id: "vite", children: "Vite" },
  { id: "vanilla-extract", children: "vanilla-extract" },
  { id: "base-ui", children: "base-ui" },
  { id: "storybook", children: "Storybook" },
  { id: "vitest", children: "Vitest" },
];

const meta: Meta<typeof ChipList> = {
  title: "Components/ChipList",
  component: ChipList,
  args: {
    items: TAGS,
    intent: "neutral",
    saliency: "mid",
    size: "md",
    orientation: "horizontal",
  },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SALIENCIES },
    size: { control: "select", options: SIZES },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    max: { control: { type: "number", min: 1 } },
  },
};
export default meta;

type Story = StoryObj<typeof ChipList>;

export const Playground: Story = {};

export const Horizontal: Story = {
  args: { orientation: "horizontal", intent: "primary", saliency: "mid" },
};

export const Vertical: Story = {
  args: { orientation: "vertical", intent: "primary", saliency: "mid" },
};

/**
 * `size` sizes every chip (it can't be overridden per item) and also tunes the
 * gap between them — a list of `sm` chips packs tighter than a list of `lg` ones.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {SIZES.map((size) => (
        <ChipList
          key={size}
          size={size}
          intent="primary"
          saliency="high"
          items={TAGS.slice(0, 4)}
        />
      ))}
    </div>
  ),
};

/**
 * List-level `intent` / `saliency` apply to every chip, but any item can
 * override them — here two chips opt into their own intent while the rest inherit
 * the list's `neutral`.
 */
export const PerItemOverrides: Story = {
  args: {
    intent: "neutral",
    saliency: "mid",
    items: [
      { id: "stable", children: "Stable" },
      { id: "breaking", children: "Breaking", intent: "negative", saliency: "high" },
      { id: "shipped", children: "Shipped", intent: "positive" },
      { id: "deprecated", children: "Deprecated", intent: "warning" },
      { id: "internal", children: "Internal" },
    ],
  },
};

/**
 * Chips carry their full `Chip` API — adornments, a clickable label, a built-in
 * remove "×" — since each item is just a `Chip`'s props.
 */
export const RichChips: Story = {
  args: {
    intent: "primary",
    saliency: "mid",
    items: [
      {
        id: "tagged",
        children: "Tagged",
        leadAdornments: [<Chip.Adornment icon={<TagGlyph />} />],
      },
      {
        id: "clickable",
        children: "Clickable",
        onClick: () => alert("filter by tag"),
      },
      {
        id: "removable",
        children: "Removable",
        handleRemove: () => alert("removed"),
      },
    ] as ChipListItem[],
  },
};

/**
 * With `max`, only the first `max` chips show inline; the rest collapse behind a
 * trailing "See more" chip whose `Popover` lists the remainder.
 */
export const WithMax: Story = {
  args: { intent: "primary", saliency: "mid", max: 3 },
};

/** Pass a function to `seeMoreLabel` to show the hidden count instead. */
export const CustomSeeMoreLabel: Story = {
  args: {
    intent: "neutral",
    saliency: "mid",
    max: 4,
    seeMoreLabel: (remaining) => `+${remaining}`,
  },
};

export const AllIntents: Story = {
  render: () => (
    <ChipList
      saliency="mid"
      items={INTENTS.map((intent) => ({ id: intent, children: intent, intent }))}
    />
  ),
};
