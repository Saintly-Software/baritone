"use client";
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import * as React from "react";
import { cx } from "../../utils/cx";
import {
  root,
  scrollbar,
  thumb,
  viewport,
  viewportFadeBoth,
  viewportFadeHorizontal,
  viewportFadeVertical,
} from "./scrollArea.css";

/** Which axes can scroll. `both` shows a horizontal *and* vertical scrollbar. */
export type ScrollAreaOrientation = "vertical" | "horizontal" | "both";

export interface ScrollAreaProps {
  /**
   * The scrollable content. Give the `ScrollArea` a bounded size (a height for
   * `vertical`, a width for `horizontal`, both for `both`) via `className` /
   * `style` — the content scrolls whenever it overflows that box.
   */
  children: React.ReactNode;
  /**
   * Which axes scroll. `vertical` (default) and `horizontal` show one scrollbar;
   * `both` shows both plus the corner where they meet. Scrollbars only ever
   * appear for an axis whose content actually overflows.
   * @default "vertical"
   */
  orientation?: ScrollAreaOrientation;
  /** Accessible name for the scrollable region. */
  "aria-label"?: string;
  /** Extra className merged onto the root element (a good place to set its size). */
  className?: string;
  /** Inline styles for the root element — typically its bounding height/width. */
  style?: React.CSSProperties;
  /** Ref to the root element. */
  ref?: React.Ref<HTMLDivElement>;
}

/** The gradient-fade mask class for each orientation. */
const fadeClass = {
  vertical: viewportFadeVertical,
  horizontal: viewportFadeHorizontal,
  both: viewportFadeBoth,
} as const;

/**
 * A scrollable region built on base-ui's `ScrollArea`, with gradient scroll fades
 * (fading at any edge it can still scroll toward) and hover-reveal scrollbars
 * baked in. `orientation="both"` gives simultaneous horizontal + vertical
 * scrollbars. Give it a bounded size (a `height` / `width`) via `className` /
 * `style`; the content scrolls once it overflows.
 *
 * @example
 * // Vertical (default): a fixed-height panel of long content.
 * <ScrollArea aria-label="Release notes" style={{ height: 320 }}>
 *   <LongArticle />
 * </ScrollArea>
 *
 * @example
 * // Both axes: a wide + tall grid, scrollable in two directions.
 * <ScrollArea orientation="both" aria-label="Data grid" style={{ height: 320, width: 480 }}>
 *   <BigGrid />
 * </ScrollArea>
 */
export function ScrollArea({
  children,
  orientation = "vertical",
  "aria-label": ariaLabel,
  className,
  style,
  ref,
}: ScrollAreaProps) {
  const showVertical = orientation === "vertical" || orientation === "both";
  const showHorizontal = orientation === "horizontal" || orientation === "both";

  return (
    <BaseScrollArea.Root ref={ref} className={cx(root, className)} style={style}>
      <BaseScrollArea.Viewport
        aria-label={ariaLabel}
        className={cx(viewport, fadeClass[orientation])}
      >
        <BaseScrollArea.Content>{children}</BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      {showVertical && (
        <BaseScrollArea.Scrollbar orientation="vertical" className={scrollbar}>
          <BaseScrollArea.Thumb className={thumb} />
        </BaseScrollArea.Scrollbar>
      )}
      {showHorizontal && (
        <BaseScrollArea.Scrollbar orientation="horizontal" className={scrollbar}>
          <BaseScrollArea.Thumb className={thumb} />
        </BaseScrollArea.Scrollbar>
      )}
      {orientation === "both" && <BaseScrollArea.Corner />}
    </BaseScrollArea.Root>
  );
}

ScrollArea.displayName = "ScrollArea";
