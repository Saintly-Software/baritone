"use client";
import { Field } from "@base-ui/react/field";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import * as React from "react";
import { InternalSwitch } from "../../internal/components/InternalSwitch";
import { textIntentRecipe, textVariantRecipe } from "../../styles/recipes/text.css";
import { atoms } from "../../styles/sprinkles.css";
import type { LabelPosition, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useIsFieldDisabled } from "../Fieldset";
import { switchLabelDisabled, switchRow, switchRowDisabled } from "./switch.css";

// Field.Root defaults to a block `<div>`; shrink-wrap it into a column so the
// clickable row plus any help / error text stack tightly, not across the line.
const wrapperClass = atoms({
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "1",
});
// Inline help + error text, matching TextInput / RadioGroup: low-saliency for
// help, negative for the error, both a step below the label.
const descriptionClass = cx(
  textIntentRecipe({ intent: "neutral", saliency: "low" }),
  textVariantRecipe({ family: "body", size: "xs" }),
);
const errorClass = cx(
  textIntentRecipe({ intent: "negative", saliency: "high" }),
  textVariantRecipe({ family: "body", size: "xs" }),
);

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
  /** Visible label beside the track; also becomes the control's accessible name. */
  label?: React.ReactNode;
  /** Where the label sits relative to the track. Default `end`. */
  labelPosition?: LabelPosition;
  /** Inline help shown under the row and wired via `aria-describedby`. */
  description?: React.ReactNode;
  /** Shown (and announced) under the row when `invalid`. */
  errorMessage?: React.ReactNode;
  /**
   * Accessible name when there is no visible `label` (e.g. an icon-only switch).
   * Ignored if `aria-labelledby` or a visible `label` is present.
   */
  "aria-label"?: string;
  /**
   * Point the control at an external label element. Takes precedence over the
   * visible `label`'s generated id.
   */
  "aria-labelledby"?: string;
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

export type SwitchProps = SwitchBaseProps & SwitchIconProps;

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
 * An optional glyph can ride inside the thumb: `icon` reuses one glyph for both
 * states, or `activeIcon` + `inactiveIcon` show a different glyph per state (the
 * two spellings are a discriminated union, so they can't be mixed).
 *
 * `labelPosition` places the visible label `end` (default), `start`, or `top`
 * relative to the track — RTL-safe, via flex direction only, so the DOM order
 * and accessible name never move. `description` / `errorMessage` add inline help
 * and validation text under the row (auto-wired through `Field`), and
 * `aria-label` / `aria-labelledby` name the control when there is no visible
 * `label` (e.g. an icon-only switch).
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
export function Switch({
  value,
  onChange,
  label,
  labelPosition = "end",
  description,
  errorMessage,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  disabled: disabledProp = false,
  required = false,
  invalid = false,
  size = "md",
  name,
  className,
  icon,
  activeIcon,
  inactiveIcon,
}: SwitchProps) {
  const labelId = React.useId();
  // A wrapping `Fieldset` can disable the whole group; OR it into the local prop.
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;

  // `icon` is the single-glyph shorthand — reuse it for both states; otherwise
  // fall through to the per-state pair (both present or both absent).
  const onIcon = icon ?? activeIcon;
  const offIcon = icon ?? inactiveIcon;

  // Naming precedence: an explicit `aria-labelledby` wins, then the visible
  // label's generated id, then fall back to `aria-label`. Only surface
  // `aria-label` when nothing is naming the control by reference.
  const labelledby = ariaLabelledby ?? (label != null ? labelId : undefined);
  const ariaLabelToApply = labelledby == null ? ariaLabel : undefined;

  return (
    // No `disabled` on `Field.Root`: base-ui propagates it down as the native
    // `disabled` attribute on the control, which would drop it from the tab
    // order. Disabled is modelled per-control with `aria-disabled` + `readOnly`.
    <Field.Root className={wrapperClass} invalid={invalid}>
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
          aria-labelledby={labelledby}
          aria-label={ariaLabelToApply}
          render={
            <InternalSwitch
              checked={value}
              // base-ui now reports `data-readonly`, not `data-disabled`, so the
              // track's dim is driven explicitly from the prop.
              disabled={disabled}
              state={invalid ? "invalid" : "neutral"}
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
      {description != null && (
        <Field.Description className={descriptionClass}>{description}</Field.Description>
      )}
      {invalid && errorMessage != null && (
        <Field.Error className={errorClass} match>
          {errorMessage}
        </Field.Error>
      )}
    </Field.Root>
  );
}
