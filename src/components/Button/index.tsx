"use client";
import * as React from "react";
import { InternalButton } from "../../internal/components/InternalButton";
import type { BodySize, Intent, Saliency, Size } from "../../theme/constants";

/**
 * Props shared by every `Button`, regardless of `appearance`. The
 * appearance-specific knobs (`size`/`loading` for the default look, `variant`
 * for the text look) live on the two members of the {@link ButtonProps} union.
 */
export interface ButtonBaseProps extends Omit<
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
  /** Icon placed before the label. Typically an `<Icon>`; inherits text colour. */
  startIcon?: React.ReactNode;
  /** Icon placed after the label. Typically an `<Icon>`; inherits text colour. */
  endIcon?: React.ReactNode;
  /**
   * Explanation shown in a tooltip when the button is disabled and the user
   * tabs to or hovers it. Not shown in the `loading` state.
   */
  disabledReason?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * The default `Button` — the filled "component" element type, sharing the colour
 * scheme/recipe with `Chip` et al. Carries the `size` and `loading` knobs, which
 * only make sense for a chrome-bearing control.
 */
export interface SolidButtonProps extends ButtonBaseProps {
  /** Default look: the filled component control. */
  appearance?: "solid";
  size?: Size;
  /**
   * Loading state: disables interaction and overlays a spinner on the label
   * (the label stays in place to preserve width and the accessible name). The
   * disabled tooltip is suppressed while loading.
   */
  loading?: boolean;
  /** Unsupported on the default appearance — `variant` is a text-appearance knob. */
  variant?: never;
}

/**
 * `<Button appearance="text">` — the hyperlink look: underlined text coloured by
 * `intent`/`saliency`, with no background, border, or fixed control height.
 *
 * The chrome-specific knobs are gone: `size` (typography comes from `variant`
 * instead), `loading` (no room for a spinner overlay), and any icon-only mode
 * (`icon` + `aria-label`) — a bare underlined glyph reads as neither a link nor a
 * button, so it's intentionally unavailable here (`aria-label` is already
 * `never`). `startIcon`/`endIcon` alongside a text label are still supported.
 */
export interface TextButtonProps extends ButtonBaseProps {
  /** The hyperlink look. */
  appearance: "text";
  /** Body typography variant for the link text. Default `base`. */
  variant?: BodySize;
  /** Unsupported on the text appearance — typography comes from `variant`. */
  size?: never;
  /** Unsupported on the text appearance — there's no chrome to overlay a spinner. */
  loading?: never;
}

/**
 * Button props, discriminated on `appearance`: the default filled control
 * ({@link SolidButtonProps}) or the hyperlink-style text button
 * ({@link TextButtonProps}).
 */
export type ButtonProps = SolidButtonProps | TextButtonProps;

/**
 * Button — a "component" element type. Shares the colour scheme/recipe with
 * `Chip` et al., so `<Button intent="negative" saliency="high">` matches a
 * `<Chip>` with the same props. Hover/active states are derived from tokens at
 * use-site.
 *
 * Pass `appearance="text"` for a hyperlink-style button: underlined text driven
 * by the same `intent`/`saliency`, with `variant` picking the body typography in
 * place of `size` (see {@link TextButtonProps}).
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
