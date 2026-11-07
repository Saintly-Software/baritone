import type { Meta, StoryObj } from "@storybook/react-vite";
import { Lockup } from "./index";

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
          title: { size: "md" },
          subtitle: { size: "xs" },
          icon: { size: "md" },
        }}
      />
      <Lockup
        title="Large"
        subtitle="md subtitle"
        icon={<DiamondGlyph />}
        slotProps={{
          title: { size: "xl" },
          subtitle: { size: "md" },
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

export const IconOnly: Story = {
  args: { hideText: true },
};

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
