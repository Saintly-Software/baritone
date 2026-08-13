"use client";
import type { DistributiveOmit } from "../../utils/types";
import { Checkbox, type CheckboxProps } from "../Checkbox";
import { CheckboxGroup, type CheckboxGroupProps } from "../CheckboxGroup";
import { Combobox, type ComboboxProps } from "../Combobox";
import { RadioGroup, type RadioGroupProps } from "../RadioGroup";
import { Select, type SelectProps } from "../Select";
import { Switch, type SwitchProps } from "../Switch";
import { TextInput, type TextInputProps } from "../TextInput";
import { type FieldLike, type FormFieldExtras, resolveFieldDisplay } from "./fieldError";

// The control props a field owns, so callers can't set them by hand — the binding
// supplies `value`/`onChange`/`onBlur`/`name` from the TanStack field. Removed with
// `DistributiveOmit` (never plain `Omit`) so the controls' `label` / `aria-label` /
// `aria-labelledby` exclusivity survives — see AGENTS.md and `src/utils/types.ts`.
type Bound = "value" | "onChange" | "onBlur" | "name" | "defaultValue";

/*
 * Each adapter assembles the underlying control's props and casts the assembled
 * object once (`as <Control>Props`). Every control's props are a union (they
 * intersect the three-arm `FieldLabellingProps`), and the value-union controls
 * (`Select`, `Combobox`) can't be spread arm-by-arm through their discriminant
 * without a cast anyway — the components themselves widen internally for the same
 * reason — so a single assertion per adapter keeps the wiring uniform.
 *
 * Change marks the field touched on its own (TanStack's `setFieldValue` sets
 * `isTouched`), so no adapter has to touch it manually. `TextInput` and `Combobox`
 * additionally forward `handleBlur` to `onBlur` — the one case change misses is
 * focusing a field and leaving it *without* typing (a required field the user
 * skipped); the blur then marks it touched so its error can surface.
 */

// ── TextInput ──────────────────────────────────────────────────────────────

export type FormTextInputProps = DistributiveOmit<TextInputProps, Bound> &
  FormFieldExtras & {
    /** The TanStack Form field bound to this input. Its value type must be `string`. */
    field: FieldLike<string>;
  };

/** Binds a `string` TanStack Form field to a {@link TextInput}. */
export function FormTextInput(props: FormTextInputProps) {
  const { field, showErrorsWhen, helpText, state, ...rest } = props;
  const display = resolveFieldDisplay(field, { showErrorsWhen, helpText, state });
  const controlProps = {
    ...rest,
    name: field.name,
    value: field.state.value ?? "",
    onChange: (value: string) => field.handleChange(value),
    onBlur: () => field.handleBlur(),
    ...display,
  } as TextInputProps;
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
  const display = resolveFieldDisplay(field, { showErrorsWhen, helpText, state });
  const controlProps = {
    ...rest,
    name: field.name,
    value: field.state.value,
    onChange: (value: string | string[] | null) => field.handleChange(value),
    ...display,
  } as SelectProps;
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
  const display = resolveFieldDisplay(field, { showErrorsWhen, helpText, state });
  const controlProps = {
    ...rest,
    name: field.name,
    value: field.state.value,
    onChange: (value: boolean) => field.handleChange(value),
    ...display,
  } as CheckboxProps;
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
  const display = resolveFieldDisplay(field, { showErrorsWhen, helpText, state });
  const controlProps = {
    ...rest,
    name: field.name,
    value: field.state.value,
    onChange: (value: boolean) => field.handleChange(value),
    ...display,
  } as SwitchProps;
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
  const display = resolveFieldDisplay(field, { showErrorsWhen, helpText, state });
  const controlProps = {
    ...rest,
    value: field.state.value,
    onChange: (value: T[]) => field.handleChange(value),
    ...display,
  } as CheckboxGroupProps<T>;
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
  const display = resolveFieldDisplay(field, { showErrorsWhen, helpText, state });
  const controlProps = {
    ...rest,
    name: field.name,
    value: field.state.value,
    onChange: (value: T) => field.handleChange(value),
    ...display,
  } as RadioGroupProps<T>;
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
  const display = resolveFieldDisplay(field, { showErrorsWhen, helpText, state });
  const controlProps = {
    ...rest,
    name: field.name,
    value: field.state.value,
    onValueChange: (value: string | string[] | null) => field.handleChange(value),
    onBlur: () => field.handleBlur(),
    ...display,
  } as ComboboxProps;
  return <Combobox {...controlProps} />;
}
