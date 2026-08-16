import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Form } from "./Form";
import { useAppForm } from "./formHook";

/**
 * Interaction coverage for the TanStack Form integration. The `play` drives the
 * composition API (`useAppForm` + pre-bound `field.*` components) the way a user
 * would, asserting the error → `helpText` mapping, the submit-button gating, and a
 * successful submit — so it doubles as a Storybook interaction test.
 */
const meta: Meta = {
  title: "Interaction Tests/Form",
};
export default meta;

type Story = StoryObj;

interface Values {
  email: string;
  terms: boolean;
}

function SignupForm() {
  const [submitted, setSubmitted] = React.useState<Values | null>(null);
  const form = useAppForm({
    defaultValues: { email: "", terms: false } as Values,
    onSubmit: ({ value }) => setSubmitted(value),
  });
  return (
    <Form form={form} style={{ maxWidth: 360 }}>
      <form.AppField
        name="email"
        validators={{
          onChange: ({ value }) =>
            /.+@.+\..+/.test(value) ? undefined : "Enter a valid email address",
        }}
      >
        {(field) => <field.TextInput label="Email" type="email" />}
      </form.AppField>
      <form.AppField
        name="terms"
        validators={{ onChange: ({ value }) => (value ? undefined : "Please accept the terms") }}
      >
        {(field) => <field.Checkbox label="I accept the terms" />}
      </form.AppField>
      <form.SubmitButton>Create account</form.SubmitButton>
      {submitted && <pre data-testid="result">{JSON.stringify(submitted)}</pre>}
    </Form>
  );
}

/**
 * Type an invalid email → the error surfaces as the field's `helpText` and the
 * submit button disables. Fix it, accept the terms, and submit → the form reports
 * the collected values.
 */
export const ValidatesAndSubmits: Story = {
  name: "Error mapping, gating, and submit",
  render: () => <SignupForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const email = canvas.getByLabelText("Email");
    const submit = canvas.getByRole("button", { name: "Create account" });

    // Invalid input surfaces the validator message as the field's help/error line.
    await userEvent.type(email, "not-an-email");
    await waitFor(() =>
      expect(canvas.getByText("Enter a valid email address")).toBeInTheDocument(),
    );
    expect(email).toHaveAttribute("aria-invalid", "true");
    // The form can't submit while a field is invalid.
    expect(submit).toHaveAttribute("aria-disabled", "true");

    // Fixing it clears the error and re-enables submit.
    await userEvent.clear(email);
    await userEvent.type(email, "ada@example.com");
    await waitFor(() =>
      expect(canvas.queryByText("Enter a valid email address")).not.toBeInTheDocument(),
    );

    await userEvent.click(canvas.getByRole("checkbox", { name: "I accept the terms" }));
    await userEvent.click(submit);

    await waitFor(() =>
      expect(canvas.getByTestId("result")).toHaveTextContent('"email":"ada@example.com"'),
    );
    expect(canvas.getByTestId("result")).toHaveTextContent('"terms":true');
  },
};
