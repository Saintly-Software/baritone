"use client";
import * as React from "react";
import type { BodySize, Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import type { RenderProp } from "../../utils/render";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { helpTextRecipe } from "./helptext.css";

/** HelpText's own size scale — a subset of the body type ramp. Default `sm`. */
export type HelpTextVariant = "xs" | "sm" | "md" | "lg";

/** `variant` -> the `Text` body typography size it renders the message at. */
const TEXT_VARIANT: Record<HelpTextVariant, BodySize> = {
  xs: "xs",
  sm: "sm",
  md: "base",
  lg: "lg",
};

/** `variant` -> the `Icon` box size, so the glyph scales with the text. */
const ICON_SIZE: Record<HelpTextVariant, Size> = {
  xs: "sm",
  sm: "sm",
  md: "md",
  lg: "lg",
};

/**
 * A warning triangle — the auto glyph shown for the attention intents
 * (`warning`/`negative`, e.g. via `invalid`) when no explicit `icon` is passed.
 * `currentColor` so it inherits the line's resolved colour.
 */
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
  /** The help / validation message. */
  children: React.ReactNode;
  /** Colour intent. Default `neutral`. Overridden by `invalid`/`disabled`. */
  intent?: Intent;
  /** Colour saliency. Default `mid`. `disabled` forces the dimmed `low`. */
  saliency?: Saliency;
  /** Type size (scales the message and the icon together). Default `sm`. */
  variant?: HelpTextVariant;
  /**
   * A leading glyph — any node (an `<svg>`), wrapped in a colour-inheriting
   * `<Icon>`. Omit to fall back to the auto warning glyph on the attention
   * intents (`warning`/`negative`, incl. `invalid`); other intents show none.
   */
  icon?: React.ReactNode;
  /** Drop the icon entirely, including the auto glyph. */
  hideIcon?: boolean;
  /** Convenience for a validation error: forces `negative` + the auto glyph. */
  invalid?: boolean;
  /** Convenience for a disabled control's help: forces the dimmed `neutral`. */
  disabled?: boolean;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
}

/**
 * HelpText — a single inline help / validation line (icon + text), for use under
 * a form control or standalone. It composes the `Text` and `Icon` primitives:
 * `Text` owns the colour (publishing `--textColor`/`--iconColor`, so the glyph
 * matches) and typography, and the icon scales with the chosen `variant`.
 *
 * Colour comes from `intent` + `saliency` (default `neutral`/`mid`), with two
 * convenience flags that stand in for the common form states: `invalid` maps to
 * `negative` and `disabled` maps to a dimmed `neutral`. On the attention intents
 * (`warning`/`negative`) a warning glyph is shown automatically when no `icon` is
 * given; pass your own `icon`, or `hideIcon` to drop it. The icon is decorative
 * (`aria-hidden`) since the message carries the meaning.
 */
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
  // Resolve the convenience flags onto the colour axes. `disabled` wins over
  // `invalid` — a disabled control's help shouldn't shout an error colour.
  let resolvedIntent: Intent = intent;
  let resolvedSaliency: Saliency = saliency;
  if (invalid) resolvedIntent = "negative";
  if (disabled) {
    resolvedIntent = "neutral";
    resolvedSaliency = "low";
  }

  // Auto glyph only for the attention intents when the caller didn't supply one.
  const attention = resolvedIntent === "warning" || resolvedIntent === "negative";
  const glyph = icon ?? (attention ? <WarningGlyph /> : null);
  const iconNode =
    hideIcon || glyph == null ? null : <Icon size={ICON_SIZE[variant]}>{glyph}</Icon>;

  const textProps = render ? { render } : { as: "p" as const };

  return (
    <Text
      {...textProps}
      ref={ref}
      intent={resolvedIntent}
      saliency={resolvedSaliency}
      variant={TEXT_VARIANT[variant]}
      className={cx(helpTextRecipe({ variant }), className)}
      {...rest}
    >
      {iconNode}
      {children}
    </Text>
  );
}
