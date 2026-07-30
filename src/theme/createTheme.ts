import { createTheme, globalStyle } from "@vanilla-extract/css";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { textFontVar, textLetterSpacingVar } from "../styles/vars.css";
import { warnOnContrastIssues } from "./contrast";
import { vars, type DesignTokens, type ThemeTokensInput } from "./contract.css";
import { fontFamilyVars, fontVarName, type FontName } from "./fonts";
import { letterSpacingVarName, letterSpacingVars, type LetterSpacingName } from "./letterSpacings";

/**
 * The consumer-defined font vocabulary for a theme. Each entry publishes a
 * `--font-<name>` custom property whose value is a `font-family` stack; the
 * `font` prop on `Text`/`Heading` selects one by name. `sans`/`mono` are always
 * published from the tokens, so they need no entry here.
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
 * The consumer-defined letter-spacing (tracking) vocabulary for a theme, the
 * tracking analogue of {@link FontOptions}. Each entry publishes a
 * `--letterSpacing-<name>` custom property; the `letterSpacing` prop on
 * `Text`/`Heading` selects one by name. The built-in steps (`tighter`…`widest`)
 * are always published from the tokens, so they need no entry here.
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

export interface CreateThemeOptions extends FontOptions, LetterSpacingOptions {
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
  // `textFontVar` is a vanilla-extract var reference, so it can't be an inline
  // object key directly — `assignInlineVars` maps it to its real property name.
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
  // `isolation: isolate` makes the themed root its own stacking context, so any
  // z-indexed app content stays contained below the popups base-ui portals to the
  // end of `<body>` (Tooltip/Popover/Menu/Select/Combobox/Modal/Drawer) — which is
  // why those surfaces need no z-index of their own. Attached to the generated
  // class itself (not a second class) so the return value stays a single class,
  // safe for `classList.add`. `BaritoneTheme` sets the same via inline style. The
  // `--font-<name>` and `--letterSpacing-<name>` registries ride along on the same
  // root so the `font` and `letterSpacing` props resolve against this theme's
  // vocabulary.
  globalStyle(`.${themeClass}`, {
    isolation: "isolate",
    vars: { ...fontVars(options), ...trackingVars(options) },
  });
  return themeClass;
}

/**
 * Runtime theming. Maps a token set to an inline-style object of CSS custom
 * properties (`{ '--…': value }`) you spread onto an element's `style`. Use this
 * for brands whose values only arrive at runtime (e.g. per-tenant colours),
 * since it needs neither the VE compiler nor a pre-generated class. Pass `fonts`
 * to publish consumer families (`--font-<name>`) and `defaultFont` to pick the
 * family bare text uses; likewise `letterSpacings` / `defaultLetterSpacing` for
 * the tracking vocabulary (`--letterSpacing-<name>`).
 */
export function createInlineTheme(
  tokens: ThemeTokensInput,
  options: Pick<CreateThemeOptions, "scheme"> & FontOptions & LetterSpacingOptions,
): Record<string, string> {
  return {
    ...assignInlineVars(vars, withOperator(tokens, options.scheme)),
    ...fontVars(options),
    ...trackingVars(options),
  };
}
