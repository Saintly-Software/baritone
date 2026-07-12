import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { useOverlayHandle } from "../../utils/overlayHandle";
import { Button } from "../Button";
import { Text } from "../Text";
import { Popover } from "./index";

const meta: Meta<typeof Popover> = {
  title: "Surfaces/Popover",
  component: Popover,
  args: {
    padding: "md",
    side: "bottom",
    align: "center",
  },
  argTypes: {
    padding: { control: "select", options: ["none", "sm", "md", "lg"] },
    side: { control: "select", options: ["top", "right", "bottom", "left"] },
    align: { control: "select", options: ["start", "center", "end"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A floating surface anchored to a trigger. Its API mirrors Card (`header` / `footer` props, `padding`); the surface is always the default neutral, low-saliency shade. Built on base-ui, so it is non-modal by default — clicking outside or pressing Escape closes it while the rest of the page stays interactive.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Popover>;

/**
 * Every region at once — a `Popover.Header` (title + subtitle), a body, and a
 * `Popover.Footer` whose `.Close` buttons dismiss the surface — all driven by
 * the toolbar controls (`padding`, `side`, `align`). Opens by default so the
 * surface is visible on load.
 */
export const KitchenSink: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Popover
      {...args}
      trigger={
        <Popover.Trigger intent="primary" saliency="high">
          Account
        </Popover.Trigger>
      }
      header={<Popover.Header title="Your account" subtitle="Signed in as ada@example.com" />}
      footer={
        <Popover.Footer>
          <Popover.Close>Cancel</Popover.Close>
          <Popover.Close intent="primary" saliency="high">
            Save
          </Popover.Close>
        </Popover.Footer>
      }
    >
      <Text render={<p />}>
        A floating surface anchored to its trigger. The header and footer are passed as props with
        the body between them; the footer buttons close the popover, as does clicking outside or
        pressing Escape.
      </Text>
    </Popover>
  ),
};

export const ImperativeClose: Story = {
  name: "Imperative close (async)",
  // Behavioural demo of the imperative-close mechanism — kept as a test, hidden
  // from the sidebar so the showcase stays focused on visual variants.
  tags: ["!dev"],
  render: (args) => {
    const popover = useOverlayHandle(Popover);
    const [saving, setSaving] = React.useState(false);
    return (
      <Popover
        {...args}
        handle={popover}
        trigger={<Popover.Trigger>Rename</Popover.Trigger>}
        header={<Popover.Header title="Rename" subtitle="Save closes it from code" />}
        footer={
          <Popover.Footer>
            <Popover.Close>Cancel</Popover.Close>
            <Button
              intent="primary"
              saliency="high"
              loading={saving}
              onClick={async () => {
                setSaving(true);
                await new Promise((resolve) => setTimeout(resolve, 900));
                setSaving(false);
                popover.close();
              }}
            >
              Save
            </Button>
          </Popover.Footer>
        }
      >
        <Text render={<p />}>
          Save runs an async action, then closes the popover with `popover.close()` — no need to
          lift `open` into component state. `useOverlayHandle(Popover)` mints the handle.
        </Text>
      </Popover>
    );
  },
};
