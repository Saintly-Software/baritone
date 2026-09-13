"use client";
import * as React from "react";

export interface ControlledOverlay {
  isOpen: boolean;

  open: () => void;

  close: () => void;

  toggle: () => void;

  setOpen: (open: boolean) => void;
}

export function useControlledOverlay(defaultOpen = false): ControlledOverlay {
  const [isOpen, setOpen] = React.useState(defaultOpen);
  return {
    isOpen,
    open: React.useCallback(() => setOpen(true), []),
    close: React.useCallback(() => setOpen(false), []),
    toggle: React.useCallback(() => setOpen((prev) => !prev), []),
    setOpen,
  };
}
