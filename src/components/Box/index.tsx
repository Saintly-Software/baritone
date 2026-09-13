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

export type BoxElement = "div" | "span" | "section" | "article";

export interface BoxProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">, MarginProps, PaddingProps {
  as?: BoxElement;

  width?: WidthShorthand;

  hideOn?: ResponsiveVisibility;

  showOn?: ResponsiveVisibility;

  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

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
          display:
            hideOn || showOn
              ? resolveDisplay(as === "span" ? "inline" : "block", hideOn, showOn)
              : undefined,
          width: resolveWidth(width),
          minWidth: "0",
          minHeight: "0",
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
