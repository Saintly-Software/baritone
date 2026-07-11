"use client";
import * as React from "react";
import {
  resolveDisplay,
  resolveWidth,
  type ResponsiveVisibility,
  type WidthShorthand,
} from "../../styles/layoutProps";
import { atoms, type Atoms } from "../../styles/sprinkles.css";
import type { MarginProps, PaddingProps } from "../../styles/spacingProps";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";

/** `align-items`, in friendly terms. */
export type FlexAlign = "start" | "center" | "end" | "stretch" | "baseline";
/** `justify-content`, in friendly terms. */
export type FlexJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
/**
 * Flow direction — `row` (default) or `column`. The `*-reverse` directions are
 * intentionally omitted: they flip the visual order without touching the DOM
 * order, which desyncs the reading/tab order from what's on screen (a common
 * accessibility bug). Reorder the children instead.
 */
export type FlexDirection = "row" | "column";

const ALIGN: Record<FlexAlign, NonNullable<Atoms["alignItems"]>> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};

const JUSTIFY: Record<FlexJustify, NonNullable<Atoms["justifyContent"]>> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

/**
 * `align-self`, in friendly terms. Adds `auto` (defer to the container's
 * `align-items`) on top of the container `align` values.
 */
export type FlexItemAlign = FlexAlign | "auto";

const ALIGN_SELF: Record<FlexItemAlign, NonNullable<Atoms["alignSelf"]>> = {
  auto: "auto",
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};

export interface FlexProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">, MarginProps, PaddingProps {
  /** `align-items`. Omit to leave it at the flexbox default (`stretch`). */
  align?: FlexAlign;
  /** `justify-content`. Omit to leave it at the flexbox default (`flex-start`). */
  justify?: FlexJustify;
  /** Gap between children, from the spacing scale (responsive-capable). */
  gap?: Atoms["gap"];
  /** Render as `inline-flex` rather than block `flex`. */
  inline?: boolean;
  /** Flow direction — `row` (default) or `column`. */
  direction?: FlexDirection;
  /** Allow children to wrap onto multiple lines. */
  wrap?: boolean;
  /**
   * `flex-grow` on the container itself — useful when this `Flex` is nested as a
   * child of another flex layout. `true` grows to fill spare space (`1`),
   * `false` stays at `0`.
   */
  grow?: boolean;
  /** `width` shorthand: `fill` (100%), `fit` (fit-content), or `inherit`. */
  width?: WidthShorthand;
  /** `height`, from the atoms sizing scale. */
  height?: Atoms["height"];
  /** `max-width`, from the atoms sizing scale. */
  maxWidth?: Atoms["maxWidth"];
  /** `min-height`, from the atoms sizing scale. */
  minHeight?: Atoms["minHeight"];
  /**
   * Hide at the given breakpoint(s) — responsive `display: none`. Accepts one
   * breakpoint (`"md"`) or a set (`["mobile", "sm"]`).
   */
  hideOn?: ResponsiveVisibility;
  /**
   * Show *only* at the given breakpoint(s); hidden everywhere else. Accepts one
   * breakpoint or a set.
   */
  showOn?: ResponsiveVisibility;

  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

/**
 * Flex — a flexbox container primitive, so common layouts don't have to reach for
 * `atoms` directly. Renders a `<div>` with `display: flex` (or `inline-flex`);
 * `align` / `justify` take friendly values (`start` / `center` / `end` / …) mapped
 * to the flexbox keywords, `direction` / `wrap` set the flow, and the `gap`,
 * margin (`m` / `mx` / …) and padding (`p` / `px` / …) props are wired straight to
 * the spacing scale (each responsive-capable). Use `render` to change the element.
 */
