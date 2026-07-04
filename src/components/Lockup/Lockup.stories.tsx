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
  title: "Typography/Lockup",
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
