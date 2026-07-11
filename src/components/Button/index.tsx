"use client";
import * as React from "react";
import { InternalButton } from "../../internal/components/InternalButton";
import type { BodySize, Intent, Saliency, Size } from "../../theme/constants";

/**
 * Props shared by *every* `Button` arm — the labelled looks and the icon-only
 * one alike. Deliberately silent on `children`/`aria-label`/`icon`: those differ
 * between a labelled button (visible text is the accessible name) and an
 * icon-only button (a required `aria-label` is), so each arm redefines them.
 */
interface ButtonCommonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  // Colour comes from intent/saliency, not `color`.
  | "color"
  // The accessible name is arm-specific (visible label vs. required aria-label),
  // so each arm redefines `aria-label` and `children`.
  | "aria-label"
  | "children"
  // Disabled is modelled with `aria-disabled` (see below), so it's redefined.
  | "disabled"
> {
  intent?: Intent;
  saliency?: Saliency;
  /**
   * Disables the button. Applied as `aria-disabled` (not the `disabled`
   * attribute) so the button stays keyboard-focusable and can surface its
   * `disabledReason` tooltip. Clicks/keyboard activation are suppressed.
   */
  disabled?: boolean;
  /**
   * Explanation shown in a tooltip when the button is disabled and the user
   * tabs to or hovers it. Not shown in the `loading` state.
   */
  disabledReason?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Props shared by the *labelled* `Button` arms (`solid` and `text`), whose
 * visible text is the accessible name. The appearance-specific knobs
 * (`size`/`loading` for the default look, `variant` for the text look) live on
 * the two members below.
 */
export interface ButtonBaseProps extends ButtonCommonProps {
  /** Required visible text label (also the accessible name). */
  children: React.ReactNode;
  /**
   * Unsupported on a labelled button: the accessible name is always the visible
   * label, so passing an `aria-label` (which would silently override it) is a
   * type error. It's *required* on the icon-only arm ({@link IconButtonProps}),
   * which has no visible text to name it.
   */
  "aria-label"?: never;
  /** Icon placed before the label. Typically an `<Icon>`; inherits text colour. */
  startIcon?: React.ReactNode;
  /** Icon placed after the label. Typically an `<Icon>`; inherits text colour. */
  endIcon?: React.ReactNode;
  /**
   * Unsupported on a labelled button — pass `startIcon`/`endIcon` alongside the
   * label instead. `icon` is the discriminant of the icon-only arm
   * ({@link IconButtonProps}), which has no label.
   */
  icon?: never;
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
 * `<Button aria-label="…" icon={…} />` — the icon-only look: a square filled
 * control carrying a single centred glyph and no visible text. Because there's
 * no label to name it, `aria-label` is **required** (the mirror of the labelled
 * arms, which forbid it). It's a variation of the filled component control, not a
 * separate component — so `intent`/`saliency`/`size`/`loading`/`disabled` all
 * behave exactly as on a labelled `Button`.
 *
 * Only offered on the filled (`solid`) look: a bare *underlined* glyph (the text
 * appearance) reads as neither a link nor a button, so `appearance="text"` stays
 * label-only. The `icon` slot replaces the label, so `children` and
 * `startIcon`/`endIcon` are all unavailable here.
 */
export interface IconButtonProps extends ButtonCommonProps {
  /** Default look: the filled component control (the only look icon-only offers). */
  appearance?: "solid";
  /**
   * The single centred glyph — **required**, and the discriminant of this arm.
   * Typically an `<Icon>`; inherits the button's text colour.
   */
  icon: React.ReactNode;
  /**
   * Accessible name — **required**, because the button is icon-only and has no
   * visible text to name it (e.g. "Add to favourites"). The mirror image of a
   * labelled `Button`, which _forbids_ `aria-label` because its visible label is
   * already the name.
   */
  "aria-label": string;
  size?: Size;
  /**
   * Loading state: disables interaction and overlays a spinner on the glyph (the
   * glyph stays in place to preserve the square box; the `aria-label` keeps
   * naming the control). The disabled tooltip is suppressed while loading.
   */
  loading?: boolean;
  /** Unsupported on the icon-only arm — the `icon` slot is the whole content. */
  children?: never;
  /** Unsupported on the icon-only arm — the `icon` slot is the whole content. */
  startIcon?: never;
  /** Unsupported on the icon-only arm — the `icon` slot is the whole content. */
  endIcon?: never;
  /** Unsupported on the icon-only arm — it's always the filled `solid` look. */
  variant?: never;
}

/**
 * Button props, discriminated on `appearance` and the presence of `icon`: the
 * default filled control ({@link SolidButtonProps}), the hyperlink-style text
 * button ({@link TextButtonProps}), or the icon-only square button
 * ({@link IconButtonProps}, selected by passing `icon` + `aria-label`).
 */
export type ButtonProps = SolidButtonProps | TextButtonProps | IconButtonProps;

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
 * Pass `icon` + `aria-label` (and no `children`) for the icon-only look: a square
 * button carrying a single glyph, named by the required `aria-label`
 * (see {@link IconButtonProps}). It shares the filled control's
 * `intent`/`saliency`/`size`/`loading`, so it's a variation of `Button` rather
 * than a separate component.
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