function FlexRoot({
  align,
  justify,
  gap,
  inline,
  direction,
  wrap,
  grow,
  width,
  height,
  maxWidth,
  minHeight,
  hideOn,
  showOn,
  m,
  mx,
  my,
  mt,
  mr,
  mb,
  ml,
  p,
  px,
  py,
  pt,
  pr,
  pb,
  pl,
  render,
  className,
  children,
  ref,
  ...rest
}: FlexProps) {
  return useRender({
    render,
    defaultElement: "div",
    props: {
      ref,
      className: cx(
        atoms({
          display: resolveDisplay(inline ? "inline-flex" : "flex", hideOn, showOn),
          // `direction` is already a valid `flex-direction` keyword (`row` /
          // `column`); undefined leaves it at the flexbox default (row).
          flexDirection: direction,
          flexWrap: wrap ? "wrap" : undefined,
          flexGrow: grow === undefined ? undefined : grow ? 1 : 0,
          alignItems: align ? ALIGN[align] : undefined,
          justifyContent: justify ? JUSTIFY[justify] : undefined,
          gap,
          width: resolveWidth(width),
          height,
          maxWidth,
          minHeight,
          m,
          mx,
          my,
          mt,
          mr,
          mb,
          ml,
          p,
          px,
          py,
          pt,
          pr,
          pb,
          pl,
        }),
        className,
      ),
      children,
      ...rest,
    },
  });
}

FlexRoot.displayName = "Flex";

export interface FlexItemProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">, MarginProps, PaddingProps {
  /**
   * `align-self` — override the container's cross-axis alignment for this child.
   * Alias for `alignSelf` (which wins if both are set).
   */
  align?: FlexItemAlign;
  /** `align-self`. Omit to inherit the container's `align-items` (`auto`). */
  alignSelf?: FlexItemAlign;
  /** `flex-grow`: `true` grows to fill spare space (`1`), `false` stays at `0`. */
  grow?: boolean;
  /** `flex-shrink`: `false` prevents shrinking (`0`); defaults to the flexbox default (`1`). */
  shrink?: boolean;
  /** `width`, from the atoms scale (spacing tokens, `full`, `fit-content`, …). */
  width?: Atoms["width"];
  /** `height`, from the atoms scale. */
  height?: Atoms["height"];
  /** `min-width`, from the atoms scale. */
  minWidth?: Atoms["minWidth"];
  /** `min-height`, from the atoms scale. */
  minHeight?: Atoms["minHeight"];

  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

/**
 * Flex.Item — a flex child with per-child layout knobs, so a single child can
 * override the container without reaching for `atoms` directly. `align` /
 * `alignSelf` set the cross-axis alignment, `grow` / `shrink` control how it
 * flexes, `width` / `height` / `minWidth` / `minHeight` map to the atoms sizing
 * scale, and the margin (`m` / `mx` / …) and padding (`p` / `px` / …) props are
 * wired to the spacing scale (each responsive-capable). Use `render` to change
 * the element. Purely optional — plain children work fine inside `Flex`.
 */
export function FlexItem({
  align,
  alignSelf,
  grow,
  shrink,
  width,
  height,
  minWidth,
  minHeight,
  m,
  mx,
  my,
  mt,
  mr,
  mb,
  ml,
  p,
  px,
  py,
  pt,
  pr,
  pb,
  pl,
  render,
  className,
  children,
  ref,
  ...rest
}: FlexItemProps) {
  const self = alignSelf ?? align;
  return useRender({
    render,
    defaultElement: "div",
    props: {
      ref,
      className: cx(
        atoms({
          alignSelf: self ? ALIGN_SELF[self] : undefined,
          flexGrow: grow === undefined ? undefined : grow ? 1 : 0,
          flexShrink: shrink === undefined ? undefined : shrink ? 1 : 0,
          width,
          height,
          minWidth,
          minHeight,
          m,
          mx,
          my,
          mt,
          mr,
          mb,
          ml,
          p,
          px,
          py,
          pt,
          pr,
          pb,
          pl,
        }),
        className,
      ),
      children,
      ...rest,
    },
  });
}

FlexItem.displayName = "Flex.Item";

/** Flex with its compound parts attached. */
export const Flex = Object.assign(FlexRoot, {
  Item: FlexItem,
});
