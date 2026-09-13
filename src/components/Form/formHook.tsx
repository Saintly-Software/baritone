"use client";
import { createFormHook, createFormHookContexts, useSelector } from "@tanstack/react-form";
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

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export type TextInputFieldProps = DistributiveOmit<FormTextInputProps, "field">;
function TextInputField(props: TextInputFieldProps) {
  const field = useFieldContext<string>();
  return <FormTextInput {...({ ...props, field } as FormTextInputProps)} />;
}

export type SelectFieldProps = DistributiveOmit<FormSelectProps, "field">;
function SelectField(props: SelectFieldProps) {
  const field = useFieldContext<string | string[] | null>();
  return <FormSelect {...({ ...props, field } as FormSelectProps)} />;
}

export type CheckboxFieldProps = DistributiveOmit<FormCheckboxProps, "field">;
function CheckboxField(props: CheckboxFieldProps) {
  const field = useFieldContext<boolean>();
  return <FormCheckbox {...({ ...props, field } as FormCheckboxProps)} />;
}

export type SwitchFieldProps = DistributiveOmit<FormSwitchProps, "field">;
function SwitchField(props: SwitchFieldProps) {
  const field = useFieldContext<boolean>();
  return <FormSwitch {...({ ...props, field } as FormSwitchProps)} />;
}

export type CheckboxGroupFieldProps = DistributiveOmit<FormCheckboxGroupProps<unknown>, "field">;
function CheckboxGroupField(props: CheckboxGroupFieldProps) {
  const field = useFieldContext<unknown[]>();
  return (
    <FormCheckboxGroup<unknown> {...({ ...props, field } as FormCheckboxGroupProps<unknown>)} />
  );
}

export type RadioGroupFieldProps = DistributiveOmit<FormRadioGroupProps<unknown>, "field">;
function RadioGroupField(props: RadioGroupFieldProps) {
  const field = useFieldContext<unknown>();
  return <FormRadioGroup<unknown> {...({ ...props, field } as FormRadioGroupProps<unknown>)} />;
}

export type ComboboxFieldProps = DistributiveOmit<FormComboboxProps, "field">;
function ComboboxField(props: ComboboxFieldProps) {
  const field = useFieldContext<string | string[] | null>();
  return <FormCombobox {...({ ...props, field } as FormComboboxProps)} />;
}

export type SubmitButtonProps = DistributiveOmit<ButtonProps, "type" | "loading" | "disabled">;

function SubmitButton(props: SubmitButtonProps) {
  const form = useFormContext();
  const { canSubmit, isSubmitting } = useSelector(
    form.store,
    (state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting }),
    { compare: (a, b) => a.canSubmit === b.canSubmit && a.isSubmitting === b.isSubmitting },
  );
  const buttonProps = {
    ...props,
    type: "submit",
    loading: isSubmitting,
    disabled: !canSubmit,
  } as ButtonProps;
  return <Button {...buttonProps} />;
}

export const baritoneFieldComponents = {
  TextInput: TextInputField,
  Select: SelectField,
  Checkbox: CheckboxField,
  Switch: SwitchField,
  CheckboxGroup: CheckboxGroupField,
  RadioGroup: RadioGroupField,
  Combobox: ComboboxField,
};

export const baritoneFormComponents = {
  SubmitButton,
};

export const { useAppForm, withForm, withFieldGroup, useTypedAppFormContext } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: baritoneFieldComponents,
  formComponents: baritoneFormComponents,
});
