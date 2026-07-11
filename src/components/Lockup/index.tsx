"use client";
import * as React from "react";
import type { BodySize, HeadingLevel, Intent, Saliency, TitleSize } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";
import { Heading } from "../Heading";
import { Icon, type IconProps } from "../Icon";
import { Text, type TextProps } from "../Text";
import { lockupRoot, lockupText, lockupTextHidden } from "./lockup.css";

/**
 * Props for the Lockup's title slot. It layers onto the title's own defaults
 * (high-saliency, `lg` variant). Set `level` to render the title as a semantic
 * `Heading` (`h1`–`h6`) instead of a `Text` — a pure semantics switch, so the
 * visual size still comes from `variant` and the lockup looks the same either
 * way. The `sm`/`base`/`lg`/`xl` sizes overlap between the body and title
 * scales, so a `variant` set here works whether or not `level` is present.
 */
export interface LockupTitleSlotProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "color" | "children"
> {
  /** Title size — a `body` (`Text`) or `title` (`Heading`) variant. Default `lg`. */
  variant?: BodySize | TitleSize;
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
 * Props forwarded into each of the Lockup's three slots. Every field is partial:
 * you're layering overrides onto the slot's own defaults, so `slotProps={{ title:
 * { variant: "xl" }, icon: { size: "lg" } }}` just re-sizes those pieces while
 * the rest of the lockup stays as-is. To replace a slot's content entirely, use
 * the `slots` prop instead.
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
 * ReactNode overrides for the Lockup's three slots. A slot given here is rendered
 * verbatim, replacing the primitive the lockup would otherwise build from the
 * top-level `icon` / `title` / `subtitle` props (and bypassing that slot's
 * `slotProps`). Use this when you need full control over a slot's markup;
 * otherwise prefer the top-level content props with `slotProps` tweaks.
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
   * The mark. Typically an `<svg>` drawn with `currentColor` (or an `<Icon>`'s
   * children); the lockup wraps it in an `<Icon>` so it inherits the ambient
   * colour and can be sized via `slotProps.icon`.
   */
  icon?: React.ReactNode;
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
  const { level, variant, ...rest } = slot ?? {};
  if (level != null) {
    return (
      <Heading level={level} saliency="high" variant={(variant as TitleSize) ?? "lg"} {...rest}>
        {title}
      </Heading>
    );
  }
  return (
    <Text saliency="high" variant={(variant as BodySize) ?? "lg"} {...rest}>
      {title}
    </Text>
  );
}

/**
 * Lockup — an icon locked up with a title and optional subtitle, after the logo
 * design idea of a fixed "lockup" of mark and wordmark. A flexible media object:
 * the mark sits inline with the stacked text, each of the three pieces is
 * optional, and each renders as a system primitive (`Icon`, `Text`/`Heading`)
 * you can tune through `slotProps` or replace wholesale through `slots`. Colours
 * are inherited from the surrounding surface, so a lockup drops into a coloured
 * `component`/`surface` and matches automatically.
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
  const iconNode =
    slots?.icon ??
    (icon != null ? (
      <Icon size="lg" {...slotProps?.icon}>
        {icon}
      </Icon>
    ) : null);

  const titleNode = slots?.title ?? (title != null ? renderTitle(title, slotProps?.title) : null);

  const subtitleNode =
    slots?.subtitle ??
    (subtitle != null ? (
      <Text variant="sm" saliency="low" {...slotProps?.subtitle}>
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
