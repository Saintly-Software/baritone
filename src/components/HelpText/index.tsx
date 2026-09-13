"use client";
import * as React from "react";
import type { Intent, Saliency, Size, TextSize } from "../../theme/constants";
import { cx } from "../../utils/cx";
import type { RenderProp } from "../../utils/render";
import { type IconSlot, renderIcon } from "../Icon/renderIcon";
import { Text } from "../Text";
import { helpTextRecipe } from "./helptext.css";

export interface HelpTextIconState {
  intent: Intent;
  saliency: Saliency;
  size: Size;
}

export type HelpTextVariant = "xs" | "sm" | "md" | "lg";

const TEXT_SIZE: Record<HelpTextVariant, TextSize> = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
};

const ICON_SIZE: Record<HelpTextVariant, Size> = {
  xs: "sm",
  sm: "sm",
  md: "md",
  lg: "lg",
};

function WarningGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden>
      <path
        d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 9v4M12 17h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface HelpTextProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  children: React.ReactNode;

  intent?: Intent;

  saliency?: Saliency;

  variant?: HelpTextVariant;

  icon?: IconSlot<HelpTextIconState>;

  hideIcon?: boolean;

  invalid?: boolean;

  disabled?: boolean;

  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
}

export function HelpText({
  children,
  intent = "neutral",
  saliency = "mid",
  variant = "sm",
  icon,
  hideIcon,
  invalid,
  disabled,
  render,
  className,
  ref,
  ...rest
}: HelpTextProps) {
  let resolvedIntent: Intent = intent;
  let resolvedSaliency: Saliency = saliency;
  if (invalid) resolvedIntent = "negative";
  if (disabled) {
    resolvedIntent = "neutral";
    resolvedSaliency = "low";
  }

  const attention = resolvedIntent === "warning" || resolvedIntent === "negative";
  const glyph = icon ?? (attention ? <WarningGlyph /> : null);
  const iconSize = ICON_SIZE[variant];
  const iconNode = hideIcon
    ? null
    : renderIcon(glyph, {
        props: { size: iconSize },
        state: { intent: resolvedIntent, saliency: resolvedSaliency, size: iconSize },
      });

  const textProps = render ? { render } : { as: "p" as const };

  return (
    <Text
      {...textProps}
      ref={ref}
      intent={resolvedIntent}
      saliency={resolvedSaliency}
      size={TEXT_SIZE[variant]}
      className={cx(helpTextRecipe({ variant }), className)}
      {...rest}
    >
      {iconNode}
      {children}
    </Text>
  );
}
