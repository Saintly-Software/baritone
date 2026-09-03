"use client";
import { cx } from "../../../utils/cx";
import { internalSpinnerRecipe, type InternalSpinnerRecipeVariants } from "./internalSpinner.css";

export interface InternalSpinnerProps {
  /**
   * Ring footprint. `sm` (1.25em) suits inline controls (`Button`, `Chip`); `lg`
   * (1.75em, thicker stroke) suits overlay surfaces (`Drawer`, `Modal`). Default `sm`.
   */
  size?: InternalSpinnerRecipeVariants["size"];
  /**
   * Extra classes merged onto the spinner glyph, used by the host to position it
   * (e.g. Button's absolute overlay). Sized in `em` and drawn in `currentColor`,
   * so it inherits font-size and colour from wherever it lands.
   */
  className?: string;
}

/**
 * InternalSpinner — the shared pure-CSS ring spinner behind `Button`/`Chip`'s
 * `loading` states. Sized in `em` (tracks the host's font-size) and drawn in
 * `currentColor` (dims when the host is `aria-disabled`).
 *
 * Decorative: renders `aria-hidden`, since the host announces `aria-busy` and
 * keeps the accessible name itself. Positioning is the host's job via `className`.
 *
 * **Internal — not exported from the package**, like `InternalButton`/`InternalTooltip`.
 */
export function InternalSpinner({ size, className }: InternalSpinnerProps) {
  return <span className={cx(internalSpinnerRecipe({ size }), className)} aria-hidden />;
}
