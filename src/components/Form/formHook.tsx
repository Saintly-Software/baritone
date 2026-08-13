"use client";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import type { DistributiveOmit } from "../../utils/types";
import { Button, type ButtonProps } from "../Button";
import {
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

/**
 * The field/form contexts every Baritone-bound form shares. Exported so advanced
 * consumers can call `createFormHook` themselves — spreading
 * {@link baritoneFieldComponents} / {@link baritoneFormComponents} in alongside
 * their own components — instead of using the ready-made {@link useAppForm}.
 */
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

// Each pre-bound field component reads the field from context and delegates to the
// render-prop adapter, so `<form.AppField>{(field) => <field.TextInput label=… />}`
// needs no `value`/`onChange` wiring. The `{ ...props, field }` object is asserted
// to the adapter's union props (built once, same reasoning as the adapters).

/** Props of `field.TextInput` — {@link FormTextInputProps} minus the context-supplied `field`. */
export type TextInputFieldProps = DistributiveOmit<FormTextInputProps, "field">;
function TextInputField(props: TextInputFieldProps) {
  const field = useFieldContext<string>();
  return <FormTextInput {...({ ...props, field } as FormTextInputProps)} />;
}

/** Props of `field.Select` — {@link FormSelectProps} minus the context-supplied `field`. */
export type SelectFieldProps = DistributiveOmit<FormSelectProps, "field">;
function SelectField(props: SelectFieldProps) {
  const field = useFieldContext<string | string[] | null>();
  return <FormSelect {...({ ...props, field } as FormSelectProps)} />;
}

/** Props of `field.Checkbox` — {@link FormCheckboxProps} minus the context-supplied `field`. */
export type CheckboxFieldProps = DistributiveOmit<FormCheckboxProps, "field">;
function CheckboxField(props: CheckboxFieldProps) {
  const field = useFieldContext<boolean>();
  return <FormCheckbox {...({ ...props, field } as FormCheckboxProps)} />;
}

/** Props of `field.Switch` — {@link FormSwitchProps} minus the context-supplied `field`. */
export type SwitchFieldProps = DistributiveOmit<FormSwitchProps, "field">;
function SwitchField(props: SwitchFieldProps) {
  const field = useFieldContext<boolean>();
  return <FormSwitch {...({ ...props, field } as FormSwitchProps)} />;
}

/**
 * Props of `field.CheckboxGroup` — {@link FormCheckboxGroupProps} minus `field`.
 * The composition boundary erases the item type to `unknown`; reach for the
 * generic {@link FormCheckboxGroup} render-prop adapter when you need `T` inferred.
 */
export type CheckboxGroupFieldProps = DistributiveOmit<FormCheckboxGroupProps<unknown>, "field">;
function CheckboxGroupField(props: CheckboxGroupFieldProps) {
  const field = useFieldContext<unknown[]>();
  return (
    <FormCheckboxGroup<unknown> {...({ ...props, field } as FormCheckboxGroupProps<unknown>)} />
  );
}

/**
 * Props of `field.RadioGroup` — {@link FormRadioGroupProps} minus `field`. The
 * composition boundary erases the item type to `unknown`; reach for the generic
 * {@link FormRadioGroup} render-prop adapter when you need `T` inferred.
 */
export type RadioGroupFieldProps = DistributiveOmit<FormRadioGroupProps<unknown>, "field">;
function RadioGroupField(props: RadioGroupFieldProps) {
  const field = useFieldContext<unknown>();
  return <FormRadioGroup<unknown> {...({ ...props, field } as FormRadioGroupProps<unknown>)} />;
}

/** Props of `field.Combobox` — {@link FormComboboxProps} minus the context-supplied `field`. */
export type ComboboxFieldProps = DistributiveOmit<FormComboboxProps, "field">;
function ComboboxField(props: ComboboxFieldProps) {
  const field = useFieldContext<string | string[] | null>();
  return <FormCombobox {...({ ...props, field } as FormComboboxProps)} />;
}

/**
 * Props of `form.SubmitButton` — every {@link Button} prop except the three it
 * owns: `type` (always `"submit"`), and `loading` / `disabled`, which it drives
 * from the form's `isSubmitting` / `canSubmit`.
 */
export type SubmitButtonProps = DistributiveOmit<ButtonProps, "type" | "loading" | "disabled">;

/**
 * A form-aware submit `Button`: `type="submit"`, spinning while the form is
 * submitting and disabled while it can't submit (invalid, or already submitting).
 * Must be rendered inside `<form.AppForm>`, which provides the form context.
 */
function SubmitButton(props: SubmitButtonProps) {
  const form = useFormContext();
  return (
    <form.Subscribe
      selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
    >
      {({ canSubmit, isSubmitting }) => {
        const buttonProps = {
          ...props,
          type: "submit",
          loading: isSubmitting,
          disabled: !canSubmit,
        } as ButtonProps;
        return <Button {...buttonProps} />;
      }}
    </form.Subscribe>
  );
}

/**
 * The Baritone field components, keyed by the name they take on the `field` object
 * inside `<form.AppField>` (e.g. `field.TextInput`). Spread this into your own
 * `createFormHook({ fieldComponents: { ...baritoneFieldComponents, MyField } })`
 * to extend the set.
 */
export const baritoneFieldComponents = {
  TextInput: TextInputField,
  Select: SelectField,
  Checkbox: CheckboxField,
  Switch: SwitchField,
  CheckboxGroup: CheckboxGroupField,
  RadioGroup: RadioGroupField,
  Combobox: ComboboxField,
};

/**
 * The Baritone form components, keyed by the name they take on the form (e.g.
 * `form.SubmitButton`, rendered inside `<form.AppForm>`).
 */
export const baritoneFormComponents = {
  SubmitButton,
};

/**
 * The Baritone form hook — `useForm` with every {@link baritoneFieldComponents}
 * field component and {@link baritoneFormComponents} form component pre-registered.
 *
 * @example
 * const form = useAppForm({
 *   defaultValues: { email: "", terms: false },
 *   validators: { onChange: schema },
 *   onSubmit: async ({ value }) => save(value),
 * });
 * return (
 *   <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
 *     <form.AppField name="email">{(field) => <field.TextInput label="Email" type="email" />}</form.AppField>
 *     <form.AppField name="terms">{(field) => <field.Checkbox label="I agree" />}</form.AppField>
 *     <form.AppForm><form.SubmitButton>Sign up</form.SubmitButton></form.AppForm>
 *   </form>
 * );
 */
export const { useAppForm, withForm, withFieldGroup, useTypedAppFormContext } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: baritoneFieldComponents,
  formComponents: baritoneFormComponents,
});
