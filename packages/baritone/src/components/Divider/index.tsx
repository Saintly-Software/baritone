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

export type DividerOrientation = "horizontal" | "vertical";

export type DividerLabelPosition = "start" | "center" | "end";

export interface DividerSlotProps {
  label?: Partial<TextProps>;
}

export interface DividerProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">, MarginProps {
  orientation?: DividerOrientation;

  intent?: Intent;

  saliency?: Saliency;

  thickness?: BorderWidthName;

  children?: React.ReactNode;

  labelPosition?: DividerLabelPosition;

  slotProps?: DividerSlotProps;
  ref?: React.Ref<HTMLDivElement>;
}

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
