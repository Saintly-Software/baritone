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
   * Whether the switch is on (controlled) — the *checked state*, not the
   * form-submission `value` (same design note as `Checkbox`). base-ui's native
   * string `value` isn't surfaced; add a form value deliberately if ever needed.
   */
  value: boolean;
  /** Called on toggle: next checked state first, base-ui's raw DOM event second. */
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
   * Dim + lock the control, via `aria-disabled` + `readOnly` (not `disabled`), so
   * the track stays keyboard-focusable while toggling is vetoed.
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
 * - **`icon`** — one glyph reused for both states.
 * - **`activeIcon` + `inactiveIcon`** — a different glyph per state; both required together.
 *
 * A glyph is decorative — the accessible name still comes from `label`. Pass a
 * bare `currentColor` `<svg>` or an `<Icon>`; it's sized to the thumb and
 * recoloured to contrast with the fill.
 */
type SwitchIconProps =
  | { icon?: undefined; activeIcon?: undefined; inactiveIcon?: undefined }
  | { icon: React.ReactNode; activeIcon?: undefined; inactiveIcon?: undefined }
  | { icon?: undefined; activeIcon: React.ReactNode; inactiveIcon: React.ReactNode };

/**
 * The visible `label` sits beside the track (part of the click target). Name the
 * track with exactly one of `label` / `aria-label` / `aria-labelledby` (mutually
 * exclusive — see `FieldLabellingProps`).
 */
export type SwitchProps = SwitchBaseProps & SwitchIconProps & FieldLabellingProps;

/**
 * Switch — a single boolean "form control", built on base-ui's `Switch` for
 * behaviour and wrapped in a `Field` for ARIA, like `Checkbox`, `TextInput`, and
 * `RadioGroup`. The visual is the presentational `InternalSwitch`, slotted in via
 * base-ui's `render` prop; because base-ui's hidden `<input>` is `aria-hidden`, the
 * track is named explicitly via `aria-labelledby` rather than a wrapping `<label>`.
 *
 * A switch and a checkbox are the same shape of control, so the API matches:
 * `value` is a `boolean`, and validation follows the shared `state` model. An
 * optional glyph can ride inside the thumb — `icon` for both states, or
 * `activeIcon` + `inactiveIcon` for a different glyph per state.
 *
 * `labelPosition` places the label `end` (default), `start`, or `top`. `helpText`
 * adds inline help/validation, and `aria-label`/`aria-labelledby` name the control
 * when there's no visible `label`.
 *
 * @example
 * const [enabled, setEnabled] = React.useState(false);
 * <Switch label="Enable notifications" value={enabled} onChange={setEnabled} />
 *
 * @example
 * // Label above, with inline help.
 * <Switch
 *   label="Notifications"
 *   labelPosition="top"
 *   description="We'll only ping you about outages."
 *   value={on}
 *   onChange={setOn}
 * />
 *
 * @example
 * // Icon-only: no visible label, so name it explicitly.
 * <Switch aria-label="Wi-Fi" icon={<WifiSvg />} value={on} onChange={setOn} />
 *
 * @example
 * // A check when on, a cross when off.
 * <Switch
 *   label="Wi-Fi"
 *   value={on}
 *   onChange={setOn}
 *   activeIcon={<CheckSvg />}
 *   inactiveIcon={<CrossSvg />}
 * />
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
  // see `useIsFieldDisabled`
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;

  // `icon` is shorthand to reuse one glyph for both states; otherwise falls
  // through to the per-state pair.
  const onIcon = icon ?? activeIcon;
  const offIcon = icon ?? inactiveIcon;

  // The label lives in the clickable row, not the `Field`, so the exclusivity
  // check has to happen here — see `fieldControlAttrs`.
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
      // Shrink-wrap around the row instead of spanning the line.
      fit="content"
      disabled={disabled}
      slotProps={slotProps}
    >
      <label className={cx(switchRow({ size, labelPosition }), disabled && switchRowDisabled)}>
        <BaseSwitch.Root
          checked={value}
          onCheckedChange={(checked, details) => onChange(checked, details.event)}
          // `readOnly` (not `disabled`) keeps the track tabbable while vetoing the
          // toggle; `aria-disabled` carries the semantics to assistive tech.
          readOnly={disabled}
          aria-disabled={disabled || undefined}
          required={required}
          name={name}
          // Names the track explicitly, since base-ui's hidden `<input>` is
          // `aria-hidden` and a wrapping `<label>` would name that instead.
          {...fieldControlAttrs(controlProps, labelId)}
          render={
            <InternalSwitch
              checked={value}
              // base-ui reports `data-readonly`, not `data-disabled`, so the dim is
              // driven from the prop explicitly.
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
