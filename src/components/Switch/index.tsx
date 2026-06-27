"use client";
import { Field } from "@base-ui/react/field";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import * as React from "react";
import { InternalSwitch } from "../../internal/components/InternalSwitch";
import { atoms } from "../../styles/sprinkles.css";
import type { Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { switchLabelDisabled, switchRow, switchRowDisabled } from "./switch.css";

// Field.Root defaults to a block `<div>`; shrink-wrap it so the clickable area
// is just the track + label, not the full line.
const wrapperClass = atoms({ display: "inline-flex" });

export interface SwitchProps {
  /** Whether the switch is on (controlled). */
  value: boolean;
  /** Called with the next checked state when the user toggles the switch. */
  onChange: (value: boolean) => void;
  /** Visible label beside the track; also becomes the control's accessible name. */
  label?: React.ReactNode;
  /**
   * Dim + lock the control. Modelled with `aria-disabled` + `readOnly` (not the
   * `disabled` attribute), so the track stays keyboard-focusable — e.g. it can
   * still be tabbed to and explain itself — while toggling is vetoed.
   */
  disabled?: boolean;
  /** Mark the field as required (sets `aria-required`). */
  required?: boolean;
  /** Flag the field invalid — negative accent on the track + `aria-invalid` wiring. */
  invalid?: boolean;
  /** Track + label size. Default `md`. */
  size?: Size;
  /** Identifies the field when submitted as part of a form. */
  name?: string;
  /** Extra className merged onto the track. */
  className?: string;
}

/**
 * Switch — a single boolean "form control", built on base-ui's `Switch` for
 * behaviour (role, keyboard, form wiring) and wrapped in a `Field` for ARIA, the
 * same way `Checkbox`, `TextInput`, and `RadioGroup` are.
 *
 * The visual is the presentational `InternalSwitch`, slotted in via base-ui's
 * `render` prop: base-ui makes the track the focusable `role="switch"` element
 * and feeds it `data-checked` / `data-disabled` / `data-invalid`, while
 * `InternalSwitch` owns the look (track, sliding thumb, focus ring). Because
 * base-ui's hidden `<input>` is `aria-hidden`, a wrapping `<label>` would only
 * name *it*, not the track — so, exactly like `Checkbox`, the track is named
 * explicitly with `aria-labelledby` pointing at the visible label.
 *
 * A switch and a checkbox are the same shape of control (one boolean), so the
 * API is deliberately identical: `value` is a `boolean` and validation is a
 * plain `invalid` flag rather than the full `FormState`.
 *
 * @example
 * const [enabled, setEnabled] = React.useState(false);
 * <Switch label="Enable notifications" value={enabled} onChange={setEnabled} />
 */
export function Switch({
  value,
  onChange,
  label,
  disabled = false,
  required = false,
  invalid = false,
  size = "md",
  name,
  className,
}: SwitchProps) {
  const labelId = React.useId();

  return (
    // No `disabled` on `Field.Root`: base-ui propagates it down as the native
    // `disabled` attribute on the control, which would drop it from the tab
    // order. Disabled is modelled per-control with `aria-disabled` + `readOnly`.
    <Field.Root className={wrapperClass} invalid={invalid}>
      <label className={cx(switchRow({ size }), disabled && switchRowDisabled)}>
        <BaseSwitch.Root
          checked={value}
          onCheckedChange={(checked) => onChange(checked)}
          // `readOnly` (not `disabled`) keeps the track keyboard-focusable: base-ui
          // leaves it in the tab order but vetoes the toggle (click / Space). The
          // `aria-disabled` carries the disabled semantics to assistive tech.
          readOnly={disabled}
          aria-disabled={disabled || undefined}
          required={required}
          name={name}
          aria-labelledby={label != null ? labelId : undefined}
          render={
            <InternalSwitch
              checked={value}
              // base-ui now reports `data-readonly`, not `data-disabled`, so the
              // track's dim is driven explicitly from the prop.
              disabled={disabled}
              state={invalid ? "invalid" : "neutral"}
              size={size}
              className={className}
            />
          }
        />
        {label != null && (
          <span id={labelId} className={cx(disabled && switchLabelDisabled)}>
            {label}
          </span>
        )}
      </label>
    </Field.Root>
  );
}
