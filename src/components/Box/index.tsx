"use client";
import * as React from "react";
import {
  resolveDisplay,
  resolveWidth,
  type ResponsiveVisibility,
  type WidthShorthand,
} from "../../styles/layoutProps";
import { atoms } from "../../styles/sprinkles.css";
import type { MarginProps, PaddingProps } from "../../styles/spacingProps";
import { cx } from "../../utils/cx";
import { useRender } from "../../utils/render";

/** Element tags a `Box` can render as via the `as` shorthand. */
export type BoxElement = "div" | "span" | "section" | "article";

export interface BoxProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">, MarginProps, PaddingProps {
  /** Render as a different element tag. Default `div`. */
  as?: BoxElement;
  /** `width` shorthand: `fill` (100%), `fit` (fit-content), or `inherit`. */
  width?: WidthShorthand;
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

  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

/**
 * Box — a plain element primitive, so spacing doesn't have to reach for `atoms`
 * directly. Renders a `<div>` by default (pick another tag — `span`, `section`,
 * `article` — with `as`), with the margin (`m` / `mx` / …) and padding (`p` / `px`
 * / …) props wired straight to the spacing scale (each responsive-capable). It's
 * the layout-neutral sibling of `Flex`: no `display: flex`, just a box you can
 * pad, margin, and style.
 */
export function Box({
  as = "div",
  width,
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
  className,
  children,
  ref,
  ...rest
}: BoxProps) {
  return useRender({
    render: undefined,
    defaultElement: as,
    props: {
      ref,
      className: cx(
        atoms({
          // Only emit `display` when a visibility prop is set, so the element
          // otherwise keeps its natural display (`block` for div/section/article,
          // `inline` for span).
          display:
            hideOn || showOn
              ? resolveDisplay(as === "span" ? "inline" : "block", hideOn, showOn)
              : undefined,
          width: resolveWidth(width),
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

Box.displayName = "Box";
