"use client";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import * as React from "react";
import { componentIntentRecipe } from "../../styles/recipes/component.css";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";
import { type IconSlot, renderIcon } from "../Icon/renderIcon";
import { badgeColorVar, badgeCustomColor, badgeRecipe } from "./badge.css";

/** The badge state an `icon` render function can branch on. */
export interface BadgeIconState {
  intent?: Intent;
  saliency?: Saliency;
  size?: Size;
}

/** The badge silhouette: a fully-rounded pill/circle, or a softly-rounded square. */
export type BadgeShape = "round" | "square";

/**
 * Props shared by every badge kind. Content is carried by kind-specific props rather
 * than `children`, so `children` is omitted from the span attributes (as is the
 * native `color`, redefined by the escape hatch below). `shape` is orthogonal to
 * content — any kind can be `square`.
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
 * `<Badge color="#7c3aed" />` — the colour **escape hatch**, for a badge whose fill
 * is data rather than a design decision (a per-tag colour, a customer-chosen label,
 * a language swatch) — values the palette can't enumerate.
 *
 * Prefer `intent`/`saliency` for anything the palette *can* express: those re-theme
 * with the system, this stays frozen at whatever you pass. Mutually exclusive with
 * `intent`/`saliency` (replaces the token scheme outright, so accepting both would
 * leave one silently doing nothing).
 *
 * Text/icon colour is derived from the fill (black or white, whichever survives);
 * the fill itself is used as-is — no theme response, no check against the surface behind it.
 */
export interface BadgeCustomColourProps {
  /**
   * Paint the badge any CSS colour, replacing `intent` × `saliency` — a hex/rgb/oklch
   * value, a custom property, `currentColor`. The foreground is derived for contrast.
   */
  color: NonNullable<React.CSSProperties["color"]>;
  /** Unsupported alongside `color` — the custom fill replaces the palette scheme. */
  intent?: never;
  /** Unsupported alongside `color` — the custom fill replaces the palette scheme. */
  saliency?: never;
}

/**
 * How a badge gets its colour: from the palette ({@link BadgeIntentColourProps},
 * the default) or a caller-supplied CSS colour ({@link BadgeCustomColourProps}).
 * Orthogonal to content kind, so it's intersected with the four kinds rather than multiplying them out.
 */
export type BadgeColourProps = BadgeIntentColourProps | BadgeCustomColourProps;

/** A badge whose content is a single icon — typically an `<Icon>` that inherits the badge's colour. */
export interface BadgeIconProps extends BadgeBaseProps {
  /**
   * The badge's icon — a bare glyph (auto-wrapped in `Icon`), an explicit `<Icon>`,
   * or a `(props, state)` render function. Inherits the badge's foreground via `--iconColor`.
   */
  icon: IconSlot<BadgeIconState>;
  count?: never;
  max?: never;
  text?: never;
}

/** A badge whose content is a number, optionally capped at `max` as `{max}+`. */
export interface BadgeCountProps extends BadgeBaseProps {
  /** A numeric count to show in the badge. */
  count: number;
  /**
   * Caps the displayed count: when `count` exceeds `max`, the badge renders `{max}+`
   * (e.g. `max={99}` shows `99+` for 100).
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
 *   - **icon** — pass `icon`
 *   - **count** — pass `count` (optionally `max`)
 *   - **text** — pass `text`
 *   - **blank** — pass none, for a bare content-less indicator
 *
 * Each kind is independently `round`/`square` via `shape`, and independently
 * coloured by the palette or a custom `color` ({@link BadgeColourProps}) — both axes
 * are orthogonal to content, intersected across the four kinds rather than multiplied into sixteen arms.
 */
export type BadgeProps = (BadgeIconProps | BadgeCountProps | BadgeTextProps | BadgeBlankProps) &
  BadgeColourProps;

// The content and colour props live on the union arms; widen once internally so
// the body can read them without narrowing on each access.
type BadgeAllProps = BadgeBaseProps & {
  icon?: IconSlot<BadgeIconState>;
  count?: number;
  max?: number;
  text?: string;
  intent?: Intent;
  saliency?: Saliency;
  color?: React.CSSProperties["color"];
};

/**
 * Badge — a small "component" element type: a filled indicator showing an `icon`,
 * a `count` (capped by `max`), `text`, or — with none of those — a bare blank
 * indicator. Shares its colour scheme/recipe with `Chip`/`Button`, so
 * `<Badge intent="negative" saliency="high">` matches those; its own recipe supplies
 * a per-`size` box and `round`/`square` silhouette.
 *
 * A badge is an indicator, not a control: its static `<span>` is not a hit target,
 * so it takes no hover/active background (that would advertise a click it can't
 * perform). A `render` that makes it a link or button restores them, keyed off the
 * rendered element rather than a prop (see `interactive` in `component.css.ts`).
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
    content = renderIcon(icon, { state: { intent, saliency, size } });
  } else if (count != null) {
    content = max != null && count > max ? `${max}+` : String(count);
  } else if (text != null) {
    content = text;
  }
  const blank = content == null;

  // The escape hatch replaces the palette scheme outright rather than layering over it.
  // See `badgeCustomColor`; the types make the two exclusive.
  const custom = color != null;

  return useRender({
    render,
    defaultElement: "span",
    props: {
      ref,
      className: cx(
        // The custom-colour scheme is static (no hover/active), so only the intent
        // recipe needs guarding. `interactive: "auto"` — the inert default `<span>`
        // must not light up under the cursor; only a `render` as a link/button earns that.
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
