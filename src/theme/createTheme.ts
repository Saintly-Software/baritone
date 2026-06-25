import { createTheme } from "@vanilla-extract/css";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { warnOnContrastIssues } from "./contrast";
import { vars, type DesignTokens, type ThemeTokensInput } from "./contract.css";

export interface CreateThemeOptions {
  /** Colour scheme. Sets `oklchOperator` (-1 light / +1 dark). */
  scheme: "light" | "dark";
  /** Label used in contrast warnings. */
  name?: string;
  /**
   * Run the build-time WCAG contrast check. Defaults to on outside production.
   */
  checkContrast?: boolean;
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
  return createTheme(vars, full);
}

/**
 * Runtime theming. Maps a token set to an inline-style object of CSS custom
 * properties (`{ '--…': value }`) you spread onto an element's `style`. Use this
 * for brands whose values only arrive at runtime (e.g. per-tenant colours),
 * since it needs neither the VE compiler nor a pre-generated class.
 */
export function createInlineTheme(
  tokens: ThemeTokensInput,
  options: Pick<CreateThemeOptions, "scheme">,
): Record<string, string> {
  return assignInlineVars(vars, withOperator(tokens, options.scheme));
}
