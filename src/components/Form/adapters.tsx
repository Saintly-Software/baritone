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

// Props the binding supplies from the TanStack field, so callers can't set
// them by hand. Uses `DistributiveOmit` (never plain `Omit`) so the controls'
// label/aria-label/aria-labelledby exclusivity survives (AGENTS.md).
type Bound = "value" | "onChange" | "onBlur" | "name" | "defaultValue";

/*
 * Every adapter binds a TanStack field to a Baritone control the same way:
 * resolve validation state into `{ state, helpText }`, then hand the control
 * its `value`, change-callback, and (where relevant) `name`/`onBlur`.
 * {@link bindFieldControlProps} owns that contract in one place, so each
 * adapter stays a thin, individually-typed wrapper.
 *
 * The assembled object is cast once (`as <Control>Props`) per adapter, since
 * the value-union controls (`Select`, `Combobox`) can't be spread arm-by-arm
 * through their discriminant without one anyway.
 *
 * Change marks the field touched on its own (TanStack's `setFieldValue` sets
 * `isTouched`). `TextInput`, `Combobox`, and `Select` also forward
 * `handleBlur` so `validators.onBlur` still runs; the rest don't surface
 * `onBlur`, so validate them with `onChange`/`onSubmit` instead.
 *
 * `value` is coalesced per control (`?? false`, `?? []`, `?? null`/`?? ""`) so
 * a field missing from `defaultValues` stays controlled rather than flipping
 * uncontrolled→controlled (or, for `CheckboxGroup`, throwing on
 * `undefined.includes`).
 */

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
 * Assembles the props a Baritone control receives from a bound TanStack field.
 * Returns a plain `object` that each adapter narrows with `as <Control>Props`
 * (see the block comment above for why).
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

// ── TextInput ──────────────────────────────────────────────────────────────

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

// ── Select ─────────────────────────────────────────────────────────────────

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
    // `Select` exposes `onBlur` (extends `HTMLAttributes`) and forwards it to
    // its trigger, so forward blur like `Combobox` — this runs `validators.onBlur` too.
    forwardBlur: true,
  }) as SelectProps;
  return <Select {...controlProps} />;
}

// ── Checkbox ───────────────────────────────────────────────────────────────

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

// ── Switch ─────────────────────────────────────────────────────────────────

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

// ── CheckboxGroup ──────────────────────────────────────────────────────────

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
    // `CheckboxGroup` has no `name` — it isn't a single named control the way
    // a radio group is.
    bindName: false,
    forwardBlur: false,
  }) as CheckboxGroupProps<T>;
  return <CheckboxGroup<T> {...controlProps} />;
}

// ── RadioGroup ─────────────────────────────────────────────────────────────

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

// ── Combobox ───────────────────────────────────────────────────────────────

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
