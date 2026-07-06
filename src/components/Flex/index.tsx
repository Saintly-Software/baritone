"use client";
import * as React from "react";
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

export interface FlexProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    MarginProps,
    PaddingProps {
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
export function Flex({
  align,
  justify,
  gap,
  inline,
  direction,
  wrap,
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
          display: inline ? "inline-flex" : "flex",
          // `direction` is already a valid `flex-direction` keyword (`row` /
          // `column`); undefined leaves it at the flexbox default (row).
          flexDirection: direction,
          flexWrap: wrap ? "wrap" : undefined,
          alignItems: align ? ALIGN[align] : undefined,
          justifyContent: justify ? JUSTIFY[justify] : undefined,
          gap,
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

Flex.displayName = "Flex";
