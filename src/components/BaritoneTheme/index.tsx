// NOTE: intentionally NOT a `"use client"` module. Unlike the other components
// (which lean on base-ui hooks), this is a pure wrapper — it computes a set of
// inline CSS custom properties from tokens and renders one element. Keeping it
// server-compatible means it can go straight into an SSR root layout (e.g. a
// Next.js Server Component) where per-tenant tokens are resolved on the server
// and inlined into the first paint — no client boundary, no flash, no hydration
// mismatch.
import * as React from "react";
import { createInlineTheme } from "../../theme/createTheme";
import type { ThemeTokensInput } from "../../theme/contract.css";
import { useRender, type RenderProp } from "../../utils/render";

export interface BaritoneThemeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Token values for this theme scope — e.g. from `buildDefaultTokens`. */
  tokens: ThemeTokensInput;
  /** Colour scheme; sets the oklch interaction direction (`-1` light / `+1` dark). */
  scheme: "light" | "dark";
  /**
   * Render as a different element (base-ui `render` pattern) instead of the
   * default wrapping `<div>` — e.g. apply the theme straight onto your `<body>`
   * to avoid an extra element: `render={<body />}`.
   */
  render?: RenderProp;
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * BaritoneTheme — apply a theme scope by mapping `tokens` to inline CSS custom
 * properties on an element. This is the runtime counterpart to the build-time
 * `createDesignSystemTheme` class: it needs neither the vanilla-extract compiler
 * nor a pre-generated class, so it suits brands whose values only arrive at
 * runtime (per-tenant colours, user-supplied tokens).
 *
 * Scopes nest — a subtree can be wrapped in its own `BaritoneTheme` to use a
 * different brand or `scheme`. Remember to import the pre-compiled stylesheet
 * once at your app root (`import "@saintly-software/baritone/styles.css"`); this
 * component only supplies the token *values*, not the component styles.
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
export function BaritoneTheme({ tokens, scheme, render, style, ref, ...rest }: BaritoneThemeProps) {
  // `isolation: isolate` makes this scope its own stacking context, so any
  // z-indexed app content stays contained below the popups base-ui portals to
  // the end of `<body>` (Tooltip/Popover/Menu/Select/Combobox/Modal/Drawer).
  // Those surfaces therefore need no z-index of their own — they stack above the
  // page by DOM order. Listed first so a consumer `style` can still override it.
  // Consumer `style` spreads last so brand vars stay set while callers can still
  // add layout styles (or deliberately override a single `--var`).
  const themeStyle = {
    isolation: "isolate" as const,
    ...createInlineTheme(tokens, { scheme }),
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
