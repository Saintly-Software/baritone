"use client";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import * as React from "react";
import { InternalSwitch } from "../../internal/components/InternalSwitch";
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
import { switchLabelDisabled, switchRow, switchRowDisabled } from "./switch.css";

interface SwitchBaseProps {
  /**
   * Whether the switch is on (controlled). This is the *checked state*, not the
   * form-submission `value` — the same design note as `Checkbox`. base-ui's
   * native string `value` is intentionally not surfaced; if a form value is ever
   * needed it should be added deliberately, never silently repurposed from here.
   */
  value: boolean;
  /**
   * Called when the user toggles the switch, with the next checked state first
   * and the raw DOM event that drove it second (base-ui's native `event`).
   */
  onChange: (value: boolean, event: Event) => void;
  /** Where the label sits relative to the track. Default `end`. */
  labelPosition?: LabelPosition;
  /** Inline help shown under the row and wired via `aria-describedby`. */
  helpText?: React.ReactNode;
  /** Per-slot overrides for the help-text piece. */
  slotProps?: FieldSlotProps;
  /** Points the track at extra descriptive text; combines with `helpText`. */
  "aria-describedby"?: string;
  /**
   * Dim + lock the control. Modelled with `aria-disabled` + `readOnly` (not the
   * `disabled` attribute), so the track stays keyboard-focusable — e.g. it can
   * still be tabbed to and explain itself — while toggling is vetoed.
   */
  disabled?: boolean;
  /** Mark the field as required (sets `aria-required`). */
  required?: boolean;
  /** Validation state, drives the accent + focus-ring colour. Default `neutral`. */
  state?: FormState;
  /** Track + label size. Default `md`. */
  size?: Size;
  /** Identifies the field when submitted as part of a form. */
  name?: string;
  /** Extra className merged onto the track. */
  className?: string;
}

/**
 * Optional glyph(s) shown inside the sliding thumb — a discriminated union so the
 * two spellings can't be mixed:
 *
 * - **no icon props** — a plain thumb (the default).
 * - **`icon`** — one glyph reused for *both* states; it rides the thumb whether
 *   the switch is on or off.
 * - **`activeIcon` + `inactiveIcon`** — a *different* glyph for each state (e.g. a
 *   check when on, a cross when off); both are required together.
 *
 * A glyph is decorative — the switch's accessible name still comes from `label`.
 * Pass a bare `currentColor` `<svg>` or an `<Icon>`; it's sized to the thumb and
 * recoloured to contrast with the fill.
 */
type SwitchIconProps =
  | { icon?: undefined; activeIcon?: undefined; inactiveIcon?: undefined }
  | { icon: React.ReactNode; activeIcon?: undefined; inactiveIcon?: undefined }
  | { icon?: undefined; activeIcon: React.ReactNode; inactiveIcon: React.ReactNode };

/**
 * The visible `label` sits beside the track (and is part of the click target).
 * Name the track with exactly one of `label` / `aria-label` / `aria-labelledby` —
 * they're mutually exclusive (see `FieldLabellingProps`).
 */
export type SwitchProps = SwitchBaseProps & SwitchIconProps & FieldLabellingProps;

/**
 * A single boolean "form control", built on base-ui's `Switch` and wrapped in a
 * `Field`, with the same API as `Checkbox` (`value` is a `boolean`, validation
 * follows the shared `state` model). An optional thumb glyph rides via `icon` (one
 * glyph) or `activeIcon` + `inactiveIcon` (per-state, a discriminated union).
 * `labelPosition` places the label `end` (default) / `start` / `top`; name an
 * icon-only switch with `aria-label` / `aria-labelledby`.
 *
 * @example
 * const [enabled, setEnabled] = React.useState(false);
 * <Switch label="Enable notifications" value={enabled} onChange={setEnabled} />
 *
 * @example
 * // Icon-only: no visible label, so name it explicitly.
 * <Switch aria-label="Wi-Fi" icon={<WifiSvg />} value={on} onChange={setOn} />
 */
export function Switch(props: SwitchProps) {
  const {
    value,
    onChange,
    label,
    labelPosition = "end",
    helpText,
    slotProps,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
    disabled: disabledProp = false,
    required = false,
    state = "neutral",
    size = "md",
    name,
    className,
    icon,
    activeIcon,
    inactiveIcon,
  } = props as SwitchBaseProps & SwitchIconProps & FieldLabellingInput;

  const labelId = React.useId();
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;

  const onIcon = icon ?? activeIcon;
  const offIcon = icon ?? inactiveIcon;

  const controlProps: FieldControlInput = {
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
  };
  assertExclusiveNames(controlProps, "Switch");

  return (
    <Field
      helpText={helpText}
      state={state}
      required={required}
      fit="content"
      disabled={disabled}
      slotProps={slotProps}
    >
      <label className={cx(switchRow({ size, labelPosition }), disabled && switchRowDisabled)}>
        <BaseSwitch.Root
          checked={value}
          onCheckedChange={(checked, details) => onChange(checked, details.event)}
          readOnly={disabled}
          aria-disabled={disabled || undefined}
          required={required}
          name={name}
          {...fieldControlAttrs(controlProps, labelId)}
          render={
            <InternalSwitch
              checked={value}
              disabled={disabled}
              state={state}
              size={size}
              activeIcon={onIcon}
              inactiveIcon={offIcon}
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
    </Field>
  );
}
