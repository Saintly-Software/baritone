"use client";
import * as React from "react";
import { componentIntentRecipe } from "../../styles/recipes/component.css";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";
import { badgeRecipe } from "./badge.css";

/** The badge silhouette: a fully-rounded pill/circle, or a softly-rounded square. */
export type BadgeShape = "round" | "square";

/**
 * Props shared by every badge kind. Colour comes from `intent`/`saliency` (not
 * `color`), and the content is carried by the kind-specific props below rather
 * than `children`, so both are removed from the underlying span attributes. The
 * `shape` axis is orthogonal to the content kind — any kind can be `square`.
 */
interface BadgeBaseProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color" | "children"> {
  intent?: Intent;
  saliency?: Saliency;
  size?: Size;
  /** Corner treatment: `round` (default) or `square`. Applies to every kind. */
  shape?: BadgeShape;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLSpanElement>;
}

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
 * Each kind is independently `round` (default) or `square` via `shape`.
 */
export type BadgeProps = BadgeIconProps | BadgeCountProps | BadgeTextProps | BadgeBlankProps;

// The content props live on the union arms; widen once internally so the body
// can read them without narrowing on each access.
type BadgeAllProps = BadgeBaseProps & {
  icon?: React.ReactNode;
  count?: number;
  max?: number;
  text?: string;
};

/**
 * Badge — a small "component" element type: a filled indicator that shows an
 * `icon`, a `count` (capped by `max`), `text`, or — with none of those — a bare
 * blank indicator. Shares the colour scheme/recipe with `Chip`/`Button`, so
 * `<Badge intent="negative" saliency="high">` matches those with the same props;
 * a per-`size` box and a `round`/`square` silhouette come from its own recipe.
 */
export function Badge(props: BadgeProps) {
  const {
    intent,
    saliency,
    size,
    shape,
    render,
    className,
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

  return useRender({
    render,
    defaultElement: "span",
    props: {
      ref,
      className: cx(
        componentIntentRecipe({ intent, saliency }),
        badgeRecipe({ size, shape, blank }),
        className,
      ),
      children: content,
      ...htmlProps,
    },
  });
}

Badge.displayName = "Badge";
