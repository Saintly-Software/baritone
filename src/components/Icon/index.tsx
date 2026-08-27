"use client";
import * as React from "react";
import { iconRecipe } from "../../styles/recipes/icon.css";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";

export interface IconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Only used when standalone; ignored inside `Text`/`Chip`. */
  intent?: Intent;
  /** Only used when standalone; ignored inside `Text`/`Chip`. */
  saliency?: Saliency;
  /** Visual size (sets the `1em` box via font-size). */
  size?: Size;
  /**
   * Accessible label. If provided the icon is exposed as `role="img"`; if
   * omitted the icon is treated as decorative (`aria-hidden`).
   */
  label?: string;
  /** Expected to be an `<svg>` using `fill`/`stroke: currentColor`. */
  children?: React.ReactNode;
  ref?: React.Ref<HTMLSpanElement>;
}

/**
 * Icon wrapper. Colour follows surrounding text when rendered inside `Text` or a
 * component like `Chip` (via the shared `--iconColor` variable); used standalone
 * it sources its colour from the `component` tokens for the given
 * intent/saliency.
 *
 * Flowing inline inside `Text`/`Heading` it also picks up an optical vertical
 * alignment (via `--iconAlign`) so a glyph dropped mid-sentence or at a line's end
 * sits centred against the copy rather than low on the baseline — no per-usage
 * `verticalAlign` needed. Standalone and as a flex child it stays on `baseline`
 * (where the parent's `align-items` already centres it). Horizontal spacing is
 * genuinely context-dependent, so that's still the caller's to set.
 */
export function Icon({
  intent,
  saliency,
  size,
  label,
  className,
  children,
  ref,
  ...rest
}: IconProps) {
  return (
    <span
      ref={ref}
      className={cx(iconRecipe({ intent, saliency, size }), className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      {children}
    </span>
  );
}
