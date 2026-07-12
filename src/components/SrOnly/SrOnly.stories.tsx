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

export const Basic: Story = {
  args: { children: "This text is only announced to screen readers." },
  render: (args) => (
    <p>
      There is a visually-hidden message right here →<SrOnly {...args} />← between the arrows.
      Inspect the DOM (or use a screen reader) to find it.
    </p>
  ),
};
