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

function ContactFields() {
  const [street, setStreet] = React.useState("");
  const [city, setCity] = React.useState("");
  const [sms, setSms] = React.useState(true);
  const [agreed, setAgreed] = React.useState(false);
  return (
    <>
      <TextInput label="Street" value={street} onChange={setStreet} />
      <TextInput label="City" value={city} onChange={setCity} />
      <Switch label="Text me shipping updates" value={sms} onChange={setSms} />
      <Checkbox label="Save this address" value={agreed} onChange={setAgreed} />
    </>
  );
}

export const Playground: Story = {
  render: (args) => (
    <Fieldset {...args}>
      <FieldsetLegend>Shipping address</FieldsetLegend>
      <ContactFields />
    </Fieldset>
  ),
};

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
