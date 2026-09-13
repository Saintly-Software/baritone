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

/** Props shared by every `Button` arm — the labelled looks and the icon-only one. */
interface ButtonCommonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "color" | "aria-label" | "children" | "disabled"
> {
  intent?: Intent;
  saliency?: Saliency;
  /**
   * Disables the button via `aria-disabled` (not the native attribute) so it
   * stays keyboard-focusable and can surface its `disabledReason` tooltip;
   * activation is suppressed.
   */
  disabled?: boolean;
  /** Explanation shown in a tooltip when disabled. Not shown while `loading`. */
  disabledReason?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Props shared by the *labelled* `Button` arms (`solid` and `text`), whose
 * visible text is the accessible name.
 */
export interface ButtonBaseProps extends ButtonCommonProps {
  /** Required visible text label (also the accessible name). */
  children: React.ReactNode;
  /** Unsupported on a labelled button — the visible label is the name. */
  "aria-label"?: never;
  /** Icon before the label — a bare glyph, an `<Icon>`, or a render function. */
  startIcon?: IconSlot<ButtonIconState>;
  /** Icon after the label — same forms as `startIcon`. */
  endIcon?: IconSlot<ButtonIconState>;
  /** Unsupported on a labelled button — the discriminant of the icon-only arm. */
  icon?: never;
}

/**
 * The default `Button` — the filled "component" element type, sharing the colour
 * recipe with `Chip` et al. Carries the `size` and `loading` chrome knobs.
 */
export interface SolidButtonProps extends ButtonBaseProps {
  /** Default look: the filled component control. */
  appearance?: "solid";
  size?: Size;
  /**
   * Loading state: disables interaction and overlays a spinner on the label
   * (kept in place to preserve width). Suppresses the disabled tooltip.
   */
  loading?: boolean;
  /**
   * `width` shorthand: `fill` (100%), `fit` (fit-content), or `inherit`. `fill`
   * stretches the button to its container for a full-width CTA.
   */
  width?: WidthShorthand;
  /** Unsupported on the default appearance — `variant` is a text-appearance knob. */
  variant?: never;
}

/**
 * `<Button appearance="text">` — the hyperlink look: underlined text coloured by
 * `intent`/`saliency`, with no background, border, or fixed height. No `size`
 * (use `variant`), `loading`, icon-only mode, or `width`; `startIcon`/`endIcon`
 * alongside a label are still supported.
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
  /** Unsupported on the text appearance — the underline would span the full width. */
  width?: never;
}

/**
 * `<Button aria-label icon />` — the icon-only look: a square filled control with
 * a single centred glyph. `aria-label` is **required**, since there's no label to
 * name it. A variation of the filled control (`intent`/`saliency`/`size`/`loading`
 * all behave as on a labelled `Button`), offered only on the `solid` look.
 */
export interface IconButtonProps extends ButtonCommonProps {
  /** Default look: the filled component control (the only look icon-only offers). */
  appearance?: "solid";
  /**
   * The single centred glyph — **required**, and the discriminant of this arm.
   * A bare glyph, an `<Icon>`, or a render function. `NonNullable` so a nullish
   * value can't slip through and render an unnamed button.
   */
  icon: NonNullable<IconSlot<ButtonIconState>>;
  /** Accessible name — **required**, since the button is icon-only. */
  "aria-label": string;
  size?: Size;
  /**
   * Loading state: disables interaction and overlays a spinner on the glyph.
   * Suppresses the disabled tooltip.
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
  /** Unsupported on the icon-only arm — the square treatment pins a 1:1 aspect ratio. */
  width?: never;
}

/**
 * Button props, discriminated on `appearance` and the presence of `icon`: the
 * filled control ({@link SolidButtonProps}), the text button
 * ({@link TextButtonProps}), or the icon-only button ({@link IconButtonProps}).
 */
export type ButtonProps = SolidButtonProps | TextButtonProps | IconButtonProps;

/**
 * A "component" element type sharing the colour recipe with `Chip` et al., so
 * `<Button intent="negative" saliency="high">` matches a `<Chip>` with the same
 * props. `appearance="text"` gives a hyperlink look (typography via `variant`);
 * `icon` + `aria-label` (no `children`) the icon-only square look. Disabled uses
 * `aria-disabled` so it can explain itself via `disabledReason`. Rendering lives
 * in `InternalButton`, so overlay components can reuse it as their trigger/close.
 */
export function Button(props: ButtonProps) {
  return <InternalButton consumerProps={props} />;
}
