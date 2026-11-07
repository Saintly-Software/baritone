import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { InternalButton, type InternalButtonHtmlAttrs } from "./index";

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

export const Playground: Story = {
  args: {
    consumerProps: { children: "Button", intent: "primary", saliency: "high" },
  },
};

export const WithHostAttributes: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
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
