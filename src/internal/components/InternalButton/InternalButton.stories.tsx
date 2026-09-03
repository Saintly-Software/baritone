import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { InternalButton, type InternalButtonHtmlAttrs } from "./index";

/**
 * `InternalButton` is not public API — it's the engine behind `Button`, a thin
 * wrapper that forwards its props as `consumerProps`. The look and controls are
 * documented under `Components/Button`; these stories focus on the `htmlAttrs` seam.
 *
 * `htmlAttrs` is how overlay components (`Drawer`, `Modal`, `Popover`) reuse a
 * real button as their trigger/close: each base-ui `Trigger`/`Close` passes its
 * computed props (`onClick`, `aria-haspopup`, `data-*`, `ref`, …) via `render`,
 * merged onto the button — handlers chained, classes/refs joined, consumer props winning.
 */
const meta: Meta<typeof InternalButton> = {
  title: "Internal/InternalButton",
  component: InternalButton,
  parameters: {
    docs: {
      description: {
        component:
          "Internal-only implementation behind the public `Button`. Takes `consumerProps` (the public Button API) and an optional `htmlAttrs` seam for host-supplied attributes — typically the props a base-ui `Trigger`/`Close` passes via `render`. Not exported from the package.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof InternalButton>;

/** The pass-through path: just `consumerProps`, exactly as `Button` calls it. */
export const Playground: Story = {
  args: {
    consumerProps: { children: "Button", intent: "primary", saliency: "high" },
  },
};

/**
 * The `htmlAttrs` seam in action. A mock "host" supplies a toggle `onClick`
 * plus the `data-state`/`aria-expanded` a base-ui trigger would, merged onto the same button.
 */
export const WithHostAttributes: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    // Stand-in for the attribute bag a base-ui `Trigger` would compute; `data-state` is state-derived, hence the cast.
    const hostAttrs = {
      onClick: () => setOpen((v) => !v),
      "aria-haspopup": "menu",
      "aria-expanded": open,
      "data-state": open ? "open" : "closed",
    } as InternalButtonHtmlAttrs;
    return (
      <InternalButton
        consumerProps={{ children: open ? "Close menu" : "Open menu", intent: "primary" }}
        htmlAttrs={hostAttrs}
      />
    );
  },
};
