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
 * Props shared by every badge kind. Content is carried by the kind-specific props
 * below rather than `children`; `shape` is orthogonal to the content kind.
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
 * fill is data (a per-tag colour) rather than a design decision. Prefer
 * `intent`/`saliency`, which re-theme with the system; this is frozen at whatever
 * you pass and unchecked for contrast. Mutually exclusive with `intent`/`saliency`.
 */
export interface BadgeCustomColourProps {
  /**
   * Paint the badge any CSS colour, replacing `intent` × `saliency`. The
   * foreground is derived for contrast.
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
  /** The badge's icon — a bare glyph, an `<Icon>`, or a render function. */
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
 * A Badge, as one of four content kinds: `icon`, `count` (optionally `max`),
 * `text`, or blank (none of them). Intersected with {@link BadgeColourProps},
 * since colour and `shape` are orthogonal to the content kind.
 */
export type BadgeProps = (BadgeIconProps | BadgeCountProps | BadgeTextProps | BadgeBlankProps) &
  BadgeColourProps;

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
 * A small "component" element type: a filled indicator showing an `icon`, a
 * `count` (capped by `max`), `text`, or a bare blank dot. Shares the colour
 * recipe with `Chip`/`Button`. An indicator, not a control — a static `<span>`
 * with no hover/active background; a `render` that makes it a link/button restores
 * them off the rendered element.
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

  let content: React.ReactNode = null;
  if (icon != null) {
    content = renderIcon(icon, { state: { intent, saliency, size } });
  } else if (count != null) {
    content = max != null && count > max ? `${max}+` : String(count);
  } else if (text != null) {
    content = text;
  }
  const blank = content == null;

  const custom = color != null;

  return useRender({
    render,
    defaultElement: "span",
    props: {
      ref,
      className: cx(
        custom
          ? badgeCustomColor
          : componentIntentRecipe({ intent, saliency, interactive: "auto" }),
        badgeRecipe({ size, shape, blank }),
        className,
      ),
      style: custom ? { ...assignInlineVars({ [badgeColorVar]: color }), ...style } : style,
      children: content,
      ...htmlProps,
    },
  });
}

Badge.displayName = "Badge";
