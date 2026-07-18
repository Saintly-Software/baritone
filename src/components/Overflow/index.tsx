"use client";
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import * as React from "react";
import type { SpaceKey } from "../../theme/constants";
import { cx } from "../../utils/cx";
import {
  navButton,
  navChevron,
  root,
  scrollbar,
  thumb,
  track,
  viewport,
  viewportFadeHorizontal,
  viewportFadeVertical,
} from "./overflow.css";

/** Which way the controls flow (and therefore scroll). */
export type OverflowOrientation = "horizontal" | "vertical";

/**
 * How far a nav-button click travels:
 * - `item` — reveal the next control that's clipped at that edge, aligning it
 *   fully into view. Never leaves a control half-cut.
 * - `page` — jump by one viewport (0–300 → 300–600), like Page Up/Down.
 */
export type OverflowScrollMode = "item" | "page";

export interface OverflowProps {
  /**
   * The controls to lay out in a single non-wrapping row (`horizontal`) or
   * column (`vertical`). They keep their intrinsic size and overflow — with a
   * scrollbar, edge fades, and floating nav buttons — instead of wrapping.
   */
  children: React.ReactNode;
  /**
   * Flow + scroll axis. `horizontal` (default) fills the available width and
   * hugs its row's height; `vertical` needs a bounded height (a `maxHeight` /
   * `height` via `className` / `style`) for its column to overflow.
   * @default "horizontal"
   */
  orientation?: OverflowOrientation;
  /**
   * How far a nav-button click scrolls — to the next clipped control (`item`) or
   * by a whole viewport (`page`).
   * @default "item"
   */
  scrollBy?: OverflowScrollMode;
  /**
   * Space between the controls, from the spacing scale.
   * @default "2"
   */
  gap?: SpaceKey;
  /**
   * Accessible label for the button that scrolls toward the start. Defaults to a
   * direction word for the orientation ("Scroll left" / "Scroll up").
   */
  previousLabel?: string;
  /**
   * Accessible label for the button that scrolls toward the end. Defaults to a
   * direction word for the orientation ("Scroll right" / "Scroll down").
   */
  nextLabel?: string;
  /** Accessible name for the scrollable region. */
  "aria-label"?: string;
  /** Extra className merged onto the root element (a good place to bound its size). */
  className?: string;
  /** Inline styles for the root element — typically its bounding height/width. */
  style?: React.CSSProperties;
  /** Ref to the root element. */
  ref?: React.Ref<HTMLDivElement>;
}

/** Default nav-button labels per orientation. */
const NAV_LABELS: Record<OverflowOrientation, { start: string; end: string }> = {
  horizontal: { start: "Scroll left", end: "Scroll right" },
  vertical: { start: "Scroll up", end: "Scroll down" },
};

/** Honour the user's reduced-motion preference for the button-driven scroll. */
function scrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined" || !window.matchMedia) return "auto";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

/**
 * Absolute scroll offset that brings the next clipped control fully into view.
 * Positions are measured from live rects (layout-direction agnostic within an
 * axis) and converted to the viewport's scroll coordinates, so it works for a
 * mixed bag of control sizes. Returns `null` when there's nothing more to reveal
 * that way.
 */
function nextItemOffset(
  vp: HTMLElement,
  tk: HTMLElement,
  horizontal: boolean,
  dir: "start" | "end",
): number | null {
  const items = Array.from(tk.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement,
  );
  if (items.length === 0) return null;

  const vpRect = vp.getBoundingClientRect();
  const scroll = horizontal ? vp.scrollLeft : vp.scrollTop;
  const viewSize = horizontal ? vp.clientWidth : vp.clientHeight;
  const maxScroll = horizontal
    ? vp.scrollWidth - vp.clientWidth
    : vp.scrollHeight - vp.clientHeight;
  // Sub-pixel slack so a control that's *just* flush doesn't count as clipped.
  const TOL = 1;

  // Leading edge / extent of a control in the viewport's scroll coordinates.
  const lead = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return horizontal ? r.left - vpRect.left + scroll : r.top - vpRect.top + scroll;
  };
  const extent = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return horizontal ? r.width : r.height;
  };

  let target: number;
  if (dir === "end") {
    // First control whose trailing edge is past the visible end: align that edge
    // to the viewport's end so the control lands fully in view.
    const next = items.find((el) => lead(el) + extent(el) > scroll + viewSize + TOL);
    if (!next) return null;
    target = lead(next) + extent(next) - viewSize;
  } else {
    // Last control whose leading edge is before the visible start: align that
    // edge to the viewport's start.
    let prev: HTMLElement | undefined;
    for (let i = items.length - 1; i >= 0; i--) {
      const el = items[i];
      if (el && lead(el) < scroll - TOL) {
        prev = el;
        break;
      }
    }
    if (!prev) return null;
    target = lead(prev);
  }

  return Math.max(0, Math.min(target, maxScroll));
}

