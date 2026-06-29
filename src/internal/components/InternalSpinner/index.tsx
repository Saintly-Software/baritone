"use client";
import { cx } from "../../../utils/cx";
import { internalSpinnerRecipe, type InternalSpinnerRecipeVariants } from "./internalSpinner.css";

export interface InternalSpinnerProps {
  /**
   * Ring footprint. `sm` (1.25em) suits the inline controls (`Button`, `Chip`);
   * `lg` (1.75em, thicker stroke) suits the larger overlay surfaces (`Drawer`,
   * `Modal`). Defaults to `sm`.
   */
  size?: InternalSpinnerRecipeVariants["size"];
  /**
   * Extra classes merged onto the spinner glyph — used by the host to position
   * it (e.g. Button's absolute overlay). The glyph itself is sized in `em` and
   * drawn in `currentColor`, so it inherits font-size and colour from wherever
   * it lands.
   */
  className?: string;
}

/**
 * InternalSpinner — the shared pure-CSS ring spinner behind the `loading` states
 * of `Button` and `Chip`. A single rotating ring, sized in `em` (tracks the
 * host's font-size) and drawn in `currentColor` (matches the resolved
 * foreground, dimmed wherever the host is `aria-disabled`).
 *
 * Decorative by design: it renders `aria-hidden`, because the host announces the
 * busy state itself (`aria-busy`) and keeps the accessible name. Positioning is
 * the host's job — pass a `className` to place it (Button overlays it on the
 * label; Chip drops it in as the only child and lets its flex-centring do it).
 *
 * **Internal by design — not exported from the package.** Like `InternalButton`
 * and `InternalTooltip`, it's a building block the system composes from.
 */
export function InternalSpinner({ size, className }: InternalSpinnerProps) {
  return <span className={cx(internalSpinnerRecipe({ size }), className)} aria-hidden />;
}
