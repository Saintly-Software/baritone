import * as React from "react";
import {
  type BorderWidthOptions,
  createInlineTheme,
  type FontOptions,
  type FontSizeOptions,
  type FontWeightOptions,
  type LetterSpacingOptions,
  type LineHeightOptions,
} from "../../theme/createTheme";
import type { ThemeTokensInput } from "../../theme/contract.css";
import { useRender, type RenderProp } from "../../utils/render";

export interface BaritoneThemeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    FontOptions,
    LetterSpacingOptions,
    FontSizeOptions,
    FontWeightOptions,
    LineHeightOptions,
    BorderWidthOptions {
  tokens: ThemeTokensInput;

  scheme: "light" | "dark";

  render?: RenderProp;
  ref?: React.Ref<HTMLDivElement>;
}

export function BaritoneTheme({
  tokens,
  scheme,
  fonts,
  defaultFont,
  letterSpacings,
  defaultLetterSpacing,
  sizes,
  weights,
  defaultWeight,
  lineHeights,
  borderWidths,
  render,
  style,
  ref,
  ...rest
}: BaritoneThemeProps) {
  const themeStyle = {
    isolation: "isolate" as const,
    ...createInlineTheme(tokens, {
      scheme,
      fonts,
      defaultFont,
      letterSpacings,
      defaultLetterSpacing,
      sizes,
      weights,
      defaultWeight,
      lineHeights,
      borderWidths,
    }),
    ...style,
  };
  return useRender({
    render,
    defaultElement: "div",
    props: {
      ref,
      style: themeStyle,
      ...rest,
    },
  });
}
