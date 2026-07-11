"use client";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Field } from "@base-ui/react/field";
import * as React from "react";
import { InternalCheckbox } from "../../internal/components/InternalCheckbox";
import { textIntentRecipe, textVariantRecipe } from "../../styles/recipes/text.css";
import { atoms } from "../../styles/sprinkles.css";
import type { FormState, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useIsFieldDisabled } from "../Fieldset";
import { checkboxLabelDisabled, checkboxRow, checkboxRowDisabled } from "./checkbox.css";

// Field.Root defaults to a block `<div>`; shrink-wrap it and stack the row above
// the help/error line, left-aligned so the text lines up under the box.
const wrapperClass = atoms({
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "1",
});
const descriptionClass = cx(
  textIntentRecipe({ intent: "neutral", saliency: "low" }),
  textVariantRecipe({ family: "body", size: "xs" }),
);
const errorClass = cx(
  textIntentRecipe({ intent: "negative", saliency: "high" }),
  textVariantRecipe({ family: "body", size: "xs" }),
);

export interface CheckboxProps {
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
  /** Visible label beside the box; also becomes the control's accessible name. */
  label?: React.ReactNode;
  /**
   * Accessible name for a label-less checkbox. Use when there's no visible
   * `label` (a visible `label` always wins and names the box itself).
   */
  "aria-label"?: string;
  /**
   * ID(s) of the element(s) that name a label-less checkbox. Use when the name
   * lives elsewhere on the page (a visible `label` always wins).
   */
  "aria-labelledby"?: string;
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
export function Checkbox({
  value,
  onChange,
  indeterminate = false,
  label,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  disabled: disabledProp = false,
  required = false,
  state = "neutral",
  helpText,
  errorMessage,
  size = "md",
  name,
  className,
}: CheckboxProps) {
  const labelId = React.useId();
  // A wrapping `Fieldset` can disable the whole group; OR it into the local prop.
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;

  // Name the box explicitly. A visible `label` wins (base-ui's hidden `<input>`
  // is aria-hidden, so a wrapping `<label>` can't name the box); otherwise fall
  // back to the consumer's aria props. Only spread the ones that are set —
  // passing `aria-*={undefined}` through base-ui's prop merge would clobber the
  // name coming from the field context.
  const resolvedLabelledby = label != null ? labelId : ariaLabelledby;
  const nameAttrs = {
    ...(resolvedLabelledby != null && { "aria-labelledby": resolvedLabelledby }),
    ...(label == null && ariaLabel != null && { "aria-label": ariaLabel }),
  };

  return (
    // No `disabled` on `Field.Root`: base-ui propagates it down as the native
    // `disabled` attribute on the control, which would drop it from the tab
    // order. Disabled is modelled per-control with `aria-disabled` + `readOnly`.
    <Field.Root className={wrapperClass} invalid={state === "invalid"}>
      <label className={cx(checkboxRow({ size }), disabled && checkboxRowDisabled)}>
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
          {...nameAttrs}
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
      {helpText != null && (
        <Field.Description className={descriptionClass}>{helpText}</Field.Description>
      )}
      {state === "invalid" && errorMessage != null && (
        <Field.Error className={errorClass} match>
          {errorMessage}
        </Field.Error>
      )}
    </Field.Root>
  );
}
