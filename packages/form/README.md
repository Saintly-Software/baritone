# @saintly-software/baritone-form

[TanStack Form](https://tanstack.com/form) bindings for the
[Baritone](https://github.com/Saintly-Software/baritone/tree/main/packages/baritone) form controls.

```sh
pnpm add @saintly-software/baritone-form @saintly-software/baritone @tanstack/react-form
```

This package maps a field's validation errors onto the control's
`state="invalid"` + `helpText` for you. The blessed surface is the composition
API — `useAppForm` with pre-bound field components and a form-aware `SubmitButton`:

```tsx
import { Form, useAppForm } from "@saintly-software/baritone-form";

function SignUp() {
  const form = useAppForm({
    defaultValues: { email: "", terms: false },
    onSubmit: ({ value }) => save(value),
  });
  return (
    <Form form={form}>
      <form.AppField
        name="email"
        validators={{
          onChange: ({ value }) => (value.includes("@") ? undefined : "Enter a valid email"),
        }}
      >
        {(field) => <field.TextInput label="Email" type="email" />}
      </form.AppField>
      <form.AppField name="terms">{(field) => <field.Checkbox label="I agree" />}</form.AppField>
      <form.SubmitButton>Sign up</form.SubmitButton>
    </Form>
  );
}
```

`<Form form={form}>` renders the `<form>` element for you: it prevents the default
and calls `form.handleSubmit()` on submit, lays its children out as a vertical stack
(it's a `Flex`, so `gap` / `direction` / `maxWidth` / spacing props apply), and
provides the form context so `SubmitButton` needs no wrapping `<form.AppForm>`. You
can still render a raw `<form>` and wire `handleSubmit` by hand if you prefer.

Prefer the plain `form.Field` API? The render-prop adapters (`FormTextInput`,
`FormSelect`, …) bind a field to a control directly: `<FormTextInput field={field}
label="Email" />`.
