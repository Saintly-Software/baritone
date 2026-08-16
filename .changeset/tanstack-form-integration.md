---
"@saintly-software/baritone": minor
---

Add a TanStack Form integration — import it from
`@saintly-software/baritone/form`. Like `/datatable`, it ships from its own entry
point, so `@tanstack/react-form` (a new **optional** peer dependency — install it
only if you import `/form`) is reached only through this subpath; importing anything
else from the package never references it. (`@tanstack/react-table` is now marked
optional too, to match `/datatable`'s subpath contract.)

- **Composition API (the blessed surface):** `useAppForm` gives you pre-bound
  field components and a form-aware `SubmitButton`, so a field is
  `<form.AppField name="email">{(field) => <field.TextInput label="Email" />}</form.AppField>`
  with no `value` / `onChange` / error wiring by hand. Also exports `withForm`,
  `withFieldGroup`, the shared `fieldContext` / `formContext`, and
  `baritoneFieldComponents` / `baritoneFormComponents` for extending your own
  `createFormHook`.
- **Render-prop adapters (the primitive underneath):** one `Form*` per control —
  `FormTextInput`, `FormSelect`, `FormCheckbox`, `FormSwitch`, `FormCheckboxGroup`,
  `FormRadioGroup`, `FormCombobox` — binding a TanStack field to the Baritone
  control for use with the plain `form.Field` API (`<FormTextInput field={field}
label="Email" />`). Every form control that composes `Field` is covered.
- **Errors become display, automatically:** a field's validation errors map onto
  the control's `state="invalid"` + `helpText` (Baritone's one-message rule — no
  `errorMessage` prop), gated by `showErrorsWhen` (`"touched"` default, or
  `"always"`). `firstFieldErrorMessage` reads strings, `{ message }` issues
  (Standard Schema, Zod, Valibot, …), and React nodes; `hasFieldError` decides
  invalidity, so a real error with no display string still flips the control to
  `invalid` rather than leaving it neutral while `canSubmit` is `false`. The blur of
  every control that exposes one (`TextInput`, `Combobox`, `Select`) runs
  `validators.onBlur`, and each adapter coalesces a value missing from
  `defaultValues` so the control stays controlled.
- **`SubmitButton`** drives `type="submit"`, `loading` from `isSubmitting`, and
  `disabled` from `canSubmit`, so it spins while submitting and disables while the
  form can't submit.
- **`<Form form={form}>`** renders the `<form>` element itself — it prevents the
  default and calls `form.handleSubmit()` on submit, lays its children out as a
  vertical stack (it's a `Flex`, so `gap` / `direction` / `maxWidth` / spacing props
  apply), and provides the form context so `SubmitButton` needs no wrapping
  `<form.AppForm>`. Works with a plain `useForm()` too (no context, just the wired
  element).

Adapters take a structural `FieldLike<T>` rather than the concrete `FieldApi`, so a
real TanStack field is assignable _and_ a value/control mismatch (e.g. a `number`
field on a text input) is a compile error. Nothing existing moves; every other
component still imports from the package root.
