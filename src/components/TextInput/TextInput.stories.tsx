import type { Meta, StoryObj } from "@storybook/react-vite";
import { FORM_STATES, SIZES } from "../../theme/constants";
import { TextInput } from "./index";

const meta: Meta<typeof TextInput> = {
  title: "Form Controls/TextInput",
  component: TextInput,
  args: {
    label: "Email",
    placeholder: "you@example.com",
    state: "neutral",
    size: "md",
  },
  argTypes: {
    state: { control: "select", options: FORM_STATES },
    size: { control: "select", options: SIZES },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof TextInput>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {FORM_STATES.map((state) => (
        <TextInput
          key={state}
          label={`State: ${state}`}
          placeholder="Type here"
          state={state}
          description={state === "warning" ? "This value seems unusual." : undefined}
          errorMessage={state === "invalid" ? "This field is required." : undefined}
          defaultValue={state === "valid" ? "looks good" : undefined}
        />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {SIZES.map((size) => (
        <TextInput key={size} label={`Size ${size}`} size={size} placeholder={size} />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    label: "Disabled (still focusable)",
    disabled: true,
    description: "Uses aria-disabled so it stays keyboard-reachable.",
    defaultValue: "cannot edit",
  },
};
