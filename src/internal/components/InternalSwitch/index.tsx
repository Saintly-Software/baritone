"use client";
import * as React from "react";
import { focusRingRecipe } from "../../../styles/recipes/focusRing.css";
import type { FormState, Size } from "../../../theme/constants";
import { cx } from "../../../utils/cx";
import { switchThumb, switchThumbIcon, switchTrack } from "./internalSwitch.css";

export interface InternalSwitchProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "children"
> {
  /** Whether the track shows the "on" position. Default `false`. */
  checked?: boolean;
  /** Dim the track and suppress hover/press. Purely visual — see the note below. */
  disabled?: boolean;
  /** Track size. Default `md`. Matches the `Checkbox` / `RadioGroup` control sizes. */
  size?: Size;
  /** Form state, drives the accent + focus-ring colour. Default `neutral`. */
  state?: FormState;
  /**
   * Glyph shown inside the thumb while checked. Typically a bare `currentColor`
   * `<svg>` (or an `<Icon>`); it's sized to the thumb and coloured to contrast
   * with the fill. Omit for a plain thumb.
   */
  activeIcon?: React.ReactNode;
  /** Glyph shown inside the thumb while unchecked. See {@link activeIcon}. */
  inactiveIcon?: React.ReactNode;
  /**
   * Optional focusable control to slot inside the track (e.g. a visually-hidden
   * `<input type="checkbox" role="switch">`). Because the ring is drawn with
   * `:focus-within`, tabbing to a focusable child lights the ring on the track —
   * the track itself is never a tab stop.
   */
  children?: React.ReactNode;
  ref?: React.Ref<HTMLSpanElement>;
}

/**
 * InternalSwitch — a "fake switch": a presentational pill-shaped track with a
 * sliding thumb that *looks* like a toggle (on / off, plus disabled, hover,
 * press, and a focus ring) without being an `<input>`. It owns no state and no
 * behaviour, so it can be reused anywhere a toggle affordance is needed — a real
 * form field, a settings row, a toolbar toggle, etc.
 *
 * **It is not focusable and carries no ARIA on its own.** The track is
 * decorative; whatever wraps or fills it is responsible for semantics and
 * keyboard handling. For an actual, accessible switch, the consumer slots a
 * focusable control inside — typically a visually-hidden `<input>` — and the
 * track's `:focus-within` ring lights up when that control is tabbed to. (This
 * is why the track itself is never a tab stop.)
 *
 * **Internal by design — not exported from the package.** Like `InternalCheckbox`,
 * it's a building block the system composes from; a public, fully-wired `Switch`
 * builds on top of it.
 *
 * @example
 * // Accessible composition: real input owns state + focus, the track owns looks.
 * <label>
 *   <InternalSwitch checked={on}>
 *     <input
 *       type="checkbox"
 *       role="switch"
 *       checked={on}
 *       onChange={(e) => setOn(e.target.checked)}
 *       style={visuallyHidden}
 *     />
 *   </InternalSwitch>
 *   Wi-Fi
 * </label>
 */
export function InternalSwitch({
  checked = false,
  disabled = false,
  size = "md",
  state = "neutral",
  activeIcon,
  inactiveIcon,
  className,
  children,
  ref,
  ...rest
}: InternalSwitchProps) {
  // One mutually-exclusive value attribute (base-ui convention, consistent with
  // the checkbox/radio controls), so CSS and consumers can target each state.
  const valueAttrs = {
    "data-checked": checked ? "" : undefined,
    "data-unchecked": !checked ? "" : undefined,
  };

  // A single glyph slot in the thumb whose contents swap with the state.
  const thumbIcon = checked ? activeIcon : inactiveIcon;

  return (
    <span
      ref={ref}
      className={cx(
        switchTrack({ size, state }),
        focusRingRecipe({ type: "within", offset: "sm" }),
        className,
      )}
      {...valueAttrs}
      data-disabled={disabled ? "" : undefined}
      {...rest}
    >
      <span className={switchThumb} aria-hidden {...valueAttrs}>
        {thumbIcon != null && <span className={switchThumbIcon}>{thumbIcon}</span>}
      </span>
      {children}
    </span>
  );
}
