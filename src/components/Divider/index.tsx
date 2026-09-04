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
 * Dev-only guard: warn when `thickness` names a `--borderWidth-<name>` the active
 * theme never published, so the rule silently falls back to the `thin` width. Mirrors
 * the typographic guards in `InternalText`.
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
 * Where the label sits along the divider. Inline-logical (RTL-safe) for a
 * horizontal divider; `start` is the top of a vertical one.
 */
export type DividerLabelPosition = "start" | "center" | "end";

/** Overrides for the divider's inner pieces. */
export interface DividerSlotProps {
  /**
   * Props for the label `Text`. Partial — you're layering onto the slot's own
   * defaults, so `slotProps={{ label: { size: "md" } }}` re-tunes just the
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
  /**
   * Rule thickness, by name. Built-ins `thin` (default) and `thick` are always
   * available; other names are consumer-defined via the theme's `borderWidths`
   * option + `BorderWidthRegistry`. Resolves to `var(--borderWidth-<name>)`.
   */
  thickness?: BorderWidthName;
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
 * `borderWidth` — a built-in (`thin` / `thick`) or a name the active theme
 * published — and the margin props (`my`, `mx`, …) space it from its neighbours.
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

  const resolvedStyle = {
    ...assignInlineVars({ [dividerWeightVar]: `var(${borderWidthVarName(thickness)})` }),
    ...style,
  };

  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  const mergedRef = React.useMemo(() => (isDev() ? composeRefs(nodeRef, ref) : ref), [ref]);
  React.useEffect(() => {
    if (!isDev()) return;
    warnIfBorderWidthUnset(nodeRef.current, thickness);
  }, [thickness]);

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
