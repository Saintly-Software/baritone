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

export type ScrollAreaOrientation = "vertical" | "horizontal" | "both";

export interface ScrollAreaProps {
  children: React.ReactNode;

  orientation?: ScrollAreaOrientation;

  "aria-label"?: string;

  className?: string;

  style?: React.CSSProperties;

  ref?: React.Ref<HTMLDivElement>;
}

const fadeClass = {
  vertical: viewportFadeVertical,
  horizontal: viewportFadeHorizontal,
  both: viewportFadeBoth,
} as const;

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
