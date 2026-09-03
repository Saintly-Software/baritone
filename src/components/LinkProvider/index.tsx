"use client";
import * as React from "react";
import type { RenderProp } from "../../utils/render";

/**
 * The props the design system hands your router link when a `Link` (or any
 * component that reads {@link useLinkRender}) routes through a `LinkProvider`.
 * It's the fully-resolved anchor: the destination in `href`, plus the merged
 * `className` (the system's styling), `children`, any `onClick`, the composed
 * `ref`, and whatever `data-*` / `aria-*` the component computed.
 *
 * Map `href` onto whatever prop your router's link uses — `href` for Next.js,
 * `to` for React Router / TanStack Router — and spread the rest so the styling
 * and behaviour ride along.
 */
export interface LinkRenderProps {
  /**
   * The resolved destination URL. It's also the no-JS fallback and the link's
   * accessible name source, so it's always a real URL string (never a router
   * descriptor object).
   */
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
 * Whether an `href` should be handed to the app's client router (a client-side
 * navigation) rather than left as a plain, full-page `<a>`. It's purely
 * *syntactic* so it is safe to run during SSR — it never touches `window`:
 *
 * - **External** (returns `false`): a URL carrying a scheme (`https:`, `http:`,
 *   `mailto:`, `tel:`, `sms:`, …) or a protocol-relative URL (`//host/path`).
 *   These leave your app's origin (or aren't HTTP at all), so a client router
 *   can't own them. A **fragment-only** href (`#footnote-1`) is external too: a
 *   same-document jump to an anchor is browser behaviour, not a navigation, and
 *   routers with structured APIs mishandle it (TanStack Router, for instance,
 *   resolves `to="#foo"` as a relative *path* against the current pathname).
 * - **Internal** (returns `true`): an absolute path (`/about`), a relative one
 *   (`./x`, `../x`, `x`), or a same-document `?query` — the things the router
 *   owns. A path *carrying* a fragment (`/a#foo`) is a real navigation and stays
 *   internal; only a bare `#…` is excluded.
 *
 * It's the default URL test a {@link LinkProvider} applies. Pass the provider
 * your own `isInternal` to widen or narrow it — e.g. to keep a legacy `/admin`
 * subtree on full-page loads while routing everything else.
 */
export function isInternalHref(href: string): boolean {
  // Protocol-relative — see doc above.
  if (href.startsWith("//")) return false;
  // Fragment-only — see doc above.
  if (href.startsWith("#")) return false;
  // A leading URL scheme, per RFC 3986: ALPHA then any of ALPHA / DIGIT / `+` /
  // `-` / `.` — see doc above.
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
   * Override which destinations are client-routed. Receives the `href` and
   * returns `true` to route it through `render`, or `false` to leave a plain
   * `<a>`. Defaults to {@link isInternalHref}.
   *
   * New-tab (`target`) and `download` links are *always* left as plain anchors
   * regardless of this predicate — the browser, not a client router, owns
   * opening a new browsing context or saving a file.
   */
  isInternal?: (href: string) => boolean;
  children: React.ReactNode;
}

/**
 * LinkProvider — wire the design system's `Link` to your app's router once, for
 * the whole tree below it, instead of threading `render` through every link.
 *
 * `Link` stays router-agnostic on its own (it renders a plain styled `<a>`, or
 * takes a per-link `render`). Wrap your app in a `LinkProvider` and every
 * *internal* `Link` — inline or `appearance="button"` — automatically renders
 * through your router's link, keeping the system's styling while the router owns
 * client-side navigation. External links (`https:`, `mailto:`, `tel:`, …),
 * fragment-only links (`#footnote-1` — a same-document jump the browser owns,
 * not a navigation), new-tab links (`target`), and `download`s fall back to a
 * real `<a>`, so a single provider at the root is safe for every kind of link.
 *
 * Precedence for a given `Link`: a per-link `render` prop always wins (the
 * escape hatch — route one link with bespoke router props, or force a plain
 * element); otherwise the provider handles internal links; otherwise it's a
 * plain `<a href>`.
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
  // Publish a stable object so the tree below only re-renders when the router
  // link or the predicate actually changes (wrap `render` in `useCallback` for
  // maximum stability, though an inline function is fine — `Link` isn't memoised).
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
 * 1. `explicitRender` — a per-link `render` always wins (route this one link with
 *    bespoke router props, or force a plain element);
 * 2. the provider's router link — when there is a provider, the link has an
 *    `href`, it's not a new-tab (`target`) or `download` link, and the provider
 *    considers the `href` internal;
 * 3. `undefined` — otherwise, so the caller falls back to its `defaultElement`
 *    (for `Link`, a plain `<a>`).
 *
 * A component becomes router-aware just by routing its own `render` through this:
 *
 * ```tsx
 * const render = useLinkRender(props.render, props);
 * return useRender({ render, defaultElement: "a", props: { href, className, … } });
 * ```
 *
 * Call it unconditionally (it reads context) — before any early `return` so the
 * hook order stays stable.
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
  // New-tab and download links stay real anchors: a client router can't open a
  // new browsing context or save a file — the browser must.
  if (link.download != null && link.download !== false) return undefined;
  if (link.target != null && link.target !== "_self") return undefined;
  // Leave external URLs (and anything the app marks external) as plain anchors.
  if (!ctx.isInternal(link.href)) return undefined;

  // Hand the resolved props to the router link. `LinkRenderFn`'s strict
  // `LinkRenderProps` is the same shape `useRender` passes (a props record with a
  // resolved `href`), so this is a safe widening for the render-callback seam.
  return ctx.render as RenderProp;
}
