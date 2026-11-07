"use client";
import * as React from "react";

export interface OverlayHandle {
  close(): void;

  readonly isOpen: boolean;
}

export interface OverlayWithHandle<H extends OverlayHandle> {
  createHandle: () => H;
}

export function useOverlayHandle<H extends OverlayHandle>(overlay: OverlayWithHandle<H>): H {
  return React.useState(() => overlay.createHandle())[0];
}
