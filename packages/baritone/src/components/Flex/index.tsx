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

export type FlexAlign = "start" | "center" | "end" | "stretch" | "baseline";

export type FlexJustify = "start" | "center" | "end" | "between" | "around" | "evenly";

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
  align?: FlexAlign;

  justify?: FlexJustify;

  gap?: Atoms["gap"];

  inline?: boolean;

  direction?: FlexDirection;

  wrap?: boolean;

  grow?: boolean;

  width?: WidthShorthand;

  height?: Atoms["height"];

  maxWidth?: Atoms["maxWidth"];

  minWidth?: Atoms["minWidth"];

  minHeight?: Atoms["minHeight"];

  hideOn?: ResponsiveVisibility;

  showOn?: ResponsiveVisibility;

  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

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
  minWidth,
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
          flexDirection: direction,
          flexWrap: wrap ? "wrap" : undefined,
          flexGrow: grow === undefined ? undefined : grow ? 1 : 0,
          alignItems: align ? ALIGN[align] : undefined,
          justifyContent: justify ? JUSTIFY[justify] : undefined,
          gap,
          width: resolveWidth(width),
          height,
          maxWidth,
          minWidth: minWidth ?? "0",
          minHeight: minHeight ?? "0",
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
  align?: FlexItemAlign;

  alignSelf?: FlexItemAlign;

  grow?: boolean;

  shrink?: boolean;

  width?: Atoms["width"];

  height?: Atoms["height"];

  minWidth?: Atoms["minWidth"];

  minHeight?: Atoms["minHeight"];

  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

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
          minWidth: minWidth ?? "0",
          minHeight: minHeight ?? "0",
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

export const Flex = Object.assign(FlexRoot, {
  Item: FlexItem,
});
