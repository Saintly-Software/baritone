// The TanStack Form integration. Two layers, both public:
//
//   • Composition (the blessed surface) — `useAppForm` with pre-bound field
//     components (`field.TextInput`, `field.Select`, …) and a form-aware
//     `SubmitButton`, so a form is `<form.AppField>{(field) => <field.X … />}`
//     with no `value`/`onChange`/error wiring by hand.
//   • Adapters (the primitive underneath) — one `Form*` per control, each binding
//     a TanStack field to the Baritone control. Use these directly with the plain
//     `form.Field` render-prop API, or to build your own `createFormHook`.
//
// Everything re-exports through the `@saintly-software/baritone/form` subpath.

export {
  FormCheckbox,
  type FormCheckboxProps,
  FormCheckboxGroup,
  type FormCheckboxGroupProps,
  FormCombobox,
  type FormComboboxProps,
  FormRadioGroup,
  type FormRadioGroupProps,
  FormSelect,
  type FormSelectProps,
  FormSwitch,
  type FormSwitchProps,
  FormTextInput,
  type FormTextInputProps,
} from "./adapters";
export {
  type FieldDisplay,
  type FieldErrorSource,
  type FieldLike,
  firstFieldErrorMessage,
  type FormFieldExtras,
  hasFieldError,
  resolveFieldDisplay,
  type ShowErrorsWhen,
} from "./fieldError";
export { Form, type FormApiLike, type FormProps } from "./Form";
export {
  baritoneFieldComponents,
  baritoneFormComponents,
  type CheckboxFieldProps,
  type CheckboxGroupFieldProps,
  type ComboboxFieldProps,
  fieldContext,
  formContext,
  type RadioGroupFieldProps,
  type SelectFieldProps,
  type SubmitButtonProps,
  type SwitchFieldProps,
  type TextInputFieldProps,
  useAppForm,
  useFieldContext,
  useFormContext,
  useTypedAppFormContext,
  withFieldGroup,
  withForm,
} from "./formHook";
