"use client";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import * as React from "react";
import { InternalCheckbox } from "../../internal/components/InternalCheckbox";
import type { FormState, LabelPosition, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import {
  Field,
  type FieldLabellingInput,
  type FieldLabellingProps,
  fieldNameAttrs,
  type FieldSlotProps,
  warnOnConflictingNames,
} from "../Field";
import { useIsFieldDisabled } from "../Fieldset";
import { checkboxLabelDisabled, checkboxRow, checkboxRowDisabled } from "./checkbox.css";

interface CheckboxBaseProps {
  /**
   * Whether the box is ticked (controlled). Ignored for the accessible state
   * while `indeterminate` is set — a mixed box reports `aria-checked="mixed"`.
   */
  value: boolean;
  /** Called with the next checked state when the user toggles the box. */
  onChange: (value: boolean) => void;
  /**
   * Show the tri-state "mixed" look (a dash) and report `aria-checked="mixed"`.
   * Typically a parent box summarising a set of children that are only partly
   * selected. Toggling still fires `onChange` with the resolved boolean.
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
   * `disabled` attribute), so the box stays keyboard-focusable — e.g. it can
   * still be tabbed to and explain itself — while toggling is vetoed.
   */
  disabled?: boolean;
  /** Mark the field as required (sets `aria-required`). */
  required?: boolean;
  /** Validation state, drives the accent + focus-ring colour. Default `neutral`. */
  state?: FormState;
  /** Inline help beneath the box (wired as the control's `aria-describedby`). */
  helpText?: React.ReactNode;
  /** Shown (and announced) when `state` is `invalid`. */
  errorMessage?: React.ReactNode;
  /** Box + label size. Default `md`. */
  size?: Size;
  /** Identifies the field when submitted as part of a form. */
  name?: string;
  /** Extra className merged onto the box. */
  className?: string;
}

/**
 * The visible `label` sits beside the box (and is part of the click target).
 * Name the box with exactly one of `label` / `aria-label` / `aria-labelledby` —
 * they're mutually exclusive (see `FieldLabellingProps`).
 */
export type CheckboxProps = CheckboxBaseProps & FieldLabellingProps;

/**
 * Checkbox — a single boolean "form control", built on base-ui's `Checkbox` for
 * behaviour (role, keyboard, form wiring) and wrapped in a `Field` for ARIA, the
 * same way `TextInput` and `RadioGroup` are.
 *
 * The visual is the presentational `InternalCheckbox`, slotted in via base-ui's
 * `render` prop: base-ui makes the box the focusable `role="checkbox"` element
 * and feeds it `data-checked` / `data-disabled` / `data-invalid`, while
 * `InternalCheckbox` owns the look (box, glyph, focus ring). Because base-ui's
 * hidden `<input>` is `aria-hidden`, a wrapping `<label>` would only name *it*,
 * not the box — so, exactly like `RadioGroup`, the box is named explicitly with
 * `aria-labelledby` pointing at the visible label. Without a visible `label`,
 * name the box with `aria-label` / `aria-labelledby` instead.
 *
 * `value` stays a single `boolean` (the checked state); `indeterminate` layers a
 * "mixed" presentation on top for a parent-of-a-set summary. Validation follows
 * the shared `state` model, with an optional `helpText` / `errorMessage` line
 * beneath the box — matching `TextInput`, `RadioGroup`, and `CheckboxGroup`.
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
    errorMessage,
    size = "md",
    name,
    className,
  } = props as CheckboxBaseProps & FieldLabellingInput;

  const labelId = React.useId();
  // A wrapping `Fieldset` can disable the whole group; OR it into the local prop.
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;

  // The label lives inside the clickable row rather than in the `Field`, so the
  // exclusivity check that `Field` runs for other controls has to happen here.
  const nameProps: FieldLabellingInput = {
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
  };
  warnOnConflictingNames(nameProps, "Checkbox");

  return (
    <Field
      helpText={helpText}
      errorMessage={errorMessage}
      state={state}
      // Shrink-wrap around the row instead of spanning the line.
      fit="content"
      disabled={disabled}
      slotProps={slotProps}
    >
      <label className={cx(checkboxRow({ size, labelPosition }), disabled && checkboxRowDisabled)}>
        <BaseCheckbox.Root
          checked={value}
          indeterminate={indeterminate}
          onCheckedChange={(checked) => onChange(checked)}
          // `readOnly` (not `disabled`) keeps the box keyboard-focusable: base-ui
          // leaves it in the tab order but vetoes the toggle (click / Space). The
          // `aria-disabled` carries the disabled semantics to assistive tech.
          readOnly={disabled}
          aria-disabled={disabled || undefined}
          required={required}
          name={name}
          // Name the box explicitly: base-ui's hidden `<input>` is `aria-hidden`,
          // so the wrapping `<label>` would name *that*, not the box. Only the
          // attributes that are actually set get spread — an `aria-*={undefined}`
          // through base-ui's prop merge clobbers the field context's wiring.
          {...fieldNameAttrs(nameProps, labelId)}
          {...(ariaDescribedby != null && { "aria-describedby": ariaDescribedby })}
          render={
            <InternalCheckbox
              checked={indeterminate ? "indeterminate" : value}
              // base-ui now reports `data-readonly`, not `data-disabled`, so the
              // box's dim is driven explicitly from the prop.
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
