"use client";
import * as React from "react";
import { InternalButton } from "../../internal/components/InternalButton";
import type { WidthShorthand } from "../../styles/layoutProps";
import type { Intent, Saliency, Size, TextSize } from "../../theme/constants";
import type { IconSlot } from "../Icon/renderIcon";

/** The button state a `startIcon`/`endIcon`/`icon` render function can branch on. */
export interface ButtonIconState {
  intent?: Intent;
  saliency?: Saliency;
  /** Undefined on the text appearance, which sizes via `variant`. */
  size?: Size;
  loading: boolean;
  disabled: boolean;
}

/**
 * Props shared by every `Button` arm. Silent on `children`/`aria-label`/`icon`
 * since those differ between labelled and icon-only arms, which redefine them.
 */
interface ButtonCommonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  // Colour comes from intent/saliency, not `color`.
  | "color"
  // Accessible name is arm-specific (visible label vs. required aria-label).
  | "aria-label"
  | "children"
  // Disabled is modelled with `aria-disabled` (see below), so it's redefined.
  | "disabled"
> {
  intent?: Intent;
  saliency?: Saliency;
  /**
   * Disables the button via `aria-disabled` (not the `disabled` attribute), so
   * it stays keyboard-focusable and can surface `disabledReason`. Activation is suppressed.
   */
  disabled?: boolean;
  /** Tooltip explanation shown when disabled and focused or hovered. Hidden while `loading`. */
  disabledReason?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Props shared by the labelled `Button` arms (`solid` and `text`), whose visible
 * text is the accessible name. Appearance-specific knobs live on the members below.
 */
export interface ButtonBaseProps extends ButtonCommonProps {
  /** Required visible text label (also the accessible name). */
  children: React.ReactNode;
  /**
   * Unsupported on a labelled button — the accessible name is always the visible
   * label, so an `aria-label` would silently override it. Required instead on
   * the icon-only arm ({@link IconButtonProps}), which has no visible text.
   */
  "aria-label"?: never;
  /**
   * Icon before the label — a bare glyph (auto-wrapped in `Icon`), an explicit
   * `<Icon>`, or a `(props, state)` render function. Inherits text colour.
   */
  startIcon?: IconSlot<ButtonIconState>;
  /** Icon after the label — same forms as `startIcon`. Inherits text colour. */
  endIcon?: IconSlot<ButtonIconState>;
  /**
   * Unsupported on a labelled button — use `startIcon`/`endIcon` instead. `icon`
   * is the discriminant of the icon-only arm ({@link IconButtonProps}).
   */
  icon?: never;
}

/**
 * The default `Button` — the filled "component" element type, sharing colour
 * scheme/recipe with `Chip` et al. Carries the chrome-only `size`/`loading` knobs.
 */
export interface SolidButtonProps extends ButtonBaseProps {
  /** Default look: the filled component control. */
  appearance?: "solid";
  size?: Size;
  /**
   * Loading state: disables interaction and overlays a spinner on the label
   * (which stays in place to preserve width/name). Disabled tooltip is suppressed.
   */
  loading?: boolean;
  /**
   * `width` shorthand: `fill` (100%), `fit` (fit-content), or `inherit` — same
   * knob as `Box`/`Flex`. Default hugs the label; `fill` stretches it to the
   * container (full-width submit, mobile CTA). Label stays centred.
   */
  width?: WidthShorthand;
  /** Unsupported on the default appearance — `variant` is a text-appearance knob. */
  variant?: never;
}

/**
 * `<Button appearance="text">` — the hyperlink look: underlined text coloured by
 * `intent`/`saliency`, with no background, border, or fixed control height.
 *
 * Chrome-specific knobs are gone: `size` (typography comes from `variant`),
 * `loading` (no room for a spinner), and icon-only mode (a bare underlined glyph
 * reads as neither link nor button). `startIcon`/`endIcon` alongside text still work.
 */
export interface TextButtonProps extends ButtonBaseProps {
  /** The hyperlink look. */
  appearance: "text";
  /** Typography size for the link text, from the shared scale. Default `md`. */
  variant?: TextSize;
  /** Unsupported on the text appearance — typography comes from `variant`. */
  size?: never;
  /** Unsupported on the text appearance — there's no chrome to overlay a spinner. */
  loading?: never;
  /**
   * Unsupported on the text appearance: the underline spans the full width, so
   * filling it drags the underline across the row with the label stranded at one
   * end. Wrap it in a `Box`/`Flex` to position it instead.
   */
  width?: never;
}

/**
 * `<Button aria-label="…" icon={…} />` — the icon-only look: a square filled
 * control with a single centred glyph and no visible text. `aria-label` is
 * **required** (the mirror of the labelled arms, which forbid it).
 * `intent`/`saliency`/`size`/`loading`/`disabled` behave as on a labelled `Button`.
 *
 * Only offered on the filled (`solid`) look — a bare underlined glyph reads as
 * neither link nor button. `icon` replaces the label, so `children` and
 * `startIcon`/`endIcon` are unavailable.
 */
export interface IconButtonProps extends ButtonCommonProps {
  /** Default look: the filled component control (the only look icon-only offers). */
  appearance?: "solid";
  /**
   * The single centred glyph — **required**, and the discriminant of this arm.
   * A bare glyph, explicit `<Icon>`, or `(props, state)` render function; inherits
   * text colour. Typed `NonNullable` so a nullish value can't slip through and
   * render an unnamed button.
   */
  icon: NonNullable<IconSlot<ButtonIconState>>;
  /**
   * Accessible name — **required**, since the icon-only button has no visible
   * text to name it. Mirror of the labelled arms, which forbid `aria-label`.
   */
  "aria-label": string;
  size?: Size;
  /**
   * Loading state: disables interaction and overlays a spinner on the glyph (it
   * stays in place to preserve the square box). Disabled tooltip is suppressed.
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
  /**
   * Unsupported on the icon-only arm: the square treatment pins a 1:1
   * `aspect-ratio`, so `width="fill"` would inflate it into a square, not widen
   * it. Use a labelled button for a full-width control.
   */
  width?: never;
}

/**
 * Button props, discriminated on `appearance` and the presence of `icon`: the
 * default filled control ({@link SolidButtonProps}), hyperlink-style text button
 * ({@link TextButtonProps}), or icon-only square button ({@link IconButtonProps}).
 */
export type ButtonProps = SolidButtonProps | TextButtonProps | IconButtonProps;

/**
 * Button — a "component" element type sharing colour scheme/recipe with `Chip`
 * et al., so `<Button intent="negative" saliency="high">` matches a `<Chip>`
 * with the same props.
 *
 * Pass `appearance="text"` for a hyperlink-style button, with `variant` picking
 * typography in place of `size` (see {@link TextButtonProps}). Pass `icon` +
 * `aria-label` (no `children`) for the icon-only look (see {@link IconButtonProps}).
 *
 * Disabled uses `aria-disabled` (keyboard-reachable) so it can explain itself via
 * `disabledReason`; loading overlays a spinner on the label.
 *
 * Rendering lives in `InternalButton`, reused by overlay components (`Drawer`,
 * `Modal`, `Popover`) as their trigger/close via base-ui's `render` prop.
 */
export function Button(props: ButtonProps) {
  return <InternalButton consumerProps={props} />;
}
