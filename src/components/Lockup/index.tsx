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

/** The lockup state an `icon` render function can branch on. */
export interface LockupIconState {
  size: NonNullable<IconProps["size"]>;
}

/**
 * Props for the Lockup's title slot, layered onto its defaults (high-saliency,
 * `lg`). Set `level` to render the title as a semantic `Heading` — a pure
 * semantics switch; the visual size still comes from `size`.
 */
export interface LockupTitleSlotProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "color" | "children"
> {
  /** Title size, from the shared type scale (`xs`–`9xl`). Default `lg`. */
  size?: TextSize;
  /** Title font weight. Default `semibold`, shared by the `Text` and `Heading` branches. */
  weight?: TextProps["weight"];
  /** Override the inherited colour with this intent. */
  intent?: Intent;
  /** Saliency of the title colour. Default `high`. */
  saliency?: Saliency;
  /**
   * When set, render the title as a semantic `Heading` at this level (`h1`–`h6`)
   * for the document outline, instead of a plain `Text`.
   */
  level?: HeadingLevel;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  children?: React.ReactNode;
}

/**
 * Overrides layered onto each of the Lockup's three slots' defaults. To replace a
 * slot's content entirely, use the `slots` prop instead.
 */
export interface LockupSlotProps {
  /** Props for the title `Text` (or `Heading`, when `title.level` is set). */
  title?: LockupTitleSlotProps;
  /** Props for the subtitle `Text`. */
  subtitle?: Partial<TextProps>;
  /** Props for the wrapping `Icon`. */
  icon?: Partial<IconProps>;
}

/**
 * ReactNode overrides for the Lockup's three slots — rendered verbatim, replacing
 * the primitive the lockup would build (and bypassing `slotProps`). For full
 * control over a slot's markup; otherwise prefer the content props + `slotProps`.
 */
export interface LockupSlots {
  /** Replaces the wrapped icon. */
  icon?: React.ReactNode;
  /** Replaces the title. */
  title?: React.ReactNode;
  /** Replaces the subtitle. */
  subtitle?: React.ReactNode;
}

export interface LockupProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /**
   * The primary label — the "wordmark". Rendered in a high-saliency `Text`;
   * restyle it, or switch it to a semantic `Heading`, via `slotProps.title`.
   */
  title?: React.ReactNode;
  /**
   * The supporting line beneath the title — the "tagline". Rendered in a small,
   * low-saliency `Text`.
   */
  subtitle?: React.ReactNode;
  /**
   * The mark — a bare glyph (an `<svg>` drawn with `currentColor`, auto-wrapped in
   * an `<Icon>` so it inherits the ambient colour and can be sized via
   * `slotProps.icon`), an explicit `<Icon>`, or a `(props, state)` render function.
   */
  icon?: IconSlot<LockupIconState>;
  /**
   * Visually hide the text column while keeping it in the accessible tree, for
   * an icon-only lockup that a screen reader still announces by its label.
   */
  hideText?: boolean;
  /** Per-slot overrides passed down into the title / subtitle / icon. */
  slotProps?: LockupSlotProps;
  /** ReactNode overrides that replace a slot's content entirely. */
  slots?: LockupSlots;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
}

/** Build the title node — a `Heading` when `level` is set, otherwise a `Text`. */
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

/**
 * An icon locked up with a title and optional subtitle — a media object where the
 * mark sits inline with the stacked text. Each of the three pieces is optional and
 * renders as a system primitive, tunable through `slotProps` or replaceable
 * through `slots`. Colours are inherited from the surrounding surface.
 */
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
