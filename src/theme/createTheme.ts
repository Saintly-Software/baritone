import { createTheme, globalStyle } from "@vanilla-extract/css";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { textFontVar, textLetterSpacingVar, textWeightVar } from "../styles/vars.css";
import { warnOnContrastIssues } from "./contrast";
import { vars, type DesignTokens, type ThemeTokensInput } from "./contract.css";
import { borderWidthVars } from "./borderWidths";
import { fontSizeVars, type SizeValue } from "./fontSizes";
import { fontFamilyVars, fontVarName, type FontName } from "./fonts";
import { fontWeightVarName, fontWeightVars, type FontWeightName } from "./fontWeights";
import { letterSpacingVarName, letterSpacingVars, type LetterSpacingName } from "./letterSpacings";
import { lineHeightVars } from "./lineHeights";

export interface FontOptions {
  fonts?: Record<string, string>;

  defaultFont?: FontName;
}

export interface LetterSpacingOptions {
  letterSpacings?: Record<string, string>;

  defaultLetterSpacing?: LetterSpacingName;
}

export interface FontSizeOptions {
  sizes?: Record<string, string | SizeValue>;
}

export interface FontWeightOptions {
  weights?: Record<string, string>;

  defaultWeight?: FontWeightName;
}

export interface LineHeightOptions {
  lineHeights?: Record<string, string>;
}

export interface BorderWidthOptions {
  borderWidths?: Record<string, string>;
}

export interface CreateThemeOptions
  extends
    FontOptions,
    LetterSpacingOptions,
    FontSizeOptions,
    FontWeightOptions,
    LineHeightOptions,
    BorderWidthOptions {
  scheme: "light" | "dark";

  name?: string;

  checkContrast?: boolean;
}

function fontVars({ fonts, defaultFont }: FontOptions): Record<string, string> {
  const family = fontFamilyVars(fonts);
  if (defaultFont === undefined) return family;
  return { ...family, ...assignInlineVars({ [textFontVar]: `var(${fontVarName(defaultFont)})` }) };
}

function trackingVars({
  letterSpacings,
  defaultLetterSpacing,
}: LetterSpacingOptions): Record<string, string> {
  const scale = letterSpacingVars(letterSpacings);
  if (defaultLetterSpacing === undefined) return scale;
  return {
    ...scale,
    ...assignInlineVars({
      [textLetterSpacingVar]: `var(${letterSpacingVarName(defaultLetterSpacing)})`,
    }),
  };
}

function weightVars({ weights, defaultWeight }: FontWeightOptions): Record<string, string> {
  const scale = fontWeightVars(weights);
  if (defaultWeight === undefined) return scale;
  return {
    ...scale,
    ...assignInlineVars({ [textWeightVar]: `var(${fontWeightVarName(defaultWeight)})` }),
  };
}

function withOperator(tokens: ThemeTokensInput, scheme: "light" | "dark"): DesignTokens {
  return { ...tokens, oklchOperator: scheme === "dark" ? "1" : "-1" };
}

function shouldCheck(options: CreateThemeOptions): boolean {
  if (options.checkContrast !== undefined) return options.checkContrast;
  return typeof process === "undefined" || process.env.NODE_ENV !== "production";
}

export function createDesignSystemTheme(
  tokens: ThemeTokensInput,
  options: CreateThemeOptions,
): string {
  const full = withOperator(tokens, options.scheme);
  if (shouldCheck(options)) {
    warnOnContrastIssues(full, options.name ?? options.scheme);
  }
  const themeClass = createTheme(vars, full);
  globalStyle(`.${themeClass}`, {
    isolation: "isolate",
    vars: {
      ...fontVars(options),
      ...trackingVars(options),
      ...fontSizeVars(options.sizes),
      ...weightVars(options),
      ...lineHeightVars(options.lineHeights),
      ...borderWidthVars(options.borderWidths),
    },
  });
  return themeClass;
}

export function createInlineTheme(
  tokens: ThemeTokensInput,
  options: Pick<CreateThemeOptions, "scheme"> &
    FontOptions &
    LetterSpacingOptions &
    FontSizeOptions &
    FontWeightOptions &
    LineHeightOptions &
    BorderWidthOptions,
): Record<string, string> {
  return {
    ...assignInlineVars(vars, withOperator(tokens, options.scheme)),
    ...fontVars(options),
    ...trackingVars(options),
    ...fontSizeVars(options.sizes),
    ...weightVars(options),
    ...lineHeightVars(options.lineHeights),
    ...borderWidthVars(options.borderWidths),
  };
}
