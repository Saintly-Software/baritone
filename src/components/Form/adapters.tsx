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
  /** The control's change-callback name — `onChange` for most, `onValueChange` for `Combobox`. */
  changeProp: "onChange" | "onValueChange";
  /** The value forwarded to the control (already coalesced where a control needs it, e.g. `?? ""`). */
  value: unknown;
  /** Bind `field.name` to the control's `name`? (Every control that accepts one; `CheckboxGroup` doesn't.) */
  bindName: boolean;
  /** Forward `handleBlur` to the control's `onBlur`? (Text-entry controls only.) */
  forwardBlur: boolean;
}

/**
 * Assemble the props a Baritone control receives from a bound TanStack field — the
 * one place the field ↔ control contract lives. Returns a plain `object` (a
 * supertype of every control's union props) that each adapter narrows with a single
 * `as <Control>Props`; see the block comment above for why the cast is needed.
 */
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
    /** The TanStack Form field bound to this input. Its value type must be `string`. */
    field: FieldLike<string>;
  };

/** Binds a `string` TanStack Form field to a {@link TextInput}. */
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
    /**
     * The TanStack Form field bound to this select. `string | null` for single,
     * `string[]` for `multiple`.
     */
    field: FieldLike<string | string[] | null>;
  };

/** Binds a `string | null` (or `string[]`, when `multiple`) field to a {@link Select}. */
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
    /** The TanStack Form field bound to this checkbox. Its value type must be `boolean`. */
    field: FieldLike<boolean>;
  };

/** Binds a `boolean` TanStack Form field to a {@link Checkbox}. */
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
    /** The TanStack Form field bound to this switch. Its value type must be `boolean`. */
    field: FieldLike<boolean>;
  };

/** Binds a `boolean` TanStack Form field to a {@link Switch}. */
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
    /** The TanStack Form field bound to this group. Its value type must be `T[]`. */
    field: FieldLike<T[]>;
  };

/**
 * Binds a `T[]` TanStack Form field to a {@link CheckboxGroup}. Use this generic
 * render-prop form (rather than the pre-bound `field.CheckboxGroup`) when you want
 * `T` inferred end-to-end — the pre-bound component erases it to `unknown`.
 */
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
    /** The TanStack Form field bound to this group. Its value type must be `T`. */
    field: FieldLike<T>;
  };

/**
 * Binds a `T` TanStack Form field to a {@link RadioGroup}. Use this generic
 * render-prop form (rather than the pre-bound `field.RadioGroup`) when you want
 * `T` inferred end-to-end — the pre-bound component erases it to `unknown`.
 */
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
    /**
     * The TanStack Form field bound to this combobox. `string | null` for single,
     * `string[]` for `multiple`.
     */
    field: FieldLike<string | string[] | null>;
  };

/** Binds a `string | null` (or `string[]`, when `multiple`) field to a {@link Combobox}. */
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
