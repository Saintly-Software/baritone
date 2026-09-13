"use client";
import * as React from "react";
import { srOnly } from "../../../components/SrOnly/srOnly.css";
import { RenderElement, type RenderProp } from "../../../utils/render";

export interface InternalGenericButtonAnchorProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "color"
> {
  /**
   * Router-link element for **internal** navigation (the base-ui `render` seam).
   * Its presence makes this an internal link — see the resolution table below.
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
   * Disable the control, the focusable way (per AGENTS.md), never the native
   * attribute: a link collapses to an inert `<div>`; a button stays a `<button>`
   * with `aria-disabled` and swallowed activation.
   */
  disabled?: boolean;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
}

/**
 * The one primitive behind "this thing might be a link, a button, or nothing". It
 * renders whichever element the props imply, with no styling of its own.
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
 * Disabled never uses the native attribute (AGENTS.md). Everything else passes
 * through to the rendered element; the exception is an `aria-label` on the
 * disabled-link `<div>`, re-exposed as visually-hidden text (ARIA prohibits
 * `aria-label` on a role-less element). Internal — not exported.
 *
 * @example
 * <InternalGenericButtonAnchor render={<RouterLink to="/settings" />} className={link}>
 *   Settings
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
