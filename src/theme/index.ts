export { vars } from "./contract.css";
export type { DesignTokens, ThemeTokensInput } from "./contract.css";

export {
  createDesignSystemTheme,
  createInlineTheme,
  type CreateThemeOptions,
  type FontOptions,
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
