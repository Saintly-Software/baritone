import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { Chip } from "../Chip";
import { Icon } from "../Icon";
import { ChipList } from "./index";

const TagGlyph = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13.2V4h9.2l8.4 8.4a1 1 0 0 1 0 1z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  </Icon>
);

const TAGS = [
  <ChipList.Item key="react">React</ChipList.Item>,
  <ChipList.Item key="typescript">TypeScript</ChipList.Item>,
  <ChipList.Item key="vite">Vite</ChipList.Item>,
  <ChipList.Item key="vanilla-extract">vanilla-extract</ChipList.Item>,
  <ChipList.Item key="base-ui">base-ui</ChipList.Item>,
  <ChipList.Item key="storybook">Storybook</ChipList.Item>,
  <ChipList.Item key="vitest">Vitest</ChipList.Item>,
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
 * override them — here two chips opt into their own intent, the rest inherit `neutral`.
 */
export const PerItemOverrides: Story = {
  args: {
    intent: "neutral",
    saliency: "mid",
    items: [
      <ChipList.Item key="stable">Stable</ChipList.Item>,
      <ChipList.Item key="breaking" intent="negative" saliency="high">
        Breaking
      </ChipList.Item>,
      <ChipList.Item key="shipped" intent="positive">
        Shipped
      </ChipList.Item>,
      <ChipList.Item key="deprecated" intent="warning">
        Deprecated
      </ChipList.Item>,
      <ChipList.Item key="internal">Internal</ChipList.Item>,
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
      <ChipList.Item
        key="tagged"
        leadAdornments={[<Chip.Adornment key="tag" icon={<TagGlyph />} />]}
      >
        Tagged
      </ChipList.Item>,
      <ChipList.Item key="clickable" onClick={() => alert("filter by tag")}>
        Clickable
      </ChipList.Item>,
      <ChipList.Item key="removable" handleRemove={() => alert("removed")}>
        Removable
      </ChipList.Item>,
    ],
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
      items={INTENTS.map((intent) => (
        <ChipList.Item key={intent} intent={intent}>
          {intent}
        </ChipList.Item>
      ))}
    />
  ),
};
