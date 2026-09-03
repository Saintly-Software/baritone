"use client";
import { Separator as BaseSeparator } from "@base-ui/react/separator";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import * as React from "react";
import { isDev, warnIfVarUnset } from "../../internal/warnUnsetVar";
import { atoms } from "../../styles/sprinkles.css";
import type { MarginProps } from "../../styles/spacingProps";
import { borderWidthVarName, type BorderWidthName } from "../../theme/borderWidths";
import type { Intent, Saliency } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { composeRefs } from "../../utils/render";
import { Text, type TextProps } from "../Text";
import { dividerRoot, dividerWeightVar } from "./divider.css";

/**
 * Dev-only: warn when `thickness` names a `--borderWidth-<name>` the theme
 * never published (the rule silently falls back to `thin`). Mirrors
 * `InternalText`'s guards.
 */
function warnIfBorderWidthUnset(el: HTMLElement | null, name: string): void {
  warnIfVarUnset(
    el,
    borderWidthVarName(name),
    () =>
      `[baritone] thickness="${name}": the CSS variable ${borderWidthVarName(name)} isn't set in ` +
      `this element's theme, so the rule falls back to the \`thin\` width. Publish the width via ` +
      `the theme's \`borderWidths\` option (e.g. \`borderWidths: { ${name}: '0.5px' }\` on ` +
      "`createInlineTheme` / `createDesignSystemTheme` / `BaritoneTheme`), or use a built-in " +
      "(`thin` / `thick`). Declare the name on `BorderWidthRegistry` for autocompletion.",
  );
}

/** Which way the rule runs. */
export type DividerOrientation = "horizontal" | "vertical";

/**
 * Where the label sits along the divider: inline-logical (RTL-safe) when
 * horizontal; `start` is the top when vertical.
 */
export type DividerLabelPosition = "start" | "center" | "end";

/** Overrides for the divider's inner pieces. */
export interface DividerSlotProps {
  /**
   * Props for the label `Text`. Partial — layered onto the slot's own
   * defaults, e.g. `slotProps={{ label: { size: "md" } }}`.
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
  /**
   * Rule thickness, by name. `thin` (default) and `thick` are always
   * available; other names come from the theme's `borderWidths` option.
   * Resolves to `var(--borderWidth-<name>)`.
   */
  thickness?: BorderWidthName;
  /**
   * Label sat in a gap in the rule ("OR", "Today"). A string renders as `Text`
   * and becomes the divider's accessible name; for any other node, pass
   * `aria-label` too (a `separator`'s children are presentational).
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
 * the semantics (`role="separator"` plus `aria-orientation`).
 *
 * Coloured by `intent` × `saliency` — the same vocabulary as `Chip` / `Button`
 * — so `neutral` / `low` (the default) is the quiet hairline you want almost
 * everywhere, with a louder intent when the split itself is meaningful.
 * `thickness` picks a `borderWidth`; margin props (`my`, `mx`, …) space it
 * from its neighbours.
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
  style,
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

  // `thickness` is an inline var, not a recipe variant, since the `borderWidth`
  // vocabulary is open. Consumer `style` spreads last so it can still override.
  const resolvedStyle = {
    ...assignInlineVars({ [dividerWeightVar]: `var(${borderWidthVarName(thickness)})` }),
    ...style,
  };

  // Dev-only: compose an internal ref to read the node's computed style after
  // mount. In production this is a no-op and the consumer's `ref` passes through.
  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  const mergedRef = React.useMemo(() => (isDev() ? composeRefs(nodeRef, ref) : ref), [ref]);
  React.useEffect(() => {
    if (!isDev()) return;
    warnIfBorderWidthUnset(nodeRef.current, thickness);
  }, [thickness]);

  // A `separator`'s children are presentational, so a string label doubles as
  // the accessible name. Only forward `aria-label` when set — base-ui's merge
  // treats an explicit `undefined` as an override.
  const resolvedAriaLabel = ariaLabel ?? (typeof children === "string" ? children : undefined);
  const ariaProps: Record<string, string> = {};
  if (resolvedAriaLabel != null) ariaProps["aria-label"] = resolvedAriaLabel;

  return (
    <BaseSeparator
      ref={mergedRef}
      orientation={orientation}
      className={cx(
        dividerRoot({ orientation, labelled, labelPosition, intent, saliency }),
        atoms({ m, mx, my, mt, mr, mb, ml }),
        className,
      )}
      style={resolvedStyle}
      {...ariaProps}
      {...rest}
    >
      {labelled && (
        <Text size="sm" saliency="mid" {...slotProps?.label}>
          {children}
        </Text>
      )}
    </BaseSeparator>
  );
}

Divider.displayName = "Divider";
