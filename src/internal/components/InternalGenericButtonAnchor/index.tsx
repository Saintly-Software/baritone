"use client";
import * as React from "react";
import { srOnly } from "../../../components/SrOnly/srOnly.css";
import { RenderElement, type RenderProp } from "../../../utils/render";

export interface InternalGenericButtonAnchorProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  // Colour comes from the design system's intent/saliency model, never the
  // deprecated `color` attribute (matches `Link`); this primitive is style-free.
  "color"
> {
  /**
   * Router-link element for **internal**, client-side navigation — the base-ui
   * `render` seam that keeps this router-agnostic (like `Link`/`Card`). Pass
   * your framework's link; it drives navigation while this component merges the
   * shared props (`className`, `onClick`, `children`, …) onto it. Its presence
   * is what makes this an internal link (see the resolution table below).
   */
  render?: RenderProp;
  /**
   * Destination for an **external** link — renders a real `<a href>` when
   * present without `render`. Ignored once `render` is supplied.
   */
  href?: string;
  /** Anchor target for the external `<a>` (e.g. `"_blank"`). */
  target?: React.HTMLAttributeAnchorTarget;
  /**
   * Anchor `rel`. Defaults to `"noopener noreferrer"` when `target="_blank"` so
   * a new-tab link can't reach back through `window.opener`; override as needed.
   */
  rel?: string;
  /** `type` for the `<button>` render. Defaults to `"button"` (never form-submits). */
  type?: "button" | "submit" | "reset";
  /**
   * Disable the control. Uses `aria-disabled`, never the native `disabled`
   * attribute (per AGENTS.md):
   *   - a **link** has no honest disabled HTML (an `<a>` stays keyboard
   *     navigable and `aria-disabled` is only advisory), so it collapses to an
   *     inert `<div>`, out of the a11y tree;
   *   - a **button** stays a `<button>` with `aria-disabled` (still tabbable)
   *     and its activation is swallowed.
   */
  disabled?: boolean;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
}

/**
 * InternalGenericButtonAnchor — the one primitive behind "this thing might be a
 * link, or a button, or nothing". It renders whichever element the props imply,
 * with no styling of its own, so a consumer gets consistent element-selection +
 * disabled semantics around any recipe, icon, or content.
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
 * Disabled never uses the native `disabled` attribute (AGENTS.md house rule): a
 * disabled link degrades to a plain `<div>`; a disabled button keeps
 * `aria-disabled` (stays focusable) and swallows its click. Everything else —
 * `className`, `style`, `data-*`, `aria-*`, `id`, `tabIndex`, other handlers —
 * passes straight through. Exception: an `aria-label` on the disabled-link
 * `<div>` is re-exposed as visually-hidden text content instead (ARIA forbids
 * `aria-label` on a role-less element), so an icon-only disabled link keeps a
 * perceivable name.
 *
 * **Internal by design — not exported from the package.** A building block the
 * system composes public components from.
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

  // Disabled swallows the activation before the consumer's handler runs (no
  // native `disabled`, so the click still fires). Mirrors InternalButton.
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  // A disabled link has no honest HTML form, so it becomes an inert `<div>`: no
  // navigation or click, just passthrough props and an `aria-disabled` hook.
  if (isLink && disabled) {
    // A role-less `<div>` prohibits `aria-label` (ARIA `generic` role; axe flags
    // `aria-prohibited-attr`), so an icon-only link (whose only child is an
    // `aria-hidden` glyph) would collapse to a nameless control. Re-expose the
    // name as visually-hidden text content instead, and drop the attribute.
    const { "aria-label": ariaLabel, ...inertRest } = rest;
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        aria-disabled
        className={className}
        {...inertRest}
      >
        {ariaLabel != null && <span className={srOnly}>{ariaLabel}</span>}
        {children}
      </div>
    );
  }

  if (isLink) {
    // Default a safe `rel` for new-tab links so they can't reach `window.opener`.
    const resolvedRel = rel ?? (target === "_blank" ? "noopener noreferrer" : undefined);
    const linkProps = {
      ref,
      className,
      onClick: handleClick,
      // `href` rides along even for a router link (matching Card's overlay link)
      // — harmless when unused, and keeps `href`-based links working via `render`.
      ...(href != null && { href }),
      ...(target != null && { target }),
      ...(resolvedRel != null && { rel: resolvedRel }),
      children,
      ...rest,
    };

    // Hands props to the consumer's router link via the base-ui render seam,
    // falling back to a plain `<a>` when `render` carries no element.
    // `RenderElement` (not `useRender`) since this sits behind earlier returns.
    return <RenderElement render={render} defaultElement="a" props={linkProps} />;
  }

  // Not a link → a button; disabled uses `aria-disabled` so it stays focusable.
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
