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
 * The single source of truth for the chip's root-box look: the exact set and
 * order of recipes that make an element *look like a `Chip`* — the shared
 * component typography/colour scheme plus the chip-specific box, shape, width,
 * and focus ring. Both the public `Chip` and `Link`'s `appearance="chip"` compose
 * their root className from this one helper, so there's zero style duplication and
 * no visual drift between them.
 *
 * `interactive: "auto"` on the shared component recipes leaves the pointer /
 * hover / active affordances to the *rendered element*: an inert `<span>` chip
 * stays a static tag, while an `<a>` (a chip-link, or a `Chip` rendered as a link
 * via `render`) lights up under the cursor — see the `interactive` variants in
 * `component.css.ts`. The consumer's own `className` is layered on by each caller.
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
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "color" | "aria-label">,
    ChipBoxVariants {
  /**
   * Decorative leading icon — a single non-interactive glyph before the label,
   * mirroring `Chip`'s `icon`. A bare glyph (auto-wrapped in `Icon`), an explicit
   * `<Icon>`, or a `(props, state)` render function; inherits the chip's colour.
   */
  icon?: IconSlot<ChipIconState>;
  /**
   * Decorative trailing icon — mirrors `icon` at the other end (`Chip`'s
   * `trailIcon`). Same forms as `icon`; inherits the chip's colour.
   */
  trailIcon?: IconSlot<ChipIconState>;
  /**
   * Disables the link. A disabled link has no honest HTML form, so it collapses
   * to an inert element (no navigation, out of the a11y tree as a link) while
   * keeping the chip styling — see `InternalGenericButtonAnchor`.
   */
  disabled?: boolean;
  /**
   * Explanation shown in a tooltip when the link is disabled and the user tabs to
   * or hovers it.
   */
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
   * Unsupported: the accessible name is always the visible label, so passing an
   * `aria-label` (which would silently override it) is a type error, and a
   * JS/cast caller that forces it is dropped at runtime (see below).
   */
  "aria-label"?: never;
}

/**
 * InternalChip — the implementation behind `Link`'s `appearance="chip"`. It owns
 * the chip-specific chrome: the shared {@link chipBoxClassName} recipe on the root
 * element, the truncating label, the decorative lead/trail icons, and the
 * disabled-explanation tooltip. The element itself is rendered by
 * `InternalGenericButtonAnchor`, which owns the element selection (`<a>` / router
 * link, or an inert element when disabled) and the shared disabled model.
 *
 * A chip-link is deliberately *one anchor*: a single interactive element with an
 * optional decorative icon on each side, and no interactive adornments,
 * `onClick`/`popover` label semantics, or remove button. Anything action-bearing
 * stays on `Chip`; keeping this to one anchor is what avoids the
 * nested-interactive-element problem an `href` on `Chip` would create.
 *
 * **Internal by design — not exported from the package.** Like `InternalButton`,
 * it's a building block the system composes public components from — here, the
 * `Chip` look shared with the navigable `Link appearance="chip"`.
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
  "aria-label": _ariaLabel,
  ...rest
}: InternalChipProps) {
  const iconState = { intent, saliency, size, disabled };
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

  if (disabledReason == null) {
    return chip;
  }

  return (
    <InternalTooltip content={disabledReason} disabled={!disabled}>
      {chip}
    </InternalTooltip>
  );
}
