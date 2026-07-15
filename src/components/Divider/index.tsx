"use client";
import { Separator as BaseSeparator } from "@base-ui/react/separator";
import type * as React from "react";
import { atoms } from "../../styles/sprinkles.css";
import type { MarginProps } from "../../styles/spacingProps";
import type { BorderWidthKey, Intent, Saliency } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { Text, type TextProps } from "../Text";
import { dividerRoot } from "./divider.css";

/** Which way the rule runs. */
export type DividerOrientation = "horizontal" | "vertical";

/**
 * Where the label sits along the divider. Inline-logical (RTL-safe) for a
 * horizontal divider; `start` is the top of a vertical one.
 */
export type DividerLabelPosition = "start" | "center" | "end";

/** Overrides for the divider's inner pieces. */
export interface DividerSlotProps {
  /**
   * Props for the label `Text`. Partial — you're layering onto the slot's own
   * defaults, so `slotProps={{ label: { variant: "base" } }}` re-tunes just the
   * size and leaves the rest alone.
   */
  label?: Partial<TextProps>;
}

export interface DividerProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">, MarginProps {
  /** Which way the rule runs. Default `horizontal`. */
  orientation?: DividerOrientation;
  /** Colour intent of the rule. Default `neutral`. */
  intent?: Intent;
  /** Prominence of the rule within its intent. Default `low`. */
  saliency?: Saliency;
  /** Rule thickness, from the `borderWidth` tokens. Default `thin`. */
  thickness?: BorderWidthKey;
  /**
   * Label sat in a gap in the rule ("OR", "Today"). A string renders as a `Text`
   * *and* becomes the divider's accessible name; pass `aria-label` alongside any
   * other node to name it (a `separator`'s children are presentational, so its
   * name can only come from `aria-label` / `aria-labelledby`).
   */
  children?: React.ReactNode;
  /** Where the label sits along the divider. Default `center`. */
  labelPosition?: DividerLabelPosition;
  /** Overrides for the label `Text`. */
  slotProps?: DividerSlotProps;
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Divider — a rule that separates content, built on base-ui's `Separator` for
 * the semantics (`role="separator"` plus the `aria-orientation` wiring).
 *
 * The rule is coloured by `intent` × `saliency` — the same vocabulary as
 * `Chip` / `Button` — reading the `component` *border* ramp, so `neutral` / `low`
 * (the default) is the quiet hairline you want almost everywhere, and a louder
 * intent is there when the split itself is meaningful. `thickness` picks a
 * `borderWidth` token; the margin props (`my`, `mx`, …) space it from its
 * neighbours.
 *
 * Pass `children` to label it: the rule breaks around the label, positioned by
 * `labelPosition`. A `vertical` divider stretches to the height of a flex row.
 *
 * @example
 * <Divider my="4" />
 * <Divider>or</Divider>
 * <Divider orientation="vertical" mx="2" />
 */
export function Divider({
  orientation = "horizontal",
  intent = "neutral",
  saliency = "low",
  thickness = "thin",
  labelPosition = "center",
  slotProps,
  className,
  children,
  ref,
  m,
  mx,
  my,
  mt,
  mr,
  mb,
  ml,
  "aria-label": ariaLabel,
  ...rest
}: DividerProps) {
  const labelled = children != null && children !== false;

  // A `separator`'s children are presentational — a screen reader never reads
  // the visible label — so a string label doubles as the accessible name. Only
  // forward `aria-label` when we have one: base-ui's prop merge treats an
  // explicit `undefined` as an override, and would wipe a consumer's own.
  const resolvedAriaLabel = ariaLabel ?? (typeof children === "string" ? children : undefined);
  const ariaProps: Record<string, string> = {};
  if (resolvedAriaLabel != null) ariaProps["aria-label"] = resolvedAriaLabel;

  return (
    <BaseSeparator
      ref={ref}
      orientation={orientation}
      className={cx(
        dividerRoot({ orientation, labelled, labelPosition, intent, saliency, thickness }),
        atoms({ m, mx, my, mt, mr, mb, ml }),
        className,
      )}
      {...ariaProps}
      {...rest}
    >
      {labelled && (
        <Text variant="sm" saliency="mid" {...slotProps?.label}>
          {children}
        </Text>
      )}
    </BaseSeparator>
  );
}

Divider.displayName = "Divider";