/** Decorative chevron; the button carries the accessible name. Points right by
 * default — {@link overflow.css} rotates it per orientation/side. */
function Chevron() {
  return (
    <svg
      className={navChevron}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

/**
 * Overflow — a single row (or column) of controls that scrolls instead of
 * wrapping. Built on base-ui's `ScrollArea`, it adds three affordances that all
 * appear only when there's actually more to see in that direction:
 *
 * - **Floating nav buttons** at the start/end edges. Clicking one slides toward
 *   the next clipped control (`scrollBy="item"`) or by a whole viewport
 *   (`scrollBy="page"`). They're pointer conveniences kept out of the tab order
 *   — the keyboard path is to Tab through the controls, which scrolls each
 *   focused control into view on its own.
 * - **Gradient edge fades** that grow in as content hides past an edge (driven
 *   by base-ui's live per-edge overflow metrics) and stay crisp at a flush edge.
 * - **A hover-reveal scrollbar** for pointer dragging.
 *
 * Supports `horizontal` (default) and `vertical` orientations. A vertical
 * `Overflow` needs a bounded height; a horizontal one just needs a bounded width
 * (its container's is enough).
 *
 * @example
 * // A toolbar of actions that scrolls when the window is narrow.
 * <Overflow aria-label="Formatting" style={{ maxWidth: 480 }}>
 *   <Button>Bold</Button>
 *   <Button>Italic</Button>
 *   <Button>Underline</Button>
 *   // …more controls than fit…
 * </Overflow>
 *
 * @example
 * // Vertical, paging a whole viewport per click.
 * <Overflow orientation="vertical" scrollBy="page" aria-label="Filters" style={{ maxHeight: 320 }}>
 *   <Checkbox label="Unread" />
 *   <Checkbox label="Flagged" />
 *   // …more controls than fit…
 * </Overflow>
 */
export function Overflow({
  children,
  orientation = "horizontal",
  scrollBy = "item",
  gap = "2",
  previousLabel,
  nextLabel,
  "aria-label": ariaLabel,
  className,
  style,
  ref,
}: OverflowProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);

  const scroll = (dir: "start" | "end") => {
    const vp = viewportRef.current;
    if (!vp) return;
    const horizontal = orientation === "horizontal";
    const behavior = scrollBehavior();

    let target: number | null = null;
    if (scrollBy === "item" && trackRef.current) {
      target = nextItemOffset(vp, trackRef.current, horizontal, dir);
    }
    if (target === null) {
      // `page` mode, or `item` with nothing measurable: move one viewport.
      const amount = horizontal ? vp.clientWidth : vp.clientHeight;
      const delta = dir === "end" ? amount : -amount;
      vp.scrollBy(horizontal ? { left: delta, behavior } : { top: delta, behavior });
      return;
    }
    vp.scrollTo(horizontal ? { left: target, behavior } : { top: target, behavior });
  };

  const labels = NAV_LABELS[orientation];

  return (
    <BaseScrollArea.Root
      ref={ref}
      data-orientation={orientation}
      className={cx(root, className)}
      style={style}
    >
      <BaseScrollArea.Viewport
        ref={viewportRef}
        aria-label={ariaLabel}
        className={cx(
          viewport,
          orientation === "horizontal" ? viewportFadeHorizontal : viewportFadeVertical,
        )}
      >
        {/* base-ui's Content sets `min-width: fit-content`, so the track overflows
            rather than shrinking to fit. */}
        <BaseScrollArea.Content>
          <div ref={trackRef} className={track({ orientation, gap })}>
            {children}
          </div>
        </BaseScrollArea.Content>
      </BaseScrollArea.Viewport>

      <BaseScrollArea.Scrollbar orientation={orientation} className={scrollbar}>
        <BaseScrollArea.Thumb className={thumb} />
      </BaseScrollArea.Scrollbar>

      {/* Pointer-only scroll affordances (see the component doc): out of the tab
          order, hidden by CSS until their edge overflows. */}
      <button
        type="button"
        data-side="start"
        tabIndex={-1}
        aria-label={previousLabel ?? labels.start}
        className={navButton}
        onClick={() => scroll("start")}
      >
        <Chevron />
      </button>
      <button
        type="button"
        data-side="end"
        tabIndex={-1}
        aria-label={nextLabel ?? labels.end}
        className={navButton}
        onClick={() => scroll("end")}
      >
        <Chevron />
      </button>
    </BaseScrollArea.Root>
  );
}

Overflow.displayName = "Overflow";
