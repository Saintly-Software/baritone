"use client";
import * as React from "react";
import { InternalSpinner } from "../../internal/components/InternalSpinner";
import type { InternalSpinnerRecipeVariants } from "../../internal/components/InternalSpinner/internalSpinner.css";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";
import { SrOnly } from "../SrOnly";
import { loadingIndicatorRecipe } from "./loadingIndicator.css";

/** `size` -> the `InternalSpinner` ring footprint (`lg` thickens the stroke). */
const RING_SIZE: Record<Size, InternalSpinnerRecipeVariants["size"]> = {
  sm: "sm",
  md: "sm",
  lg: "lg",
};

export interface LoadingIndicatorProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "color"
> {
  /** Footprint of the spinner, tracking `Icon`'s size ramp. Default `md`. */
  size?: Size;
  /**
   * Visual style. Only `"spinner"` today — an axis reserved so future
   * indicators (e.g. a progress bar) can slot in without a breaking change.
   */
  variant?: "spinner";
  /** Colour intent when standalone; ignored inside `Text`/`Chip`. Default `neutral`. */
  intent?: Intent;
  /** Colour saliency when standalone; ignored inside `Text`/`Chip`. Default `mid`. */
  saliency?: Saliency;
  /**
   * The screen-reader label announced while loading (via `role="status"`).
   * Default `"Loading"`. Suppressed entirely when the indicator is decorative
   * (`aria-hidden`).
   */
  label?: string;
  /**
   * Render as a different element / merge into a given one (base-ui `render`
   * pattern). Defaults to a `<span>`.
   */
  render?: RenderProp;
  ref?: React.Ref<HTMLSpanElement>;
}

/**
 * LoadingIndicator — the public spinner. It wraps the system's shared
 * `InternalSpinner` (the same pure-CSS ring behind `Button`/`Chip` loading
 * states) and gives it a standalone, accessible shell.
 *
 * By default it exposes an `SrOnly` "Loading" label under `role="status"`, so
 * assistive tech announces the busy state politely; the ring itself stays
 * decorative (`aria-hidden`). Pass a custom `label` to reword the announcement.
 * When the surrounding context already conveys the busy state (e.g. a host with
 * `aria-busy`), pass `aria-hidden` to render the ring purely decoratively — the
 * label, `role`, and live region are all dropped.
 *
 * Colour follows the same rules as `Icon`: inside `Text`/`Chip` it matches the
 * surrounding text; standalone it sources the `component` token for its
 * `intent`/`saliency`. The ring honours `prefers-reduced-motion` (its spin eases
 * to a slow rotation rather than a fast one).
 */
export function LoadingIndicator({
  size = "md",
  variant = "spinner",
  intent,
  saliency,
  label = "Loading",
  render,
  className,
  ref,
  ...rest
}: LoadingIndicatorProps) {
  // A `void` here keeps the reserved `variant` prop from tripping lint while it
  // has a single value; it becomes a real switch once other variants land.
  void variant;

  // Decorative when the caller hides it from the a11y tree — then we drop the
  // status role and the SR label and let the host own the announcement.
  const decorative = rest["aria-hidden"] === true || rest["aria-hidden"] === "true";

  return useRender({
    render,
    defaultElement: "span",
    props: {
      ref,
      className: cx(loadingIndicatorRecipe({ intent, saliency, size }), className),
      role: decorative ? undefined : "status",
      children: (
        <>
          <InternalSpinner size={RING_SIZE[size]} />
          {decorative ? null : <SrOnly>{label}</SrOnly>}
        </>
      ),
      ...rest,
    },
  });
}

LoadingIndicator.displayName = "LoadingIndicator";
