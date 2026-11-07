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

export type OverflowOrientation = "horizontal" | "vertical";

export type OverflowScrollMode = "item" | "page";

export interface OverflowProps {
  children: React.ReactNode;

  orientation?: OverflowOrientation;

  scrollBy?: OverflowScrollMode;

  gap?: SpaceKey;

  previousLabel?: string;

  nextLabel?: string;

  "aria-label"?: string;

  className?: string;

  style?: React.CSSProperties;

  ref?: React.Ref<HTMLDivElement>;
}

const NAV_LABELS: Record<OverflowOrientation, { start: string; end: string }> = {
  horizontal: { start: "Scroll left", end: "Scroll right" },
  vertical: { start: "Scroll up", end: "Scroll down" },
};

function scrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined" || !window.matchMedia) return "auto";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

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
  const TOL = 1;

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
    const next = items.find((el) => lead(el) + extent(el) > scroll + viewSize + TOL);
    if (!next) return null;
    target = lead(next) + extent(next) - viewSize;
  } else {
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
        <BaseScrollArea.Content>
          <div ref={trackRef} className={track({ orientation, gap })}>
            {children}
          </div>
        </BaseScrollArea.Content>
      </BaseScrollArea.Viewport>

      <BaseScrollArea.Scrollbar orientation={orientation} className={scrollbar}>
        <BaseScrollArea.Thumb className={thumb} />
      </BaseScrollArea.Scrollbar>

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
