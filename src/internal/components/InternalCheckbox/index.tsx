"use client";
import * as React from "react";
import { focusRingRecipe } from "../../../styles/recipes/focusRing.css";
import type { FormState, Size } from "../../../theme/constants";
import { cx } from "../../../utils/cx";
import { checkboxControl, checkboxIndicator } from "./internalCheckbox.css";

/** Tri-state value: `false` (unchecked), `true` (checked), or `"indeterminate"`. */
export type InternalCheckboxState = boolean | "indeterminate";

export interface InternalCheckboxProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "children"
> {
  /**
   * Visual state. `true` shows a check, `"indeterminate"` shows a dash, `false`
   * (default) shows an empty box.
   */
  checked?: InternalCheckboxState;
  /** Dim the box and suppress hover/press. Purely visual — see the note below. */
  disabled?: boolean;
  /** Box size. Default `md`. Matches the `RadioGroup` control sizes. */
  size?: Size;
  /** Form state, drives the accent + focus-ring colour. Default `neutral`. */
  state?: FormState;
  /**
   * Optional focusable control to slot inside the box (e.g. a visually-hidden
   * `<input type="checkbox">`). Because the ring is drawn with `:focus-within`,
   * tabbing to a focusable child lights the ring on the box — the box itself is
   * never a tab stop.
   */
  children?: React.ReactNode;
  ref?: React.Ref<HTMLSpanElement>;
}

/** Tick. Drawn with `currentColor` so it inherits the control's accent. */
function CheckGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="100%"
      height="100%"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3.5 8.5 6.75 11.75 12.5 4.75" />
    </svg>
  );
}

/** Dash, for the indeterminate state. */
function DashGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="100%"
      height="100%"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M3.75 8 12.25 8" />
    </svg>
  );
}

/**
 * InternalCheckbox — a "fake checkbox": a presentational box that *looks* like a
 * checkbox (checked / indeterminate / unchecked, plus disabled, hover, press,
 * and a focus ring) without being an `<input>`. It owns no state and no
 * behaviour, so it can be reused anywhere a checkbox affordance is needed — a
 * real form field, a selectable list/menu row, a "select all" header, etc.
 *
 * **It is not focusable and carries no ARIA on its own.** The box is decorative;
 * whatever wraps or fills it is responsible for semantics and keyboard handling.
 * For an actual, accessible checkbox, the consumer slots a focusable control
 * inside — typically a visually-hidden `<input type="checkbox">` — and the box's
 * `:focus-within` ring lights up when that control is tabbed to. (This is why
 * the box itself is never a tab stop.)
 *
 * **Internal by design — not exported from the package.** Like `InternalTooltip`,
 * it's a building block the system composes from; a public, fully-wired
 * `Checkbox` would build on top of it.
 *
 * @example
 * // Accessible composition: real input owns state + focus, the box owns looks.
 * <label>
 *   <InternalCheckbox checked={checked}>
 *     <input
 *       type="checkbox"
 *       checked={checked}
 *       onChange={(e) => setChecked(e.target.checked)}
 *       style={visuallyHidden}
 *     />
 *   </InternalCheckbox>
 *   Subscribe
 * </label>
 */
export function InternalCheckbox({
  checked = false,
  disabled = false,
  size = "md",
  state = "neutral",
  className,
  children,
  ref,
  ...rest
}: InternalCheckboxProps) {
  const indeterminate = checked === "indeterminate";
  const isChecked = checked === true;

  // One mutually-exclusive value attribute (base-ui convention, consistent with
  // the radio control), so CSS and consumers can target each state directly.
  const valueAttrs = {
    "data-checked": isChecked ? "" : undefined,
    "data-unchecked": !isChecked && !indeterminate ? "" : undefined,
    "data-indeterminate": indeterminate ? "" : undefined,
  };

  return (
    <span
      ref={ref}
      className={cx(
        checkboxControl({ size, state }),
        focusRingRecipe({ type: "within", offset: "sm" }),
        className,
      )}
      {...valueAttrs}
      data-disabled={disabled ? "" : undefined}
      {...rest}
    >
      <span className={checkboxIndicator} aria-hidden {...valueAttrs}>
        {indeterminate ? <DashGlyph /> : <CheckGlyph />}
      </span>
      {children}
    </span>
  );
}
