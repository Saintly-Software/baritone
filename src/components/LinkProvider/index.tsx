"use client";
import * as React from "react";
import type { RenderProp } from "../../utils/render";

/**
 * The fully-resolved anchor props your router link receives when a `Link`
 * routes through a `LinkProvider`: `href`, merged `className`, `children`,
 * `onClick`, composed `ref`, and computed `data-*`/`aria-*`.
 *
 * Map `href` onto your router's destination prop (`to` for React Router /
 * TanStack Router) and spread the rest.
 */
export interface LinkRenderProps {
  /**
   * The resolved destination URL — always a real string, never a router
   * descriptor object, since it's also the no-JS fallback and accessible name.
   */
  href: string;
  /** The system's link styling — spread it onto your router link. */
  className?: string;
  children?: React.ReactNode;
  /** Everything else the component merged on (handlers, `ref`, `data-*`, …). */
  [key: string]: unknown;
}

/**
 * Renders your router's link from the resolved {@link LinkRenderProps}. Write
 * one per app; every `Link` beneath the `LinkProvider` routes through it,
 * keeping the design system's styling while your router owns navigation.
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
 * Whether an `href` should route through the client router rather than stay a
 * plain, full-page `<a>`. Purely syntactic, so it's safe during SSR — it never
 * touches `window`.
 *
 * - **External** (`false`): a URL with a scheme (`https:`, `mailto:`, …), a
 *   protocol-relative URL (`//host/path`), or a fragment-only href (`#foo`) —
 *   a same-document jump is browser behaviour, not a navigation, and some
 *   routers (TanStack Router included) mishandle a bare `#foo` as a relative path.
 * - **Internal** (`true`): an absolute or relative path, a same-document
 *   `?query`, or a path carrying a fragment (`/a#foo`).
 *
 * This is the default test a {@link LinkProvider} applies; pass your own
 * `isInternal` to widen or narrow it.
 */
export function isInternalHref(href: string): boolean {
  // Protocol-relative — see doc above.
  if (href.startsWith("//")) return false;
  // Fragment-only — see doc above.
  if (href.startsWith("#")) return false;
  // URL scheme per RFC 3986 (ALPHA then ALPHA/DIGIT/+/-/.) — see doc above.
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
   * Your router's link, called for every internal `Link` below this provider
   * that doesn't set its own `render`. See {@link LinkRenderFn} for shapes.
   */
  render: LinkRenderFn;
  /**
   * Override which destinations are client-routed: return `true` to route
   * through `render`, `false` for a plain `<a>`. Defaults to {@link isInternalHref}.
   *
   * New-tab (`target`) and `download` links are always left as plain anchors
   * regardless of this predicate — the browser, not the router, must own them.
   */
  isInternal?: (href: string) => boolean;
  children: React.ReactNode;
}

/**
 * LinkProvider — wire the design system's `Link` to your app's router once,
 * for the whole tree below it, instead of threading `render` through every link.
 *
 * Wrap your app in a `LinkProvider` and every *internal* `Link` — inline or
 * `appearance="button"` — automatically renders through your router's link,
 * keeping the system's styling while the router owns client-side navigation.
 * External links, fragment-only links (`#footnote-1`), new-tab links
 * (`target`), and `download`s always fall back to a real `<a>`, so one
 * provider at the root is safe for every kind of link.
 *
 * Precedence: a per-link `render` prop always wins (the escape hatch);
 * otherwise the provider handles internal links; otherwise it's a plain
 * `<a href>`.
 *
 * Scopes nest — a subtree can supply a different `LinkProvider` (or none) to
 * override the router for that region.
 *
 * @example
 * // App root (Next.js App Router — a client component):
 * import Link from "next/link";
 *
 * <LinkProvider render={(props) => <Link {...props} />}>
 *   <App />
 * </LinkProvider>;
 *
 * // Anywhere below, no `render` needed — this routes through Next's <Link>:
 * <Link href="/dashboard">Dashboard</Link>
 * // …while this stays a plain external anchor:
 * <Link href="https://example.com">Docs</Link>
 *
 * @example
 * // React Router / TanStack Router use `to`, so map `href` onto it:
 * <LinkProvider render={({ href, ...props }) => <RouterLink to={href} {...props} />}>
 *   <App />
 * </LinkProvider>;
 */
export function LinkProvider({ render, isInternal = isInternalHref, children }: LinkProviderProps) {
  // Stable object so the tree below only re-renders when render/isInternal
  // actually change (an inline `render` is fine — `Link` isn't memoised).
  const value = React.useMemo<LinkRenderContextValue>(
    () => ({ render, isInternal }),
    [render, isInternal],
  );
  return <LinkRenderContext.Provider value={value}>{children}</LinkRenderContext.Provider>;
}

/**
 * Resolves the `render` a `Link`-like component should hand to `useRender`,
 * honouring an enclosing {@link LinkProvider}. Returns, in order:
 *
 * 1. `explicitRender`, if given — the per-link escape hatch;
 * 2. the provider's router link, if there is a provider, the link has an
 *    `href`, it isn't new-tab (`target`) or `download`, and the provider
 *    considers the `href` internal;
 * 3. `undefined` otherwise, so the caller falls back to its `defaultElement`.
 *
 * A component becomes router-aware by routing its own `render` through this:
 *
 * ```tsx
 * const render = useLinkRender(props.render, props);
 * return useRender({ render, defaultElement: "a", props: { href, className, … } });
 * ```
 *
 * Call it unconditionally (it reads context), before any early `return`.
 */
export function useLinkRender(
  explicitRender: RenderProp | undefined,
  link: { href?: string; target?: string; download?: unknown },
): RenderProp | undefined {
  const ctx = React.useContext(LinkRenderContext);

  // The per-link escape hatch: an explicit `render` always wins over the provider.
  if (explicitRender != null) return explicitRender;
  // Nothing to route without a provider or a destination.
  if (ctx == null || link.href == null) return undefined;
  // New-tab and download links stay real anchors — the browser must own
  // opening a new browsing context or saving a file, not a client router.
  if (link.download != null && link.download !== false) return undefined;
  if (link.target != null && link.target !== "_self") return undefined;
  // Leave external URLs (and anything the app marks external) as plain anchors.
  if (!ctx.isInternal(link.href)) return undefined;

  // `LinkRenderFn`'s `LinkRenderProps` matches what `useRender` passes (a
  // props record with a resolved `href`), so this is a safe widening.
  return ctx.render as RenderProp;
}
