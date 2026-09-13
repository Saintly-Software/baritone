import type { Meta, StoryObj } from "@storybook/react-vite";
import { InternalSpinner } from "./index";

const meta: Meta<typeof InternalSpinner> = {
  title: "Internal/InternalSpinner",
  component: InternalSpinner,
  parameters: {
    docs: {
      description: {
        component:
          "Internal-only ring spinner. A single rotating ring sized in `em` (tracks the host's font-size) and drawn in `currentColor` (tracks the resolved foreground). Decorative by design — it renders `aria-hidden`, leaving the busy state (`aria-busy`) and accessible name to the host.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof InternalSpinner>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 32, alignItems: "center", fontSize: 24 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <InternalSpinner size="sm" />
        <span>sm</span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <InternalSpinner size="lg" />
        <span>lg</span>
      </div>
    </div>
  ),
};

export const InheritsSizeAndColour: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
      <span style={{ fontSize: 16 }}>
        <InternalSpinner />
      </span>
      <span style={{ fontSize: 32 }}>
        <InternalSpinner />
      </span>
      <span style={{ fontSize: 48, color: "rebeccapurple" }}>
        <InternalSpinner />
      </span>
    </div>
  ),
};
