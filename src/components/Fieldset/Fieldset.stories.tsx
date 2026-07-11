import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Switch } from "../Switch";
import { TextInput } from "../TextInput";
import { Fieldset, FieldsetLegend } from "./index";

const meta: Meta<typeof Fieldset> = {
  title: "Form Controls/Fieldset",
  component: Fieldset,
  args: {
    disabled: false,
  },
  argTypes: {
    disabled: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Fieldset>;

// A small controlled form so the stories exercise the fields the way a consumer
// would. Toggle the fieldset's `disabled` control to watch every nested control
// go inert (but stay focusable) in one move.
function ContactFields() {
  const [street, setStreet] = React.useState("");
  const [city, setCity] = React.useState("");
  const [sms, setSms] = React.useState(true);
  const [agreed, setAgreed] = React.useState(false);
  return (
    <>
      <TextInput label="Street" value={street} onChange={(e) => setStreet(e.target.value)} />
      <TextInput label="City" value={city} onChange={(e) => setCity(e.target.value)} />
      <Switch label="Text me shipping updates" value={sms} onChange={setSms} />
      <Checkbox label="Save this address" value={agreed} onChange={setAgreed} />
    </>
  );
}

/** Toggle `disabled` in the controls panel to disable the whole group at once. */
export const Playground: Story = {
  render: (args) => (
    <Fieldset {...args}>
      <FieldsetLegend>Shipping address</FieldsetLegend>
      <ContactFields />
    </Fieldset>
  ),
};

/** Enabled and disabled side by side — every nested control follows the group. */
export const DisabledPropagation: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 32 }}>
      <Fieldset>
        <FieldsetLegend>Enabled group</FieldsetLegend>
        <ContactFields />
        <Button intent="primary">Save</Button>
      </Fieldset>
      <Fieldset disabled>
        <FieldsetLegend>Disabled group</FieldsetLegend>
        <ContactFields />
        <Button intent="primary">Save</Button>
      </Fieldset>
    </div>
  ),
};

/**
 * Nesting composes: the outer fieldset is disabled, so its controls stay
 * disabled even though the inner fieldset isn't itself disabled. An inner
 * fieldset can add to, but never undo, an outer's disabled state.
 */
export const Nested: Story = {
  render: () => (
    <Fieldset disabled>
      <FieldsetLegend>Account (locked)</FieldsetLegend>
      <TextInput label="Email" defaultValue="ada@example.com" />
      <Fieldset>
        <FieldsetLegend>Notifications</FieldsetLegend>
        <Switch label="Product updates" value onChange={() => {}} />
      </Fieldset>
    </Fieldset>
  ),
};

/**
 * Label the group with an existing element via `aria-labelledby` instead of a
 * `FieldsetLegend`.
 */
export const ExternalLabel: Story = {
  render: () => (
    <>
      <h3 id="prefs-heading">Preferences</h3>
      <Fieldset aria-labelledby="prefs-heading">
        <Switch label="Dark mode" value onChange={() => {}} />
        <Switch label="Reduced motion" value={false} onChange={() => {}} />
      </Fieldset>
    </>
  ),
};
