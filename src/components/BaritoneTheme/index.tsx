// NOTE: intentionally NOT a `"use client"` module. Unlike other components,
// this is a pure wrapper computing inline CSS vars from tokens, which keeps it
// SSR-safe — per-tenant tokens resolve server-side with no client boundary,
// flash, or hydration mismatch.
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
  /** Token values for this theme scope — e.g. from `buildDefaultTokens`. */
  tokens: ThemeTokensInput;
  /** Colour scheme; sets the oklch interaction direction (`-1` light / `+1` dark). */
  scheme: "light" | "dark";
  /**
   * Render as a different element (base-ui `render` pattern) instead of the
   * default `<div>` — e.g. `render={<body />}` to apply the theme straight onto
   * your `<body>`.
   */
  render?: RenderProp;
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * BaritoneTheme — apply a theme scope by mapping `tokens` to inline CSS custom
 * properties on an element. The runtime counterpart to the build-time
 * `createDesignSystemTheme` class: needs neither the vanilla-extract compiler
 * nor a pre-generated class, so it suits brands whose values only arrive at
 * runtime (per-tenant colours, user-supplied tokens).
 *
 * Scopes nest — wrap a subtree in its own `BaritoneTheme` for a different brand
 * or `scheme`. Import the pre-compiled stylesheet once at your app root
 * (`import "@saintly-software/baritone/styles.css"`); this component only
 * supplies the token *values*, not the component styles.
 *
 * @example
 * // Next.js App Router root layout (Server Component)
 * const tokens = buildDefaultTokens(brand.scheme, brand.seed);
 * return (
 *   <html>
 *     <BaritoneTheme tokens={tokens} scheme={brand.scheme} render={<body />}>
 *       {children}
 *     </BaritoneTheme>
 *   </html>
 * );
 */
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
  // `isolation: isolate` makes this scope its own stacking context, so
  // z-indexed app content stays below the popups base-ui portals to `<body>`'s
  // end (Tooltip/Popover/Menu/etc.) — those need no z-index of their own.
  // Listed first so a consumer `style` can override it; `style` spreads last so
  // brand vars stay set while callers can still add layout styles.
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
