"use client";
import * as React from "react";
import {
  InternalTooltip,
  type InternalTooltipProps,
} from "../../internal/components/InternalTooltip";

export interface InaccessibleTooltipProps extends InternalTooltipProps {
  /**
   * The element the tooltip attaches to — *any* single React element. Rendered
   * directly (base-ui's `render`), so the element you pass stays the real
   * hover/focus target, with no extra wrapper.
   *
   * ⚠️ If this element isn't natively focusable (a plain `<div>`/`<span>`/icon),
   * the tooltip is **mouse-hover only** — keyboard and touch users never see it.
   * That's the "inaccessible" in the name. Pass a focusable element (a real
   * `<button>`/`<a>`, or one with `tabIndex={0}`) if the hint matters, and never
   * put anything here the UI can't function without.
   */
  children: React.ReactElement;
}

/**
 * InaccessibleTooltip — a consumer-facing escape hatch for attaching a tooltip
 * to an *arbitrary* element on hover/focus. Composes `InternalTooltip`, so it
 * shares the exact same surface as the system's internal hints.
 *
 * **Why the blunt name.** The system deliberately keeps tooltips off its public
 * surface (see `index.ts`): the pattern is easy to misuse — invisible to touch,
 * easy to overlook — so it ends up carrying information it shouldn't. This
 * component hands you the pattern anyway, under a name that keeps that tradeoff
 * visible at every call site. Prefer `Popover` (once it lands) for anything a
 * user actually needs to read; reach for this only for genuinely supplemental hints.
 *
 * Accessibility is entirely on the caller: the tooltip is only keyboard/focus
 * reachable when the element you pass is itself focusable (see `children`).
 */
export function InaccessibleTooltip(props: InaccessibleTooltipProps) {
  return <InternalTooltip {...props} />;
}
