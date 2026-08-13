import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "@tanstack/react-form";
import * as React from "react";
import { FormTextInput } from "./adapters";
import { useAppForm } from "./formHook";

/**
 * The TanStack Form integration (`@saintly-software/baritone/form`). The blessed
 * surface is the composition API: `useAppForm` gives you pre-bound field
 * components (`field.TextInput`, `field.Select`, …) and a form-aware
 * `SubmitButton`, so validation errors map to `state="invalid"` + `helpText`
 * automatically. The render-prop adapters (`FormTextInput`, …) are the primitive
 * underneath, for use with the plain `form.Field` API.
 */
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
    <form
      noValidate
      style={{ display: "grid", gap: 20, maxWidth: 360 }}
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
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

      <form.AppForm>
        <form.SubmitButton>Create account</form.SubmitButton>
      </form.AppForm>

      {submitted && (
        <pre data-testid="result" style={{ margin: 0, fontSize: 12 }}>
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </form>
  );
}

/**
 * The composition API end to end — `useAppForm` with pre-bound `field.*`
 * components. Each field validates on change; the error replaces its `helpText`
 * and the control turns invalid once the field is touched. `SubmitButton` stays
 * disabled while the form can't submit.
 */
export const AppForm: Story = {
  render: () => <SignupForm />,
};

/**
 * The primitive underneath: a `FormTextInput` adapter bound to a plain
 * `form.Field` (from `useForm`), for consumers who don't want the `createFormHook`
 * composition layer. Same automatic error → `helpText` mapping.
 */
export const RenderPropAdapter: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- render is a component body
    const form = useForm({
      defaultValues: { name: "" },
      onSubmit: () => {},
    });
    return (
      <form style={{ maxWidth: 360 }}>
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => (value.length >= 2 ? undefined : "At least 2 characters"),
          }}
        >
          {(field) => <FormTextInput field={field} label="Full name" placeholder="Ada Lovelace" />}
        </form.Field>
      </form>
    );
  },
};
