"use client";
import * as React from "react";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";
import { Icon, type IconProps } from "../Icon";
import { Text, type TextProps } from "../Text";
import { lockupRoot, lockupText } from "./lockup.css";

/**
 * Props forwarded into each of the Lockup's three slots. Every field is partial:
 * you're layering overrides onto the slot's own defaults, so `slotProps={{ title:
 * { variant: "xl" }, icon: { size: "lg" } }}` just re-sizes those pieces while
 * the rest of the lockup stays as-is. Set `children` here to override the slot's
 * content entirely (rarely needed — prefer the top-level `title` / `subtitle` /
 * `icon` props).
 */
export interface LockupSlotProps {
  /** Props for the title `Text`. */
  title?: Partial<TextProps>;
  /** Props for the subtitle `Text`. */
  subtitle?: Partial<TextProps>;
  /** Props for the wrapping `Icon`. */
  icon?: Partial<IconProps>;
}

export interface LockupProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /**
   * The primary label — the "wordmark". Rendered in a high-saliency `Text`;
   * restyle it (or swap its element to a heading) via `slotProps.title`.
   */
  title?: React.ReactNode;
  /**
   * The supporting line beneath the title — the "tagline". Rendered in a small,
   * low-saliency `Text`.
   */
  subtitle?: React.ReactNode;
  /**
   * The mark. Typically an `<svg>` drawn with `currentColor` (or an `<Icon>`'s
   * children); the lockup wraps it in an `<Icon>` so it inherits the ambient
   * colour and can be sized via `slotProps.icon`.
   */
  icon?: React.ReactNode;
  /** Per-slot overrides passed down into the title / subtitle / icon. */
  slotProps?: LockupSlotProps;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
}

/**
 * Lockup — an icon locked up with a title and optional subtitle, after the logo
 * design idea of a fixed "lockup" of mark and wordmark. A flexible media object:
 * the mark sits inline with the stacked text, each of the three pieces is
 * optional, and each renders as a system primitive (`Icon`, `Text`) you can tune
 * through `slotProps`. Colours are inherited from the surrounding surface, so a
 * lockup drops into a coloured `component`/`surface` and matches automatically.
 */
export function Lockup({
  title,
  subtitle,
  icon,
  slotProps,
  render,
  className,
  ref,
  ...rest
}: LockupProps) {
  const hasText = title != null || subtitle != null;

  return useRender({
    render,
    defaultElement: "div",
    props: {
      ref,
      className: cx(lockupRoot, className),
      children: (
        <>
          {icon != null && (
            <Icon size="lg" {...slotProps?.icon}>
              {icon}
            </Icon>
          )}
          {hasText && (
            <span className={lockupText}>
              {title != null && (
                <Text variant="lg" saliency="high" {...slotProps?.title}>
                  {title}
                </Text>
              )}
              {subtitle != null && (
                <Text variant="sm" saliency="low" {...slotProps?.subtitle}>
                  {subtitle}
                </Text>
              )}
            </span>
          )}
        </>
      ),
      ...rest,
    },
  });
}

Lockup.displayName = "Lockup";
