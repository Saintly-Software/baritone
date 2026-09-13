"use client";
import * as React from "react";
import type { HeadingLevel, Intent, Saliency, TextSize } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";
import { Heading } from "../Heading";
import type { IconProps } from "../Icon";
import { type IconSlot, renderIcon } from "../Icon/renderIcon";
import { Text, type TextProps } from "../Text";
import { lockupRoot, lockupText, lockupTextHidden } from "./lockup.css";

export interface LockupIconState {
  size: NonNullable<IconProps["size"]>;
}

export interface LockupTitleSlotProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "color" | "children"
> {
  size?: TextSize;

  weight?: TextProps["weight"];

  intent?: Intent;

  saliency?: Saliency;

  level?: HeadingLevel;

  render?: RenderProp;
  children?: React.ReactNode;
}

export interface LockupSlotProps {
  title?: LockupTitleSlotProps;

  subtitle?: Partial<TextProps>;

  icon?: Partial<IconProps>;
}

export interface LockupSlots {
  icon?: React.ReactNode;

  title?: React.ReactNode;

  subtitle?: React.ReactNode;
}

export interface LockupProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;

  subtitle?: React.ReactNode;

  icon?: IconSlot<LockupIconState>;

  hideText?: boolean;

  slotProps?: LockupSlotProps;

  slots?: LockupSlots;

  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
}

function renderTitle(title: React.ReactNode, slot: LockupTitleSlotProps | undefined) {
  const { level, size, weight, ...rest } = slot ?? {};
  const shared = { saliency: "high" as const, size: size ?? "lg", weight: weight ?? "semibold" };
  if (level != null) {
    return (
      <Heading level={level} {...shared} {...rest}>
        {title}
      </Heading>
    );
  }
  return (
    <Text {...shared} {...rest}>
      {title}
    </Text>
  );
}

export function Lockup({
  title,
  subtitle,
  icon,
  hideText = false,
  slotProps,
  slots,
  render,
  className,
  ref,
  ...rest
}: LockupProps) {
  const iconSize = slotProps?.icon?.size ?? "lg";
  const iconNode =
    slots?.icon ??
    (icon != null
      ? renderIcon(icon, {
          props: { ...slotProps?.icon, size: iconSize },
          state: { size: iconSize },
        })
      : null);

  const titleNode = slots?.title ?? (title != null ? renderTitle(title, slotProps?.title) : null);

  const subtitleNode =
    slots?.subtitle ??
    (subtitle != null ? (
      <Text size="sm" saliency="low" {...slotProps?.subtitle}>
        {subtitle}
      </Text>
    ) : null);

  const hasText = titleNode != null || subtitleNode != null;

  return useRender({
    render,
    defaultElement: "div",
    props: {
      ref,
      className: cx(lockupRoot, className),
      children: (
        <>
          {iconNode}
          {hasText && (
            <span className={cx(lockupText, hideText && lockupTextHidden)}>
              {titleNode}
              {subtitleNode}
            </span>
          )}
        </>
      ),
      ...rest,
    },
  });
}

Lockup.displayName = "Lockup";
