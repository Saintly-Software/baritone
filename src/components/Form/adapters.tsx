"use client";
import type { ReactNode } from "react";
import type { FormState } from "../../theme/constants";
import type { DistributiveOmit } from "../../utils/types";
import { Checkbox, type CheckboxProps } from "../Checkbox";
import { CheckboxGroup, type CheckboxGroupProps } from "../CheckboxGroup";
import { Combobox, type ComboboxProps } from "../Combobox";
import { RadioGroup, type RadioGroupProps } from "../RadioGroup";
import { Select, type SelectProps } from "../Select";
import { Switch, type SwitchProps } from "../Switch";
import { TextInput, type TextInputProps } from "../TextInput";
import { type FieldLike, type FormFieldExtras, resolveFieldDisplay } from "./fieldError";

type Bound = "value" | "onChange" | "onBlur" | "name" | "defaultValue";

interface FieldBinding extends FormFieldExtras {
  helpText?: ReactNode;
  state?: FormState;

  changeProp: "onChange" | "onValueChange";

  value: unknown;

  bindName: boolean;

  forwardBlur: boolean;
}

function bindFieldControlProps<TValue>(
  field: FieldLike<TValue>,
  rest: object,
  binding: FieldBinding,
): object {
  const { showErrorsWhen, helpText, state, changeProp, value, bindName, forwardBlur } = binding;
  const display = resolveFieldDisplay(field, { showErrorsWhen, helpText, state });
  return {
    ...rest,
    ...(bindName ? { name: field.name } : null),
    value,
    [changeProp]: (next: TValue) => field.handleChange(next),
    ...(forwardBlur ? { onBlur: () => field.handleBlur() } : null),
    ...display,
  };
}

export type FormTextInputProps = DistributiveOmit<TextInputProps, Bound> &
  FormFieldExtras & {
    field: FieldLike<string>;
  };

export function FormTextInput(props: FormTextInputProps) {
  const { field, showErrorsWhen, helpText, state, ...rest } = props;
  const controlProps = bindFieldControlProps(field, rest, {
    showErrorsWhen,
    helpText,
    state,
    changeProp: "onChange",
    value: field.state.value ?? "",
    bindName: true,
    forwardBlur: true,
  }) as TextInputProps;
  return <TextInput {...controlProps} />;
}

export type FormSelectProps = DistributiveOmit<SelectProps, Bound> &
  FormFieldExtras & {
    field: FieldLike<string | string[] | null>;
  };

export function FormSelect(props: FormSelectProps) {
  const { field, showErrorsWhen, helpText, state, ...rest } = props;
  const controlProps = bindFieldControlProps(field, rest, {
    showErrorsWhen,
    helpText,
    state,
    changeProp: "onChange",
    value: field.state.value ?? null,
    bindName: true,
    forwardBlur: true,
  }) as SelectProps;
  return <Select {...controlProps} />;
}

export type FormCheckboxProps = DistributiveOmit<CheckboxProps, Bound> &
  FormFieldExtras & {
    field: FieldLike<boolean>;
  };

export function FormCheckbox(props: FormCheckboxProps) {
  const { field, showErrorsWhen, helpText, state, ...rest } = props;
  const controlProps = bindFieldControlProps(field, rest, {
    showErrorsWhen,
    helpText,
    state,
    changeProp: "onChange",
    value: field.state.value ?? false,
    bindName: true,
    forwardBlur: false,
  }) as CheckboxProps;
  return <Checkbox {...controlProps} />;
}

export type FormSwitchProps = DistributiveOmit<SwitchProps, Bound> &
  FormFieldExtras & {
    field: FieldLike<boolean>;
  };

export function FormSwitch(props: FormSwitchProps) {
  const { field, showErrorsWhen, helpText, state, ...rest } = props;
  const controlProps = bindFieldControlProps(field, rest, {
    showErrorsWhen,
    helpText,
    state,
    changeProp: "onChange",
    value: field.state.value ?? false,
    bindName: true,
    forwardBlur: false,
  }) as SwitchProps;
  return <Switch {...controlProps} />;
}

export type FormCheckboxGroupProps<T> = DistributiveOmit<
  CheckboxGroupProps<T>,
  "value" | "onChange"
> &
  FormFieldExtras & {
    field: FieldLike<T[]>;
  };

export function FormCheckboxGroup<T>(props: FormCheckboxGroupProps<T>) {
  const { field, showErrorsWhen, helpText, state, ...rest } = props;
  const controlProps = bindFieldControlProps(field, rest, {
    showErrorsWhen,
    helpText,
    state,
    changeProp: "onChange",
    value: field.state.value ?? [],
    bindName: false,
    forwardBlur: false,
  }) as CheckboxGroupProps<T>;
  return <CheckboxGroup<T> {...controlProps} />;
}

export type FormRadioGroupProps<T> = DistributiveOmit<
  RadioGroupProps<T>,
  "value" | "onChange" | "name"
> &
  FormFieldExtras & {
    field: FieldLike<T>;
  };

export function FormRadioGroup<T>(props: FormRadioGroupProps<T>) {
  const { field, showErrorsWhen, helpText, state, ...rest } = props;
  const controlProps = bindFieldControlProps(field, rest, {
    showErrorsWhen,
    helpText,
    state,
    changeProp: "onChange",
    value: field.state.value ?? null,
    bindName: true,
    forwardBlur: false,
  }) as RadioGroupProps<T>;
  return <RadioGroup<T> {...controlProps} />;
}

export type FormComboboxProps = DistributiveOmit<ComboboxProps, Bound | "onValueChange"> &
  FormFieldExtras & {
    field: FieldLike<string | string[] | null>;
  };

export function FormCombobox(props: FormComboboxProps) {
  const { field, showErrorsWhen, helpText, state, ...rest } = props;
  const controlProps = bindFieldControlProps(field, rest, {
    showErrorsWhen,
    helpText,
    state,
    changeProp: "onValueChange",
    value: field.state.value ?? null,
    bindName: true,
    forwardBlur: true,
  }) as ComboboxProps;
  return <Combobox {...controlProps} />;
}
