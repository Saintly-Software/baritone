"use client";
import * as React from "react";
import { componentIntentRecipe } from "../../styles/recipes/component.css";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";
import { badgeRecipe } from "./badge.css";

/**
 * Props shared by every badge shape. Colour comes from `intent`/`saliency` (not
 * `color`), and the content is carried by the shape-specific props below rather
 * than `children`, so both are removed from the underlying span attributes.
 */
interface BadgeBaseProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color" | "children"> {
  intent?: Intent;
  saliency?: Saliency;
  size?: Size;
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

/** A content-less badge — a small dot indicator. */
export interface BadgeDotProps extends BadgeBaseProps {
  icon?: never;
  count?: never;
  max?: never;
  text?: never;
}

/**
 * A Badge, as one of four shapes discriminated by its content prop:
 *   - **icon** — pass `icon`,
 *   - **count** — pass `count` (optionally `max`),
 *   - **text** — pass `text`,
 *   - **dot** — pass none of them for a bare indicator dot.
 */
export type BadgeProps = BadgeIconProps | BadgeCountProps | BadgeTextProps | BadgeDotProps;

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
 * dot. Shares the colour scheme/recipe with `Chip`/`Button`, so
 * `<Badge intent="negative" saliency="high">` matches those with the same props;
 * a fully-rounded silhouette and a per-`size` box come from its own recipe.
 */
export function Badge(props: BadgeProps) {
  const { intent, saliency, size, render, className, ref, icon, count, max, text, ...htmlProps } =
    props as BadgeAllProps;

  // Exactly one content shape wins, in priority order; none of them means a dot.
  let content: React.ReactNode = null;
  if (icon != null) {
    content = icon;
  } else if (count != null) {
    content = max != null && count > max ? `${max}+` : String(count);
  } else if (text != null) {
    content = text;
  }
  const dot = content == null;

  return useRender({
    render,
    defaultElement: "span",
    props: {
      ref,
      className: cx(
        componentIntentRecipe({ intent, saliency }),
        badgeRecipe({ size, dot }),
        className,
      ),
      children: content,
      ...htmlProps,
    },
  });
}

Badge.displayName = "Badge";
