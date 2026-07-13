import type { Meta, StoryObj } from "@storybook/react-vite";
import { Lockup } from "./index";

/** A simple placeholder mark drawn with `currentColor`. */
function DiamondGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
      <path d="M12 2l10 10-10 10L2 12 12 2z" />
    </svg>
  );
}

const meta: Meta<typeof Lockup> = {
  title: "Components/Lockup",
  component: Lockup,
  args: {
    title: "Baritone",
    subtitle: "Design system",
    icon: <DiamondGlyph />,
  },
};
export default meta;

type Story = StoryObj<typeof Lockup>;

export const Playground: Story = {};

export const TitleOnly: Story = {
  args: { subtitle: undefined, icon: undefined },
};

export const NoIcon: Story = {
  args: { icon: undefined },
};

export const Sized: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      <Lockup
        title="Small"
        subtitle="xs subtitle"
        icon={<DiamondGlyph />}
        slotProps={{
          title: { variant: "base" },
          subtitle: { variant: "xs" },
          icon: { size: "md" },
        }}
      />
      <Lockup
        title="Large"
        subtitle="base subtitle"
        icon={<DiamondGlyph />}
        slotProps={{
          title: { variant: "xl" },
          subtitle: { variant: "base" },
          icon: { size: "lg" },
        }}
      />
    </div>
  ),
};

export const AsHeader: Story = {
  args: {
    render: <header />,
    slotProps: { title: { render: <h1 /> } },
  },
};

export const TintedIcon: Story = {
  args: {
    slotProps: { icon: { intent: "primary", saliency: "high" } },
  },
};

/**
 * `hideText` collapses the text column visually while leaving it in the
 * accessible tree, so the lockup reads as icon-only but a screen reader still
 * announces "Baritone — Design system".
 */
export const IconOnly: Story = {
  args: { hideText: true },
};

/**
 * `slotProps.title.level` switches the title from a `Text` to a semantic
 * `Heading` (here an `<h2>`) for the document outline, without changing how it
 * looks. Compare with the default text title above it.
 */
export const HeadingTitleVsTextTitle: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      <Lockup title="Text title" subtitle="renders as a <div>" icon={<DiamondGlyph />} />
      <Lockup
        title="Heading title"
        subtitle="renders as an <h2>"
        icon={<DiamondGlyph />}
        slotProps={{ title: { level: 2 } }}
      />
    </div>
  ),
};

/**
 * `slots` replaces a slot's content entirely with a ReactNode, bypassing the
 * primitive the lockup would otherwise build.
 */
export const SlotOverrides: Story = {
  args: {
    slots: {
      title: (
        <span style={{ fontWeight: 700 }}>
          Bari<span style={{ opacity: 0.6 }}>tone</span>
        </span>
      ),
      subtitle: <em>custom subtitle node</em>,
    },
  },
};
