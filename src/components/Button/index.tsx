"use client";
import * as React from "react";
import { InternalButton } from "../../internal/components/InternalButton";
import type { Intent, Saliency, Size } from "../../theme/constants";
import type { RenderProp } from "../../utils/render";

export interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  // Colour comes from intent/saliency, not `color`.
  | "color"
  // The label is the accessible name; an `aria-label` would silently override
  // it, so the API intentionally doesn't expose one.
  | "aria-label"
  // Disabled is modelled with `aria-disabled` (see below), and the label is
  // required, so both are redefined.
  | "disabled"
  | "children"
> {
  intent?: Intent;
  saliency?: Saliency;
  size?: Size;
  /** Required visible text label (also the accessible name). */
  children: React.ReactNode;
  /**
   * Unsupported: the accessible name is always the visible label, so passing an
   * `aria-label` (which would silently override it) is a type error.
   */
  "aria-label"?: never;
  /**
   * Disables the button. Applied as `aria-disabled` (not the `disabled`
   * attribute) so the button stays keyboard-focusable and can surface its
   * `disabledReason` tooltip. Clicks/keyboard activation are suppressed.
   */
  disabled?: boolean;
  /**
   * Loading state: disables interaction and overlays a spinner on the label
   * (the label stays in place to preserve width and the accessible name). The
   * disabled tooltip is suppressed while loading.
   */
  loading?: boolean;
  /** Icon placed before the label. Typically an `<Icon>`; inherits text colour. */
  startIcon?: React.ReactNode;
  /** Icon placed after the label. Typically an `<Icon>`; inherits text colour. */
  endIcon?: React.ReactNode;
  /**
   * Explanation shown in a tooltip when the button is disabled and the user
   * tabs to or hovers it. Not shown in the `loading` state.
   */
  disabledReason?: React.ReactNode;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Button — a "component" element type. Shares the colour scheme/recipe with
 * `Chip` et al., so `<Button intent="negative" saliency="high">` matches a
 * `<Chip>` with the same props. Hover/active states are derived from tokens at
 * use-site.
 *
 * Disabled uses `aria-disabled` (keyboard-reachable) so a disabled button can
 * explain itself via `disabledReason`; loading overlays a spinner on the label.
 *
 * The rendering lives in `InternalButton`; `Button` just forwards its props as
 * `consumerProps`. That split lets the overlay components (`Drawer`, `Modal`,
 * `Popover`) reuse the same button as their trigger/close by feeding base-ui's
 * `render` props in through `InternalButton`'s `htmlAttrs` seam.
 */
export function Button(props: ButtonProps) {
  return <InternalButton consumerProps={props} />;
}
