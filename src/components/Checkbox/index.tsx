"use client";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Field } from "@base-ui/react/field";
import * as React from "react";
import { InternalCheckbox } from "../../internal/components/InternalCheckbox";
import { atoms } from "../../styles/sprinkles.css";
import type { Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { checkboxLabelDisabled, checkboxRow, checkboxRowDisabled } from "./checkbox.css";

// Field.Root defaults to a block `<div>`; shrink-wrap it so the clickable area
// is just the box + label, not the full line.
const wrapperClass = atoms({ display: "inline-flex" });

export interface CheckboxProps {
  /** Whether the box is ticked (controlled). */
  value: boolean;
  /** Called with the next checked state when the user toggles the box. */
  onChange: (value: boolean) => void;
  /** Visible label beside the box; also becomes the control's accessible name. */
  label?: React.ReactNode;
  /**
   * Dim + lock the control. Modelled with `aria-disabled` + `readOnly` (not the
   * `disabled` attribute), so the box stays keyboard-focusable — e.g. it can
   * still be tabbed to and explain itself — while toggling is vetoed.
   */
  disabled?: boolean;
  /** Mark the field as required (sets `aria-required`). */
  required?: boolean;
  /** Flag the field invalid — negative accent on the box + `aria-invalid` wiring. */
  invalid?: boolean;
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
 * `aria-labelledby` pointing at the visible label.
 *
 * The API is intentionally smaller than `RadioGroup`'s: a checkbox is one
 * boolean, so `value` is a `boolean` and validation is a plain `invalid` flag
 * rather than the full `FormState`.
 *
 * @example
 * const [agreed, setAgreed] = React.useState(false);
 * <Checkbox label="I agree to the terms" value={agreed} onChange={setAgreed} required />
 */
export function Checkbox({
  value,
  onChange,
  label,
  disabled = false,
  required = false,
  invalid = false,
  size = "md",
  name,
  className,
}: CheckboxProps) {
  const labelId = React.useId();

  return (
    // No `disabled` on `Field.Root`: base-ui propagates it down as the native
    // `disabled` attribute on the control, which would drop it from the tab
    // order. Disabled is modelled per-control with `aria-disabled` + `readOnly`.
    <Field.Root className={wrapperClass} invalid={invalid}>
      <label className={cx(checkboxRow({ size }), disabled && checkboxRowDisabled)}>
        <BaseCheckbox.Root
          checked={value}
          onCheckedChange={(checked) => onChange(checked)}
          // `readOnly` (not `disabled`) keeps the box keyboard-focusable: base-ui
          // leaves it in the tab order but vetoes the toggle (click / Space). The
          // `aria-disabled` carries the disabled semantics to assistive tech.
          readOnly={disabled}
          aria-disabled={disabled || undefined}
          required={required}
          name={name}
          aria-labelledby={label != null ? labelId : undefined}
          render={
            <InternalCheckbox
              checked={value}
              // base-ui now reports `data-readonly`, not `data-disabled`, so the
              // box's dim is driven explicitly from the prop.
              disabled={disabled}
              state={invalid ? "invalid" : "neutral"}
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
    </Field.Root>
  );
}
