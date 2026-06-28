import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { ToggleGroup } from "./index";

type View = "list" | "board" | "calendar";

// ToggleGroup is controlled, so the stories drive it from local state — the same
// shape a consumer would use.
function ViewToggle(
  props: Omit<React.ComponentProps<typeof ToggleGroup<View>>, "value" | "onChange" | "children">,
) {
  const [value, setValue] = React.useState<View>("board");
  return (
    <ToggleGroup aria-label="View" value={value} onChange={setValue} {...props}>
      {({ ToggleGroupItem }) => (
        <>
          <ToggleGroupItem value="list">List</ToggleGroupItem>
          <ToggleGroupItem value="board">Board</ToggleGroupItem>
          <ToggleGroupItem value="calendar">Calendar</ToggleGroupItem>
        </>
      )}
    </ToggleGroup>
  );
}

const meta: Meta<typeof ViewToggle> = {
  title: "Form Controls/ToggleGroup",
  component: ViewToggle,
  args: {
    intent: "neutral",
    saliency: "high",
    size: "md",
    disabled: false,
  },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    saliency: { control: "inline-radio", options: SALIENCIES },
    size: { control: "inline-radio", options: SIZES },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof ViewToggle>;

export const Playground: Story = {};

export const Intents: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      {INTENTS.map((intent) => (
        <ViewToggle key={intent} intent={intent} aria-label={`View (${intent})`} />
      ))}
    </div>
  ),
};

export const Saliencies: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      {SALIENCIES.map((saliency) => (
        <ViewToggle
          key={saliency}
          intent="primary"
          saliency={saliency}
          aria-label={`View (${saliency})`}
        />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      {SIZES.map((size) => (
        <ViewToggle key={size} size={size} aria-label={`View (${size})`} />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
