import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { Icon } from "../Icon";
import { ButtonGroup } from "./index";

// Throwaway glyphs so the icon stories have something to render.
const ChevronLeft = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  </Icon>
);
const ChevronRight = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  </Icon>
);

const meta: Meta<typeof ButtonGroup> = {
  title: "Components/ButtonGroup",
  component: ButtonGroup,
  args: {
    intent: "neutral",
    saliency: "mid",
    size: "md",
  },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SALIENCIES },
    size: { control: "select", options: SIZES },
  },
};
export default meta;

type Story = StoryObj<typeof ButtonGroup>;

export const Playground: Story = {
  args: {
    items: [
      <ButtonGroup.Item key="left">Left</ButtonGroup.Item>,
      <ButtonGroup.Item key="center">Center</ButtonGroup.Item>,
      <ButtonGroup.Item key="right">Right</ButtonGroup.Item>,
    ],
  },
};

export const TwoButtons: Story = {
  args: {
    items: [
      <ButtonGroup.Item key="prev" startIcon={<ChevronLeft />}>
        Previous
      </ButtonGroup.Item>,
      <ButtonGroup.Item key="next" endIcon={<ChevronRight />}>
        Next
      </ButtonGroup.Item>,
    ],
  },
};

export const FourButtons: Story = {
  args: {
    intent: "primary",
    saliency: "high",
    items: [
      <ButtonGroup.Item key="1">One</ButtonGroup.Item>,
      <ButtonGroup.Item key="2">Two</ButtonGroup.Item>,
      <ButtonGroup.Item key="3">Three</ButtonGroup.Item>,
      <ButtonGroup.Item key="4">Four</ButtonGroup.Item>,
    ],
  },
};

export const MixedIntents: Story = {
  args: {
    intent: "neutral",
    saliency: "low",
    items: [
      <ButtonGroup.Item key="save" intent="primary" saliency="high">
        Save
      </ButtonGroup.Item>,
      <ButtonGroup.Item key="draft">Save draft</ButtonGroup.Item>,
      <ButtonGroup.Item key="discard" intent="negative" saliency="high">
        Discard
      </ButtonGroup.Item>,
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Each member can override the group's `intent`/`saliency` while still sharing the joined surface and a single `size`.",
      },
    },
  },
};

export const WithIcons: Story = {
  args: {
    intent: "primary",
    saliency: "high",
    items: [
      <ButtonGroup.Item key="prev" startIcon={<ChevronLeft />}>
        Prev
      </ButtonGroup.Item>,
      <ButtonGroup.Item key="today">Today</ButtonGroup.Item>,
      <ButtonGroup.Item key="next" endIcon={<ChevronRight />}>
        Next
      </ButtonGroup.Item>,
    ],
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
      {SIZES.map((size) => (
        <ButtonGroup
          key={size}
          size={size}
          intent="primary"
          saliency="high"
          items={[
            <ButtonGroup.Item key="a">First</ButtonGroup.Item>,
            <ButtonGroup.Item key="b">Second</ButtonGroup.Item>,
            <ButtonGroup.Item key="c">Third</ButtonGroup.Item>,
          ]}
        />
      ))}
    </div>
  ),
};

export const WithDisabledMember: Story = {
  args: {
    intent: "neutral",
    saliency: "mid",
    items: [
      <ButtonGroup.Item key="cut">Cut</ButtonGroup.Item>,
      <ButtonGroup.Item key="copy">Copy</ButtonGroup.Item>,
      <ButtonGroup.Item key="paste" disabled disabledReason="Clipboard is empty.">
        Paste
      </ButtonGroup.Item>,
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "A disabled member uses `aria-disabled`, so it stays focusable and can surface its `disabledReason` tooltip.",
      },
    },
  },
};
