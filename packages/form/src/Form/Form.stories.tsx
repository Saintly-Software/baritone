import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "@tanstack/react-form";
import * as React from "react";
import { FormTextInput } from "./adapters";
import { Form } from "./Form";
import { useAppForm } from "./formHook";

const meta: Meta = {
  title: "Components/Form",
};
export default meta;

type Story = StoryObj;

interface SignupValues {
  email: string;
  plan: string;
  billing: string;
  terms: boolean;
}

const plans = [
  { label: "Free", value: "free" },
  { label: "Pro", value: "pro" },
  { label: "Enterprise", value: "enterprise" },
];

const isEmail = ({ value }: { value: string }) =>
  /.+@.+\..+/.test(value) ? undefined : "Enter a valid email address";

function SignupForm() {
  const [submitted, setSubmitted] = React.useState<SignupValues | null>(null);
  const form = useAppForm({
    defaultValues: { email: "", plan: "free", billing: "monthly", terms: false } as SignupValues,
    onSubmit: ({ value }) => setSubmitted(value),
  });

  return (
    <Form form={form} gap="6" style={{ maxWidth: 360 }}>
      <form.AppField name="email" validators={{ onChange: isEmail }}>
        {(field) => (
          <field.TextInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            helpText="We'll only use it to sign you in."
          />
        )}
      </form.AppField>

      <form.AppField name="plan">
        {(field) => <field.Select label="Plan" options={plans} />}
      </form.AppField>

      <form.AppField name="billing">
        {(field) => (
          <field.RadioGroup label="Billing" orientation="horizontal">
            {({ RadioGroupItem }) => (
              <>
                <RadioGroupItem value="monthly">Monthly</RadioGroupItem>
                <RadioGroupItem value="yearly">Yearly</RadioGroupItem>
              </>
            )}
          </field.RadioGroup>
        )}
      </form.AppField>

      <form.AppField
        name="terms"
        validators={{ onChange: ({ value }) => (value ? undefined : "Please accept the terms") }}
      >
        {(field) => <field.Checkbox label="I accept the terms of service" />}
      </form.AppField>

      <form.SubmitButton>Create account</form.SubmitButton>

      {submitted && (
        <pre data-testid="result" style={{ margin: 0, fontSize: 12 }}>
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </Form>
  );
}

export const AppForm: Story = {
  render: () => <SignupForm />,
};

export const RenderPropAdapter: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- render is a component body
    const form = useForm({
      defaultValues: { name: "" },
      onSubmit: () => {},
    });
    return (
      <Form form={form} style={{ maxWidth: 360 }}>
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => (value.length >= 2 ? undefined : "At least 2 characters"),
          }}
        >
          {(field) => <FormTextInput field={field} label="Full name" placeholder="Ada Lovelace" />}
        </form.Field>
      </Form>
    );
  },
};
