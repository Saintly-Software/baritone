"use client";
import * as React from "react";
import { useRender, type RenderProp } from "../../../utils/render";

export interface InternalGenericButtonAnchorProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  // Colour comes from the design system's intent/saliency model, never the
  // deprecated `color` attribute (matches `Link`). This primitive is style-free
  // regardless — the consumer supplies the look via `className`.
  "color"
> {
  /**
   * Router-link element for **internal**, client-side navigation — the base-ui
   * `render` seam that keeps this router-agnostic (like `Link`/`Card`). Pass your
   * framework's link and it drives the navigation while this component merges the
   * shared props (`className`, `onClick`, `children`, …) onto it, e.g.
   * `render={<NextLink href="/about" />}` or `render={<RouterLink to="/about" />}`.
   * Its presence is what makes this an internal link (see the resolution table on
   * the component).
   */
  render?: RenderProp;
  /**
   * Destination for an **external** link. Its presence (without `render`) renders
   * a real `<a href>`. Ignored once `render` is supplied — the router link owns
   * navigation there.
   */
  href?: string;
  /** Anchor target for the external `<a>` (e.g. `"_blank"`). */
  target?: React.HTMLAttributeAnchorTarget;
  /**
   * Anchor `rel`. Defaults to `"noopener noreferrer"` when `target="_blank"` so a
   * new-tab link can't reach back through `window.opener`; pass your own to
   * override.
   */
  rel?: string;
  /** `type` for the `<button>` render. Defaults to `"button"` (never form-submits). */
  type?: "button" | "submit" | "reset";
  /**
   * Disable the control. Modelled the focusable way (per AGENTS.md), so it never
   * uses the native `disabled` attribute:
   *   - a **link** (internal or external) has no honest disabled HTML — an `<a>`
   *     stays keyboard-navigable and `aria-disabled` is only advisory — so it
   *     collapses to an inert `<div>` (no `href`, out of the a11y tree as a link);
   *   - a **button** stays a `<button>` with `aria-disabled` (still tabbable) and
   *     its activation is swallowed.
   */
  disabled?: boolean;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
}

/**
 * InternalGenericButtonAnchor — the one primitive behind "this thing might be a
 * link, or a button, or nothing". It renders whichever element the props imply
 * and carries no styling of its own, so a consumer can wrap it in any recipe,
 * icon, or content and get consistent element-selection + disabled semantics.
 *
 * Which element it renders (first matching row wins):
 *
 * | Condition                                   | Element                                   |
 * | ------------------------------------------- | ----------------------------------------- |
 * | `render` set, **not** disabled              | the router-link element (internal nav)    |
 * | `href` set (no `render`), **not** disabled  | `<a href>` (external link)                |
 * | a link (`render`/`href`) **and** `disabled` | `<div>` — inert, `aria-disabled`          |
 * | otherwise                                   | `<button type="button">`                  |
 *
 * Disabled follows the house rule (AGENTS.md): never the native `disabled`
 * attribute. A disabled link degrades to a plain `<div>`; a disabled button keeps
 * `aria-disabled` (so it stays focusable and can explain itself) and swallows its
 * click. Everything else — `className`, `style`, `data-*`, `aria-*`, `id`,
 * `tabIndex`, other handlers — passes straight through to the rendered element.
 *
 * **Internal by design — not exported from the package.** Like `InternalButton`,
 * it's a building block the system composes public components from.
 *
 * @example
 * // External link, opens safely in a new tab:
 * <InternalGenericButtonAnchor href="https://x.com" target="_blank" className={link}>
 *   Docs
 * </InternalGenericButtonAnchor>
 *
 * @example
 * // Internal (router) link — the router element owns navigation:
 * <InternalGenericButtonAnchor render={<RouterLink to="/settings" />} className={link}>
 *   Settings
 * </InternalGenericButtonAnchor>
 *
 * @example
 * // Button (no href/render); disabled stays focusable via aria-disabled:
 * <InternalGenericButtonAnchor onClick={save} disabled={saving} className={btn}>
 *   Save
 * </InternalGenericButtonAnchor>
 */
export function InternalGenericButtonAnchor({
  render,
  href,
  target,
  rel,
  type,
  disabled = false,
  onClick,
  className,
  children,
  ref,
  ...rest
}: InternalGenericButtonAnchorProps) {
  const isLink = render != null || href != null;

  // A disabled control swallows its activation (no native `disabled`, so the DOM
  // click still fires) before the consumer's handler runs. Mirrors InternalButton.
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  // A disabled link has no honest HTML form, so it becomes an inert `<div>`: no
  // navigation and no click wired, just the passthrough props and an
  // `aria-disabled` hook for styling/AT. Covers both internal and external links.
  if (isLink && disabled) {
    return (
      <div ref={ref as React.Ref<HTMLDivElement>} aria-disabled className={className} {...rest}>
        {children}
      </div>
    );
  }

  if (isLink) {
    // Shared across both live-link renders (the router element and the `<a>`):
    // default a safe `rel` for new-tab links so they can't reach `window.opener`.
    const resolvedRel = rel ?? (target === "_blank" ? "noopener noreferrer" : undefined);
    const linkProps = {
      ref,
      className,
      onClick: handleClick,
      // `href` rides along even for a router link (matching Card's overlay link):
      // most router links read their own destination, but forwarding it is
      // harmless and lets `href`-based links keep working through `render`.
      ...(href != null && { href }),
      ...(target != null && { target }),
      ...(resolvedRel != null && { rel: resolvedRel }),
      children,
      ...rest,
    };

    // Internal, client-side navigation: hand our props to the consumer's router
    // link via the base-ui render seam. Falls back to a plain `<a>` when `render`
    // is a plain `href` link with no element.
    return useRender({ render, defaultElement: "a", props: linkProps });
  }

  // Not a link → a button. Disabled uses `aria-disabled` (never the native
  // attribute) so it stays focusable, with activation swallowed by `handleClick`.
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      // Default to a non-submitting button so one in a form doesn't submit it.
      type={type ?? "button"}
      aria-disabled={disabled || undefined}
      className={className}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  );
}
