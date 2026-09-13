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

/**
 * The consumer-defined font vocabulary for a theme. Each entry publishes a
 * `--font-<name>` family stack, selected by the `font` prop. `sans`/`mono` are
 * always published from the tokens.
 */
export interface FontOptions {
  /** Extra named families, e.g. `{ display: '"Playfair Display", serif' }`. */
  fonts?: Record<string, string>;
  /**
   * The family a bare `<Text>`/`<Heading>` (no `font` prop) uses. Defaults to
   * `sans`. Set e.g. `"mono"` so a code-focused app is monospace by default.
   */
  defaultFont?: FontName;
}

/**
 * The consumer-defined letter-spacing vocabulary, the tracking analogue of
 * {@link FontOptions}. Each entry publishes a `--letterSpacing-<name>`, selected
 * by the `letterSpacing` prop; the built-in steps are always published.
 */
export interface LetterSpacingOptions {
  /** Extra named tracking values, e.g. `{ eyebrow: "0.2em" }`. */
  letterSpacings?: Record<string, string>;
  /**
   * The tracking a bare `<Text>`/`<Heading>` (no `letterSpacing` prop) uses.
   * Defaults to `normal`. Set e.g. `"tight"` for a display-led brand.
   */
  defaultLetterSpacing?: LetterSpacingName;
}

/**
 * The consumer-defined font-size vocabulary, the size analogue of
 * {@link FontOptions}. Each entry publishes a `--fontSize-<name>`, selected by the
 * `size` prop; the built-in ramp (`xs`…`9xl`) is always published. An entry is a
 * bare `font-size` or a `{ fontSize, lineHeight }` pair carrying the paired default leading.
 */
export interface FontSizeOptions {
  /**
   * Extra named font-sizes. A string is a `font-size` (`{ hero: "4rem" }`); a
   * `{ fontSize, lineHeight }` pair also sets the size's paired default leading
   * (`{ hero: { fontSize: "4rem", lineHeight: "1.05" } }`).
   */
  sizes?: Record<string, string | SizeValue>;
}

/**
 * The consumer-defined font-weight vocabulary, the weight analogue of
 * {@link FontOptions}. Each entry publishes a `--fontWeight-<name>`, selected by
 * the `weight` prop; the built-in steps are always published.
 */
export interface FontWeightOptions {
  /** Extra named weights, e.g. `{ black: "900" }`. */
  weights?: Record<string, string>;
  /**
   * The weight a bare `<Text>` uses. Defaults to `default`. (`Heading` applies its
   * own per-level weight, so this affects `Text`.)
   */
  defaultWeight?: FontWeightName;
}

/**
 * The consumer-defined line-height vocabulary, the leading analogue of
 * {@link FontOptions}. Each entry publishes a `--lineHeight-<name>`, selected by
 * the `lineHeight` prop; the built-in steps are always published.
 */
export interface LineHeightOptions {
  /** Extra named leadings, e.g. `{ airy: "2.2" }`. */
  lineHeights?: Record<string, string>;
}

/**
 * The consumer-defined border-width vocabulary, the rule-weight analogue of
 * {@link FontSizeOptions}. Each entry publishes a `--borderWidth-<name>`, selected
 * by a border-width prop (e.g. Divider's `thickness`); the built-in steps are
 * always published.
 */
export interface BorderWidthOptions {
  /** Extra named widths, e.g. `{ hair: "0.5px" }`. */
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
  /** Colour scheme. Sets `oklchOperator` (-1 light / +1 dark). */
  scheme: "light" | "dark";
  /** Label used in contrast warnings. */
  name?: string;
  /**
   * Run the build-time WCAG contrast check. Defaults to on outside production.
   */
  checkContrast?: boolean;
}

/**
 * The `{ [cssVar]: value }` payload that carries the font registry onto a theme
 * root: the `--font-<name>` families plus, when a `defaultFont` is set, the
 * `--textFont` var that makes bare text use it. Shared by the build-time
 * (`globalStyle`) and runtime (`assignInlineVars`) paths so they stay in step.
 */
function fontVars({ fonts, defaultFont }: FontOptions): Record<string, string> {
  const family = fontFamilyVars(fonts);
  if (defaultFont === undefined) return family;
  return { ...family, ...assignInlineVars({ [textFontVar]: `var(${fontVarName(defaultFont)})` }) };
}

/**
 * The tracking counterpart to {@link fontVars}: the `--letterSpacing-<name>` scale
 * plus, when a `defaultLetterSpacing` is set, the `--textLetterSpacing` var that
 * makes bare text use it. Shared by the build-time (`globalStyle`) and runtime
 * (`assignInlineVars`) paths so they stay in step.
 */
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

/**
 * The weight counterpart to {@link fontVars}: the `--fontWeight-<name>` scale plus,
 * when a `defaultWeight` is set, the `--textWeight` var that makes bare text use it.
 * (`sizes`/`lineHeights` have no default-seed twin — `size` is always applied by the
 * components, so `--textSize`/`--textLineHeight` are set per instance regardless — so
 * they publish their scales directly via `fontSizeVars`/`lineHeightVars`.)
 */
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

/**
 * Theme factory. Takes a full set of token values (the dev's brand/scheme) and
 * returns a vanilla-extract theme *class*. Apply the class to a root element to
 * activate the theme; swap the class to switch brand or light/dark. Nesting is
 * supported, so a subtree can use a different theme.
 *
 * NOTE: this calls vanilla-extract's `createTheme`, which requires the VE
 * compiler. Use it inside a `.css.ts` file (build time). For runtime-supplied
 * brands without the VE plugin, use {@link createInlineTheme} instead.
 */
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

/**
 * Runtime theming. Maps a token set to an inline-style object of CSS custom
 * properties you spread onto an element's `style`, for brands whose values only
 * arrive at runtime — it needs neither the VE compiler nor a pre-generated class.
 * The consumer-vocabulary options (`fonts` / `sizes` / `weights` / …) publish the
 * same `--<name>` properties as {@link createDesignSystemTheme}.
 */
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
