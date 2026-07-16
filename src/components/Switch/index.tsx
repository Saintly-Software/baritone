"use client";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import * as React from "react";
import { InternalSwitch } from "../../internal/components/InternalSwitch";
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
import { switchLabelDisabled, switchRow, switchRowDisabled } from "./switch.css";

interface SwitchBaseProps {
  /**
   * Whether the switch is on (controlled). This is the *checked state*, not the
   * form-submission `value` — the same design note as `Checkbox`. base-ui's
   * native string `value` is intentionally not surfaced; if a form value is ever
   * needed it should be added deliberately, never silently repurposed from here.
   */
  value: boolean;
  /** Called with the next checked state when the user toggles the switch. */
  onChange: (value: boolean) => void;
  /** Where the label sits relative to the track. Default `end`. */
  labelPosition?: LabelPosition;
  /** Inline help shown under the row and wired via `aria-describedby`. */
  helpText?: React.ReactNode;
  /** Shown (and announced) under the row when `state` is `invalid`. */
  errorMessage?: React.ReactNode;
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
 * API is deliberately identical: `value` is a `boolean` and validation follows
 * the shared `state` model.
 *
 * An optional glyph can ride inside the thumb: `icon` reuses one glyph for both
 * states, or `activeIcon` + `inactiveIcon` show a different glyph per state (the
 * two spellings are a discriminated union, so they can't be mixed).
 *
 * `labelPosition` places the visible label `end` (default), `start`, or `top`
 * relative to the track — RTL-safe, via flex direction only, so the DOM order
 * and accessible name never move. `helpText` / `errorMessage` add inline help
 * and validation text under the row (auto-wired through `Field`), and
 * `aria-label` / `aria-labelledby` name the control when there is no visible
 * `label` (e.g. an icon-only switch) — exactly one of the three, they're
 * mutually exclusive.
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
    errorMessage,
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
  // A wrapping `Fieldset` can disable the whole group; OR it into the local prop.
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;

  // `icon` is the single-glyph shorthand — reuse it for both states; otherwise
  // fall through to the per-state pair (both present or both absent).
  const onIcon = icon ?? activeIcon;
  const offIcon = icon ?? inactiveIcon;

  // The label lives inside the clickable row rather than in the `Field`, so the
  // exclusivity check that `Field` runs for other controls has to happen here.
  const nameProps: FieldLabellingInput = {
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
  };
  warnOnConflictingNames(nameProps, "Switch");

  return (
    <Field
      helpText={helpText}
      errorMessage={errorMessage}
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
          onCheckedChange={(checked) => onChange(checked)}
          // `readOnly` (not `disabled`) keeps the track keyboard-focusable: base-ui
          // leaves it in the tab order but vetoes the toggle (click / Space). The
          // `aria-disabled` carries the disabled semantics to assistive tech.
          readOnly={disabled}
          aria-disabled={disabled || undefined}
          required={required}
          name={name}
          // Name the track explicitly: base-ui's hidden `<input>` is `aria-hidden`,
          // so the wrapping `<label>` would name *that*, not the track. Only the
          // attributes that are actually set get spread — an `aria-*={undefined}`
          // through base-ui's prop merge clobbers the field context's wiring.
          {...fieldNameAttrs(nameProps, labelId)}
          {...(ariaDescribedby != null && { "aria-describedby": ariaDescribedby })}
          render={
            <InternalSwitch
              checked={value}
              // base-ui now reports `data-readonly`, not `data-disabled`, so the
              // track's dim is driven explicitly from the prop.
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
