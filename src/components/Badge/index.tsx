"use client";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import * as React from "react";
import { componentIntentRecipe } from "../../styles/recipes/component.css";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";
import { badgeColorVar, badgeCustomColor, badgeRecipe } from "./badge.css";

/** The badge silhouette: a fully-rounded pill/circle, or a softly-rounded square. */
export type BadgeShape = "round" | "square";

/**
 * Props shared by every badge kind. The content is carried by the kind-specific
 * props below rather than `children`, so `children` is removed from the
 * underlying span attributes (as is the native `color` attribute, which the
 * escape hatch below redefines). The `shape` axis is orthogonal to the content
 * kind — any kind can be `square`.
 */
interface BadgeBaseProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color" | "children"> {
  size?: Size;
  /** Corner treatment: `round` (default) or `square`. Applies to every kind. */
  shape?: BadgeShape;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLSpanElement>;
}

/** The default: colour from the system palette, shared with `Chip`/`Button`. */
export interface BadgeIntentColourProps {
  intent?: Intent;
  saliency?: Saliency;
  /** Unsupported alongside `intent`/`saliency` — see {@link BadgeCustomColourProps}. */
  color?: never;
}

/**
 * `<Badge color="#7c3aed" />` — the colour **escape hatch**, for a badge whose
 * fill is data rather than a design decision: a per-tag colour, a
 * customer-chosen label colour, a language/category swatch. These are values the
 * palette can't enumerate, because they aren't the system's to choose.
 *
 * Prefer `intent`/`saliency`. Everything the palette *can* express should go
 * through it: an `intent` badge re-themes with the rest of the system, this one
 * is frozen at whatever you pass. Reach here only when the colour genuinely
 * isn't the system's to pick.
 *
 * Mutually exclusive with `intent`/`saliency` rather than overriding them: this
 * replaces the token-driven colour scheme outright, so accepting both would
 * leave one silently doing nothing.
 *
 * The text/icon colour is derived from the fill (black or white, whichever
 * survives on it) — you supply the fill, not the pair. Note the fill is used
 * as-is: it can't respond to a theme change, and nothing checks it against the
 * surface *behind* the badge.
 */
export interface BadgeCustomColourProps {
  /**
   * Paint the badge any CSS colour, replacing `intent` × `saliency`. Takes
   * anything CSS `color` does — a hex/rgb/oklch value, a custom property,
   * `currentColor`. The foreground is derived for contrast.
   */
  color: NonNullable<React.CSSProperties["color"]>;
  /** Unsupported alongside `color` — the custom fill replaces the palette scheme. */
  intent?: never;
  /** Unsupported alongside `color` — the custom fill replaces the palette scheme. */
  saliency?: never;
}

/**
 * How a badge gets its colour: from the palette ({@link BadgeIntentColourProps},
 * the default) or from a caller-supplied CSS colour
 * ({@link BadgeCustomColourProps}). Orthogonal to the content kind, so it's
 * intersected with the four kinds rather than multiplying them out.
 */
export type BadgeColourProps = BadgeIntentColourProps | BadgeCustomColourProps;

/** A badge whose content is a single icon — typically an `<Icon>` that inherits the badge's colour. */
export interface BadgeIconProps extends BadgeBaseProps {
  /** An icon to show in the badge. Inherits the badge's foreground via `--iconColor`. */
  icon: React.ReactNode;
  count?: never;
  max?: never;
  text?: never;
}

/** A badge whose content is a number, optionally capped at `max` as `{max}+`. */
export interface BadgeCountProps extends BadgeBaseProps {
  /** A numeric count to show in the badge. */
  count: number;
  /**
   * Caps the displayed count: when `count` exceeds `max` the badge renders
   * `{max}+` (e.g. `max={99}` shows `99+` for 100). Only applies with `count`.
   */
  max?: number;
  icon?: never;
  text?: never;
}

/** A badge whose content is a short string of text. */
export interface BadgeTextProps extends BadgeBaseProps {
  /** Short text to show in the badge (e.g. `NEW`, `BETA`). */
  text: string;
  icon?: never;
  count?: never;
  max?: never;
}

/** A content-less badge — a bare indicator (a small dot when `round`). */
export interface BadgeBlankProps extends BadgeBaseProps {
  icon?: never;
  count?: never;
  max?: never;
  text?: never;
}

/**
 * A Badge, as one of four content kinds discriminated by its content prop:
 *   - **icon** — pass `icon`,
 *   - **count** — pass `count` (optionally `max`),
 *   - **text** — pass `text`,
 *   - **blank** — pass none of them for a bare content-less indicator.
 *
 * Each kind is independently `round` (default) or `square` via `shape`, and
 * independently coloured by the palette or by a custom `color`
 * ({@link BadgeColourProps}) — both axes are orthogonal to the content, so they
 * intersect the four kinds instead of multiplying them into sixteen arms.
 */
export type BadgeProps = (BadgeIconProps | BadgeCountProps | BadgeTextProps | BadgeBlankProps) &
  BadgeColourProps;

// The content and colour props live on the union arms; widen once internally so
// the body can read them without narrowing on each access.
type BadgeAllProps = BadgeBaseProps & {
  icon?: React.ReactNode;
  count?: number;
  max?: number;
  text?: string;
  intent?: Intent;
  saliency?: Saliency;
  color?: React.CSSProperties["color"];
};

/**
 * Badge — a small "component" element type: a filled indicator that shows an
 * `icon`, a `count` (capped by `max`), `text`, or — with none of those — a bare
 * blank indicator. Shares the colour scheme/recipe with `Chip`/`Button`, so
 * `<Badge intent="negative" saliency="high">` matches those with the same props;
 * a per-`size` box and a `round`/`square` silhouette come from its own recipe.
 *
 * A badge is an indicator, not a control: it renders a static `<span>` that is
 * not a hit target, so it takes no hover/active background — that would advertise
 * a click it can't perform. A `render` that makes it a link or button restores
 * them, off the rendered element rather than a prop (see the `interactive`
 * variants in `component.css.ts`).
 */
export function Badge(props: BadgeProps) {
  const {
    intent,
    saliency,
    color,
    size,
    shape,
    render,
    className,
    style,
    ref,
    icon,
    count,
    max,
    text,
    ...htmlProps
  } = props as BadgeAllProps;

  // Exactly one content kind wins, in priority order; none of them means blank.
  let content: React.ReactNode = null;
  if (icon != null) {
    content = icon;
  } else if (count != null) {
    content = max != null && count > max ? `${max}+` : String(count);
  } else if (text != null) {
    content = text;
  }
  const blank = content == null;

  // The escape hatch replaces the palette scheme outright rather than layering
  // over it (see `badgeCustomColor`). The types make the two exclusive, so this
  // picks the one the caller asked for.
  const custom = color != null;

  return useRender({
    render,
    defaultElement: "span",
    props: {
      ref,
      className: cx(
        // The custom-colour scheme is a static style with no hover/active, so
        // only the intent recipe needs guarding. `interactive: "auto"` — a badge
        // is an indicator, not a hit target, so the inert `<span>` it renders by
        // default must not light up under the cursor; only a `render` that makes
        // it a link/button earns that.
        custom
          ? badgeCustomColor
          : componentIntentRecipe({ intent, saliency, interactive: "auto" }),
        badgeRecipe({ size, shape, blank }),
        className,
      ),
      // The consumer's own `style` is spread last so it still wins — this only
      // adds the one custom property the escape hatch reads.
      style: custom ? { ...assignInlineVars({ [badgeColorVar]: color }), ...style } : style,
      children: content,
      ...htmlProps,
    },
  });
}

Badge.displayName = "Badge";
