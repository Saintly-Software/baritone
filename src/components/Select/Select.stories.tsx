import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { FORM_STATES, SIZES } from "../../theme/constants";
import { Select, type SelectOption } from "./index";

const FRUITS: SelectOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Dragonfruit", value: "dragonfruit" },
  { label: "Elderberry (out of stock)", value: "elderberry", disabled: true },
  { label: "Fig", value: "fig" },
];

const meta: Meta<typeof Select> = {
  title: "Form Controls/Select",
  component: Select,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Select>;

/** Single-select, controlled. */
export const Single: Story = {
  render: () => {
    const [value, setValue] = React.useState<string | null>(null);
    return (
      <Select
        label="Favourite fruit"
        placeholder="Pick one"
        description="Single selection."
        value={value}
        onChange={setValue}
        options={FRUITS}
      />
    );
  },
};

/** Multi-select: options render a composed checkbox; a clear button appears. */
export const Multiple: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>(["apple", "cherry"]);
    return (
      <Select
        multiple
        label="Fruit basket"
        placeholder="Pick some"
        description="Multiple selection."
        value={value}
        onChange={setValue}
        options={FRUITS}
      />
    );
  },
};

/** Every validation state, with description / error copy. */
export const States: Story = {
  render: () => {
    const [value, setValue] = React.useState<string | null>("apple");
    return (
      <div style={{ display: "grid", gap: 16 }}>
        {FORM_STATES.map((state) => (
          <Select
            key={state}
            label={`State: ${state}`}
            placeholder="Pick one"
            state={state}
            value={value}
            onChange={setValue}
            options={FRUITS}
            description={state === "warning" ? "This choice seems unusual." : undefined}
            errorMessage={state === "invalid" ? "Please choose a fruit." : undefined}
          />
        ))}
      </div>
    );
  },
};

/** Control sizes. */
export const Sizes: Story = {
  render: () => {
    const [value, setValue] = React.useState<string | null>("banana");
    return (
      <div style={{ display: "grid", gap: 16 }}>
        {SIZES.map((size) => (
          <Select
            key={size}
            label={`Size ${size}`}
            size={size}
            value={value}
            onChange={setValue}
            options={FRUITS}
          />
        ))}
      </div>
    );
  },
};

/** Busy: a spinner replaces the chevron and interaction is vetoed. */
export const Loading: Story = {
  render: () => {
    const [value, setValue] = React.useState<string | null>("cherry");
    return (
      <Select label="Loading options" loading value={value} onChange={setValue} options={FRUITS} />
    );
  },
};

/** Disabled (still focusable via `aria-disabled`). */
export const Disabled: Story = {
  render: () => {
    const [value, setValue] = React.useState<string | null>("apple");
    return (
      <Select
        label="Disabled (still focusable)"
        description="Uses aria-disabled so it stays keyboard-reachable."
        disabled
        value={value}
        onChange={setValue}
        options={FRUITS}
      />
    );
  },
};
