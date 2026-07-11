import type { Meta, StoryObj } from "@storybook/react-vite";
import { SrOnly } from "./index";

const meta: Meta<typeof SrOnly> = {
  title: "Utilities/SrOnly",
  component: SrOnly,
  parameters: {
    docs: {
      description: {
        component:
          "Visually-hidden text that stays in the accessibility tree. Content is announced by screen readers but takes up no visible space (clip/rect technique, not `display: none`).",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof SrOnly>;

export const Playground: Story = {
  args: { children: "This text is only announced to screen readers." },
  render: (args) => (
    <p>
      There is a visually-hidden message right here →<SrOnly {...args} />← between the arrows.
      Inspect the DOM (or use a screen reader) to find it.
    </p>
  ),
};

/** Give an icon-only control an accessible name without any visible label. */
export const IconOnlyButtonLabel: Story = {
  render: () => (
    <button type="button" style={{ fontSize: 20, padding: "4px 10px" }}>
      <span aria-hidden>×</span>
      <SrOnly>Close dialog</SrOnly>
    </button>
  ),
};

/** Add context to a repeated, visually-terse link. */
export const LinkContext: Story = {
  render: () => (
    <a href="#pricing">
      Read more
      <SrOnly> about our pricing plans</SrOnly>
    </a>
  ),
};

/** A polite live region for status updates that shouldn't shift the layout. */
export const LiveStatus: Story = {
  render: () => (
    <SrOnly role="status" aria-live="polite">
      Your changes have been saved.
    </SrOnly>
  ),
};
