---
"@saintly-software/baritone": minor
---

Add a TanStack Form integration — import it from
`@saintly-software/baritone/form`. Like `/datatable`, it ships from its own entry
point, so `@tanstack/react-form` (a new, required peer dependency) is reached only
through this subpath; importing anything else from the package never references it.

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
  (Standard Schema, Zod, Valibot, …), and React nodes.
- **`SubmitButton`** drives `type="submit"`, `loading` from `isSubmitting`, and
  `disabled` from `canSubmit`, so it spins while submitting and disables while the
  form can't submit.

Adapters take a structural `FieldLike<T>` rather than the concrete `FieldApi`, so a
real TanStack field is assignable _and_ a value/control mismatch (e.g. a `number`
field on a text input) is a compile error. Nothing existing moves; every other
component still imports from the package root.
