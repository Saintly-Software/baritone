"use client";
import * as React from "react";
import type { RenderProp } from "../../utils/render";

/**
 * The fully-resolved anchor props the design system hands your router link when a
 * `Link` routes through a `LinkProvider`: the `href`, the merged `className`,
 * `children`, and everything else the component computed. Map `href` onto your
 * router's destination prop (`href` for Next.js, `to` for React/TanStack Router)
 * and spread the rest.
 */
export interface LinkRenderProps {
  /** The resolved destination URL — also the no-JS fallback and accessible name source. */
  href: string;
  /** The system's link styling — spread it onto your router link. */
  className?: string;
  children?: React.ReactNode;
  /** Everything else the component merged on (handlers, `ref`, `data-*`, …). */
  [key: string]: unknown;
}

/**
 * Renders your router's link from the resolved {@link LinkRenderProps}. This is
 * the single adapter you write per app; every `Link` beneath the `LinkProvider`
 * then routes through it, keeping the design system's styling while your router
 * owns navigation.
 *
 * @example Next.js — the destination prop is already `href`, so just spread:
 * ```tsx
 * <LinkProvider render={(props) => <NextLink {...props} />}>
 * ```
 * @example React Router / TanStack Router — map `href` onto `to`:
 * ```tsx
 * <LinkProvider render={({ href, ...props }) => <RouterLink to={href} {...props} />}>
 * ```
 */
export type LinkRenderFn = (props: LinkRenderProps) => React.ReactNode;

/**
 * Whether an `href` should be client-routed rather than left as a full-page
 * `<a>` — the default test a {@link LinkProvider} applies. Purely syntactic (SSR-
 * safe, never touches `window`):
 *
 * - **External** (`false`): a scheme (`https:`, `mailto:`, …), a protocol-relative
 *   URL (`//host`), or a fragment-only href (`#footnote` — a same-document jump
 *   the browser owns, which structured routers mishandle).
 * - **Internal** (`true`): an absolute (`/about`) or relative (`./x`) path, or a
 *   `?query`. A path carrying a fragment (`/a#foo`) stays internal.
 */
export function isInternalHref(href: string): boolean {
  if (href.startsWith("//")) return false;
  if (href.startsWith("#")) return false;
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(href)) return false;
  return true;
}

/** The contextual router link a `LinkProvider` publishes to the tree below it. */
interface LinkRenderContextValue {
  /** The consumer's router-link renderer. */
  render: LinkRenderFn;
  /** Which `href`s are client-routed (defaults to {@link isInternalHref}). */
  isInternal: (href: string) => boolean;
}

const LinkRenderContext = React.createContext<LinkRenderContextValue | null>(null);

export interface LinkProviderProps {
  /**
   * Your router's link, as a function of the resolved link props. It's called
   * for every internal `Link` below this provider that doesn't set its own
   * `render`. See {@link LinkRenderFn} for the Next.js / React Router shapes.
   */
  render: LinkRenderFn;
  /**
   * Override which destinations are client-routed. Defaults to
   * {@link isInternalHref}. New-tab (`target`) and `download` links are always
   * left as plain anchors regardless.
   */
  isInternal?: (href: string) => boolean;
  children: React.ReactNode;
}

/**
 * Wire the design system's `Link` to your app's router once, for the whole tree
 * below, instead of threading `render` through every link. Every internal `Link`
 * routes through your router; external, fragment-only, new-tab, and `download`
 * links fall back to a plain `<a>`. Precedence: a per-link `render` wins, else the
 * provider handles internal links, else a plain `<a href>`. Scopes nest.
 *
 * @example
 * // Next.js — the destination prop is already `href`, so just spread:
 * <LinkProvider render={(props) => <Link {...props} />}>
 *   <App />
 * </LinkProvider>;
 *
 * @example
 * // React Router / TanStack Router use `to`, so map `href` onto it:
 * <LinkProvider render={({ href, ...props }) => <RouterLink to={href} {...props} />}>
 *   <App />
 * </LinkProvider>;
 */
export function LinkProvider({ render, isInternal = isInternalHref, children }: LinkProviderProps) {
  const value = React.useMemo<LinkRenderContextValue>(
    () => ({ render, isInternal }),
    [render, isInternal],
  );
  return <LinkRenderContext.Provider value={value}>{children}</LinkRenderContext.Provider>;
}

/**
 * Resolves the `render` a `Link`-like component should hand to `useRender`,
 * honouring an enclosing {@link LinkProvider}. Returns, in order: an explicit
 * per-link `render`; the provider's router link (when the link has an internal
 * `href` and isn't a new-tab / `download` link); or `undefined` (fall back to the
 * caller's `defaultElement`). Call it unconditionally, before any early `return`,
 * to keep hook order stable.
 */
export function useLinkRender(
  explicitRender: RenderProp | undefined,
  link: { href?: string; target?: string; download?: unknown },
): RenderProp | undefined {
  const ctx = React.useContext(LinkRenderContext);

  if (explicitRender != null) return explicitRender;
  if (ctx == null || link.href == null) return undefined;
  if (link.download != null && link.download !== false) return undefined;
  if (link.target != null && link.target !== "_self") return undefined;
  if (!ctx.isInternal(link.href)) return undefined;

  return ctx.render as RenderProp;
}
