"use client";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import * as React from "react";
import { InternalCheckbox } from "../../internal/components/InternalCheckbox";
import type { FormState, LabelPosition, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import {
  Field,
  type FieldControlInput,
  type FieldLabellingInput,
  type FieldLabellingProps,
  fieldControlAttrs,
  type FieldSlotProps,
  assertExclusiveNames,
} from "../Field";
import { useIsFieldDisabled } from "../Fieldset";
import { checkboxLabelDisabled, checkboxRow, checkboxRowDisabled } from "./checkbox.css";

interface CheckboxBaseProps {
  /**
   * Whether the box is ticked (controlled). While `indeterminate` is set, the
   * accessible state reports `aria-checked="mixed"` instead.
   */
  value: boolean;
  /** Called when the user toggles the box: next checked state first, the raw DOM event second. */
  onChange: (value: boolean, event: Event) => void;
  /**
   * Show the tri-state "mixed" look (a dash) and report `aria-checked="mixed"` —
   * typically a parent box summarising partly-selected children. Toggling still
   * fires `onChange` with the resolved boolean.
   */
  indeterminate?: boolean;
  /** Where the label sits relative to the box. Default `end`. */
  labelPosition?: LabelPosition;
  /** Per-slot overrides for the help-text piece. */
  slotProps?: FieldSlotProps;
  /** Points the box at extra descriptive text; combines with `helpText`. */
  "aria-describedby"?: string;
  /**
   * Dim + lock the control. Modelled with `aria-disabled` + `readOnly` (not the
   * `disabled` attribute), so the box stays keyboard-focusable while toggling is vetoed.
   */
  disabled?: boolean;
  /** Mark the field as required (sets `aria-required`). */
  required?: boolean;
  /** Validation state, drives the accent + focus-ring colour. Default `neutral`. */
  state?: FormState;
  /** Inline help beneath the box (wired as the control's `aria-describedby`). */
  helpText?: React.ReactNode;
  /** Box + label size. Default `md`. */
  size?: Size;
  /** Identifies the field when submitted as part of a form. */
  name?: string;
  /** Extra className merged onto the box. */
  className?: string;
}

/**
 * The visible `label` sits beside the box (part of the click target). Name the
 * box with exactly one of `label`/`aria-label`/`aria-labelledby` — they're
 * mutually exclusive (see `FieldLabellingProps`).
 */
export type CheckboxProps = CheckboxBaseProps & FieldLabellingProps;

/**
 * Checkbox — a single boolean "form control", built on base-ui's `Checkbox` for
 * behaviour and wrapped in a `Field` for ARIA, like `TextInput` and `RadioGroup`.
 *
 * The visual is the presentational `InternalCheckbox`, slotted in via base-ui's
 * `render` prop. Because base-ui's hidden `<input>` is `aria-hidden`, the box is
 * named explicitly with `aria-labelledby` pointing at the visible label (as in
 * `RadioGroup`); without a visible `label`, name it with `aria-label`/`aria-labelledby`.
 *
 * `value` is a single `boolean`; `indeterminate` layers a "mixed" presentation on
 * top for a parent-of-a-set summary. Validation follows the shared `state`
 * model, with an optional `helpText` line beneath the box — matching
 * `TextInput`, `RadioGroup`, `CheckboxGroup`.
 *
 * @example
 * const [agreed, setAgreed] = React.useState(false);
 * <Checkbox label="I agree to the terms" value={agreed} onChange={setAgreed} required />
 */
export function Checkbox(props: CheckboxProps) {
  const {
    value,
    onChange,
    indeterminate = false,
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
    labelPosition = "end",
    slotProps,
    disabled: disabledProp = false,
    required = false,
    state = "neutral",
    helpText,
    size = "md",
    name,
    className,
  } = props as CheckboxBaseProps & FieldLabellingInput;

  const labelId = React.useId();
  // see `useIsFieldDisabled`
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;

  // The label lives inside the clickable row rather than in the `Field`, so the
  // exclusivity check happens here. `controlProps` bundles what the control's
  // focusable element needs from the field — see `fieldControlAttrs`.
  const controlProps: FieldControlInput = {
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
  };
  assertExclusiveNames(controlProps, "Checkbox");

  return (
    <Field
      helpText={helpText}
      state={state}
      required={required}
      // Shrink-wrap around the row instead of spanning the line.
      fit="content"
      disabled={disabled}
      slotProps={slotProps}
    >
      <label className={cx(checkboxRow({ size, labelPosition }), disabled && checkboxRowDisabled)}>
        <BaseCheckbox.Root
          checked={value}
          indeterminate={indeterminate}
          onCheckedChange={(checked, details) => onChange(checked, details.event)}
          // `readOnly` (not `disabled`) keeps the box keyboard-focusable: base-ui
          // vetoes the toggle but leaves it tabbable; `aria-disabled` carries the
          // semantics to assistive tech.
          readOnly={disabled}
          aria-disabled={disabled || undefined}
          required={required}
          name={name}
          // Name the box explicitly: base-ui's hidden `<input>` is `aria-hidden`,
          // so the `<label>` would otherwise name that, not the box.
          {...fieldControlAttrs(controlProps, labelId)}
          render={
            <InternalCheckbox
              checked={indeterminate ? "indeterminate" : value}
              // base-ui reports `data-readonly`, not `data-disabled`, so dim is
              // driven explicitly from the prop.
              disabled={disabled}
              state={state}
              size={size}
              className={className}
            />
          }
        />
        {label != null && (
          <span id={labelId} className={cx(disabled && checkboxLabelDisabled)}>
            {label}
          </span>
        )}
      </label>
    </Field>
  );
}
