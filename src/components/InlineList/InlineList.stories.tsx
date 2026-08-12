import type { Meta, StoryObj } from "@storybook/react-vite";
import { SPACE_KEYS } from "../../theme/constants";
import { Text } from "../Text";
import { InlineList } from "./index";

const meta: Meta<typeof InlineList> = {
  title: "Layout/InlineList",
  component: InlineList,
  argTypes: {
    gap: { control: "select", options: SPACE_KEYS },
    align: { control: "select", options: ["start", "center", "end", "stretch", "baseline"] },
    wrap: { control: "boolean" },
    separator: { control: "text" },
  },
};
export default meta;

type Story = StoryObj<typeof InlineList>;

export const Playground: Story = {
  args: { separator: "·", gap: "2", align: "center", wrap: true },
  render: (args) => (
    <InlineList {...args}>
      <Text>12 lines</Text>
      <Text>340 words</Text>
      <Text>Updated 2h ago</Text>
    </InlineList>
  ),
};

/**
 * The everyday use: a muted metadata line. Style the items (`size` / `saliency`)
 * and pass a matching `separator` so the dot tracks the same treatment.
 */
export const MutedMetadata: Story = {
  render: () => (
    <InlineList
      separator={
        <Text as="span" size="sm" saliency="low">
          ·
        </Text>
      }
    >
      <Text size="sm" saliency="low">
        12 lines
      </Text>
      <Text size="sm" saliency="low">
        340 words
      </Text>
      <Text size="sm" saliency="low">
        Updated 2h ago
      </Text>
    </InlineList>
  ),
};

/** Any node works as the delimiter — here a slash instead of the default dot. */
export const CustomSeparator: Story = {
  render: () => (
    <InlineList separator="/">
      <Text>Fiction</Text>
      <Text>1994</Text>
      <Text>Paperback</Text>
    </InlineList>
  ),
};

/** Pass `separator={null}` to fall back to gap-only spacing (no delimiter). */
export const NoSeparator: Story = {
  render: () => (
    <InlineList separator={null} gap="4">
      <Text>One</Text>
      <Text>Two</Text>
      <Text>Three</Text>
    </InlineList>
  ),
};

/** When the row can't fit on one line it wraps; the dots stay between items. */
export const Wrapping: Story = {
  render: () => (
    <div
      style={{
        maxWidth: 240,
        padding: 12,
        borderRadius: 8,
        outline: "1px dashed var(--baritone-color-neutral-300, #cbd5e1)",
      }}
    >
      <InlineList>
        <Text size="sm" saliency="low">
          Fiction
        </Text>
        <Text size="sm" saliency="low">
          1994
        </Text>
        <Text size="sm" saliency="low">
          Paperback
        </Text>
        <Text size="sm" saliency="low">
          320 pages
        </Text>
        <Text size="sm" saliency="low">
          English
        </Text>
        <Text size="sm" saliency="low">
          Reissue
        </Text>
      </InlineList>
    </div>
  ),
};

/**
 * Conditional items just work: a falsy child is dropped, so it never leaves a
 * dangling separator. Only the two truthy items below render (with one dot).
 */
export const ConditionalItems: Story = {
  render: () => {
    const isLyrics = true;
    const showDraft = false;
    return (
      <InlineList>
        <Text>12 lines</Text>
        {isLyrics && <Text>Words by A. Writer</Text>}
        {showDraft && <Text>Draft</Text>}
      </InlineList>
    );
  },
};
