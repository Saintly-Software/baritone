"use client";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import * as React from "react";
import { componentIntentRecipe } from "../../styles/recipes/component.css";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";
import { type IconSlot, renderIcon } from "../Icon/renderIcon";
import { badgeColorVar, badgeCustomColor, badgeRecipe } from "./badge.css";

export interface BadgeIconState {
  intent?: Intent;
  saliency?: Saliency;
  size?: Size;
}

export type BadgeShape = "round" | "square";

interface BadgeBaseProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color" | "children"> {
  size?: Size;

  shape?: BadgeShape;

  render?: RenderProp;
  ref?: React.Ref<HTMLSpanElement>;
}

export interface BadgeIntentColourProps {
  intent?: Intent;
  saliency?: Saliency;

  color?: never;
}

export interface BadgeCustomColourProps {
  color: NonNullable<React.CSSProperties["color"]>;

  intent?: never;

  saliency?: never;
}

export type BadgeColourProps = BadgeIntentColourProps | BadgeCustomColourProps;

export interface BadgeIconProps extends BadgeBaseProps {
  icon: IconSlot<BadgeIconState>;
  count?: never;
  max?: never;
  text?: never;
}

export interface BadgeCountProps extends BadgeBaseProps {
  count: number;

  max?: number;
  icon?: never;
  text?: never;
}

export interface BadgeTextProps extends BadgeBaseProps {
  text: string;
  icon?: never;
  count?: never;
  max?: never;
}

export interface BadgeBlankProps extends BadgeBaseProps {
  icon?: never;
  count?: never;
  max?: never;
  text?: never;
}

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
