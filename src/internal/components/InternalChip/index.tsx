"use client";
import * as React from "react";
import {
  chipLabelRecipe,
  chipShapeRecipe,
  chipSizeRecipe,
  chipWidthRecipe,
} from "../../../components/Chip/chip.css";
import { chipAdornmentRecipe } from "../../../components/Chip/chipAdornment.css";
import type { ChipIconState } from "../../../components/Chip";
import { type IconSlot, renderIcon } from "../../../components/Icon/renderIcon";
import {
  componentIntentRecipe,
  componentTypographyRecipe,
} from "../../../styles/recipes/component.css";
import { focusRingRecipe } from "../../../styles/recipes/focusRing.css";
import type { Intent, Saliency, Size } from "../../../theme/constants";
import { cx } from "../../../utils/cx";
import type { RenderProp } from "../../../utils/render";
import {
  InternalGenericButtonAnchor,
  type InternalGenericButtonAnchorProps,
} from "../InternalGenericButtonAnchor";
import { InternalTooltip } from "../InternalTooltip";

/** The chip's visual knobs — the styling props `Chip` and a chip-styled `Link` share. */
export interface ChipBoxVariants {
  intent?: Intent;
  saliency?: Saliency;
  size?: Size;
  /** `square` (default) keeps the component radius; `pill` fully rounds the ends. */
  shape?: "square" | "pill";
  /** `fit` (default) hugs the content; `fill` stretches to the container's width. */
  width?: "fit" | "fill";
}

/**
 * Single source of truth for the chip's root-box look: the exact recipe set that
 * makes an element *look like a `Chip`*. The public `Chip` and `Link`'s
 * `appearance="chip"` both compose their root className from this helper (plus
 * their own `className`), so the two never drift.
 *
 * `interactive: "auto"` leaves pointer/hover/active to the *rendered element* —
 * an inert `<span>` stays static, while an `<a>` (a chip-link, or `Chip` via
 * `render`) lights up under the cursor. See the `interactive` variants in
 * `component.css.ts`.
 */
export function chipBoxClassName({
  intent,
  saliency,
  size,
  shape,
  width,
}: ChipBoxVariants): string {
  return cx(
    componentTypographyRecipe({ size, interactive: "auto" }),
    chipSizeRecipe({ size }),
    chipShapeRecipe({ shape }),
    chipWidthRecipe({ width }),
    componentIntentRecipe({ intent, saliency, interactive: "auto" }),
    focusRingRecipe({ type: "visible" }),
  );
}

export interface InternalChipProps
  extends
    Omit<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      // Colour comes from intent/saliency, not `color` (matches `Chip`/`Link`).
      | "color"
      // Accessible name is always the visible label — `aria-label` would
      // silently override it, so it's unsupported here.
      | "aria-label"
    >,
    ChipBoxVariants {
  /**
   * Decorative leading icon before the label, mirroring `Chip`'s `icon`. Bare
   * glyph, `<Icon>`, or a `(props, state)` render function; inherits the chip's colour.
   */
  icon?: IconSlot<ChipIconState>;
  /**
   * Decorative trailing icon, mirroring `Chip`'s `trailIcon`. Same forms as
   * `icon`; inherits the chip's colour.
   */
  trailIcon?: IconSlot<ChipIconState>;
  /**
   * Disables the link — collapses to an inert element (no navigation, out of the
   * a11y tree) while keeping the chip styling; see `InternalGenericButtonAnchor`.
   */
  disabled?: boolean;
  /** Explanation shown in a tooltip when the disabled link is tabbed to or hovered. */
  disabledReason?: React.ReactNode;
  /**
   * Router-link element for client-side navigation (base-ui `render` pattern),
   * e.g. `render={<NextLink href="/tags/music" />}`. Omit and pass `href` for a
   * plain external `<a>`.
   */
  render?: RenderProp;
  /** The visible text label — also the accessible name. */
  children: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
  /**
   * Unsupported: the accessible name is always the visible label, so `aria-label`
   * is a type error here — a JS/cast caller that forces it is dropped at runtime.
   */
  "aria-label"?: never;
}

/**
 * InternalChip — the implementation behind `Link`'s `appearance="chip"`. Owns
 * the chip-specific chrome ({@link chipBoxClassName}, truncating label,
 * decorative lead/trail icons, disabled-explanation tooltip);
 * `InternalGenericButtonAnchor` renders the element itself and owns the disabled
 * model.
 *
 * A chip-link is deliberately *one anchor*: an interactive element with optional
 * decorative icons, no interactive adornments, `onClick`/`popover`, or remove
 * button — avoiding the nested-interactive-element problem an `href` on `Chip`
 * would create.
 *
 * **Internal by design — not exported.** Like `InternalButton`, a building block
 * the system composes public components from.
 */
export function InternalChip({
  intent,
  saliency,
  size = "md",
  shape,
  width,
  icon,
  trailIcon,
  disabled = false,
  disabledReason,
  render,
  href,
  target,
  rel,
  className,
  children,
  ref,
  // Destructured out so it's never forwarded to the DOM — a cast/JS caller can't
  // sneak `aria-label` onto the anchor this way (matches `Button`).
  "aria-label": _ariaLabel,
  ...rest
}: InternalChipProps) {
  // The root carries the chip look; `InternalGenericButtonAnchor` renders it as
  // the router link, a plain `<a href>`, or — disabled — an inert element that
  // keeps the styling but leaves the link a11y tree. The label is the single
  // truncating flex item, ellipsizing under `width="fill"` like `Chip`.
  //
  // `icon`/`trailIcon` are decorative-only; since `children` alone is the
  // anchor's accessible name, the wrappers are `aria-hidden` to keep any textual
  // glyph out of that name.
  const iconState = { intent, saliency, size, disabled };
  // Guard each wrapper on the resolved node, not the raw slot — a slot can resolve to nothing.
  const iconNode = renderIcon(icon, { state: iconState });
  const trailIconNode = renderIcon(trailIcon, { state: iconState });
  const chip = (
    <InternalGenericButtonAnchor
      {...(rest as InternalGenericButtonAnchorProps)}
      ref={ref}
      render={render}
      href={href}
      target={target}
      rel={rel}
      disabled={disabled}
      className={cx(chipBoxClassName({ intent, saliency, size, shape, width }), className)}
    >
      {iconNode != null && (
        <span aria-hidden="true" className={chipAdornmentRecipe({ size })}>
          {iconNode}
        </span>
      )}
      <span className={chipLabelRecipe()}>{children}</span>
      {trailIconNode != null && (
        <span aria-hidden="true" className={chipAdornmentRecipe({ size })}>
          {trailIconNode}
        </span>
      )}
    </InternalGenericButtonAnchor>
  );

  // The tooltip only exists to explain a disabled chip-link; skip it when
  // there's nothing to explain.
  if (disabledReason == null) {
    return chip;
  }

  return (
    <InternalTooltip content={disabledReason} disabled={!disabled}>
      {chip}
    </InternalTooltip>
  );
}
