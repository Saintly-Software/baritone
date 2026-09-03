// The TanStack Form integration. Two public layers:
//   • Composition — `useAppForm` with pre-bound field components
//     (`field.TextInput`, …) and a form-aware `SubmitButton`; a form is
//     `<form.AppField>{(field) => <field.X … />}` with no manual wiring.
//   • Adapters — one `Form*` per control, binding a TanStack field to the
//     Baritone control. Use with the plain `form.Field` API, or to build a
//     custom `createFormHook`.
//
// Re-exported through the `@saintly-software/baritone/form` subpath.

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
