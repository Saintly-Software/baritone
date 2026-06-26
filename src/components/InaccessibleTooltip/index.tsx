"use client";
import * as React from "react";
import {
  InternalTooltip,
  type InternalTooltipProps,
} from "../../internal/components/InternalTooltip";

export interface InaccessibleTooltipProps extends InternalTooltipProps {
  /**
   * The element the tooltip attaches to — *any* single React element. It's
   * rendered directly (base-ui's `render`), so the element you pass stays the
   * real hover/focus target, with no extra wrapper.
   *
   * ⚠️ If this element isn't natively focusable (a plain `<div>` / `<span>` /
   * icon, etc.), the tooltip is **mouse-hover only** — keyboard and touch users
   * never see it. That's the "inaccessible" in the name. Pass a focusable
   * element (a real `<button>` / `<a>`, or one with `tabIndex={0}`) if the
   * hint matters, and never put anything here that the UI can't function
   * without.
   */
  children: React.ReactElement;
}

/**
 * InaccessibleTooltip — a consumer-facing escape hatch for attaching a tooltip
 * to an *arbitrary* element on hover/focus. It composes `InternalTooltip`, so it
 * shares the exact same tooltip surface as the system's internal hints (UI
 * consistency comes for free).
 *
 * **Why the blunt name.** The system deliberately keeps tooltips off its public
 * surface (see `index.ts`): the *pattern* is easy to misuse — tooltips are
 * invisible to touch and easy to overlook, so they end up carrying information
 * they shouldn't. This component doesn't solve that; it hands you the pattern
 * anyway, under a name that keeps the tradeoff visible at every call site. For
 * anything a user actually needs to read, prefer `Popover` (once it lands);
 * reach for this only for genuinely supplemental hints.
 *
 * Accessibility is entirely on the caller: the tooltip is only keyboard/focus
 * reachable when the element you pass is itself focusable (see `children`).
 */
export function InaccessibleTooltip(props: InaccessibleTooltipProps) {
  return <InternalTooltip {...props} />;
}
