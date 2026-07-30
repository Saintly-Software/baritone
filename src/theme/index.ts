export { vars } from "./contract.css";
export type { DesignTokens, ThemeTokensInput } from "./contract.css";

export {
  createDesignSystemTheme,
  createInlineTheme,
  type CreateThemeOptions,
  type FontOptions,
  type LetterSpacingOptions,
  type FontSizeOptions,
  type FontWeightOptions,
  type LineHeightOptions,
} from "./createTheme";
export { buildDefaultTokens, type BrandSeed } from "./defaultTokens";

// The consumer-extensible font vocabulary. `FontRegistry` is the module-augmentation
// seam (declare `module "@saintly-software/baritone"` and add keys); `FontName` is
// what the `font` prop accepts.
export {
  fontVarName,
  fontFamilyVars,
  type FontRegistry,
  type FontName,
  type BuiltinFontName,
} from "./fonts";

// The consumer-extensible letter-spacing (tracking) vocabulary, mirroring the font
// seam above. `LetterSpacingRegistry` is the module-augmentation seam;
// `LetterSpacingName` is what the `letterSpacing` prop accepts.
export {
  letterSpacingVarName,
  letterSpacingVars,
  type LetterSpacingRegistry,
  type LetterSpacingName,
  type BuiltinLetterSpacingName,
} from "./letterSpacings";

// The consumer-extensible font-size, font-weight, and line-height vocabularies,
// mirroring the font seam above. Each `*Registry` is a module-augmentation seam;
// each `*Name` is what the matching prop (`size` / `weight` / `lineHeight`) accepts.
export {
  fontSizeVarName,
  fontSizeVars,
  type FontSizeRegistry,
  type FontSizeName,
  type BuiltinFontSizeName,
  type SizeValue,
} from "./fontSizes";
export {
  fontWeightVarName,
  fontWeightVars,
  type FontWeightRegistry,
  type FontWeightName,
  type BuiltinFontWeightName,
} from "./fontWeights";
export {
  lineHeightVarName,
  lineHeightVars,
  type LineHeightRegistry,
  type LineHeightName,
  type BuiltinLineHeightName,
} from "./lineHeights";
export { lightTheme, darkTheme } from "./defaultTheme.css";

export {
  findContrastIssues,
  warnOnContrastIssues,
  AA_BODY,
  AA_LARGE_OR_UI,
  type ContrastIssue,
} from "./contrast";

export {
  contrastRatio,
  parseOklch,
  oklchToLinearRgb,
  relativeLuminance,
  type Oklch,
} from "./color-math";

export { breakpoints, type Breakpoint } from "./breakpoints";

export {
  INTENTS,
  SALIENCIES,
  SURFACE_SALIENCIES,
  FORM_STATES,
  TEXT_SIZES,
  TEXT_WEIGHTS,
  SIZES,
  HEADING_LEVELS,
  FORM_STATE_INTENT,
  HEADING_LEVEL_SIZE,
  HEADING_LEVEL_WEIGHT,
  type Intent,
  type Saliency,
  type SurfaceSaliency,
  type FormState,
  type TextSize,
  type TextWeight,
  type Size,
  type HeadingLevel,
} from "./constants";
