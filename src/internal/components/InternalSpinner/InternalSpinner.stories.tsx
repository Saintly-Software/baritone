import type { Meta, StoryObj } from "@storybook/react-vite";
import { InternalSpinner } from "./index";

/**
 * `InternalSpinner` is not part of the public API — it's the shared pure-CSS ring
 * spinner the system's `loading` states compose from (`Button`, `Chip`,
 * `Drawer`, `Modal`). It's sized in `em` and drawn in `currentColor`, so it
 * inherits font-size and colour from wherever it's placed; positioning is the
 * host's job. `size` picks the ring footprint (`sm` for inline controls, `lg`
 * for overlay surfaces).
 */
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

/** `sm` (inline controls) and `lg` (overlay surfaces), at a shared font-size. */
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

/** It tracks font-size (`em`) and colour (`currentColor`) from its surroundings. */
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
