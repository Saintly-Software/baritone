"use client";
import * as React from "react";
import { srOnly } from "../../../components/SrOnly/srOnly.css";
import { RenderElement, type RenderProp } from "../../../utils/render";

export interface InternalGenericButtonAnchorProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
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
 * The lone exception: an `aria-label` on the disabled-link `<div>` is re-exposed
 * as visually-hidden text content instead (ARIA prohibits `aria-label` on a
 * role-less element), so an icon-only disabled link keeps a perceivable name.
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

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  if (isLink && disabled) {
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
    const resolvedRel = rel ?? (target === "_blank" ? "noopener noreferrer" : undefined);
    const linkProps = {
      ref,
      className,
      onClick: handleClick,
      ...(href != null && { href }),
      ...(target != null && { target }),
      ...(resolvedRel != null && { rel: resolvedRel }),
      children,
      ...rest,
    };

    return <RenderElement render={render} defaultElement="a" props={linkProps} />;
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
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
