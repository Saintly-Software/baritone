"use client";
import * as React from "react";

/**
 * Open-state controls for a controlled overlay surface (`Modal`, `Drawer`),
 * shared by the public `useControlledDrawer` / `useControlledModal` hooks.
 */
export interface ControlledOverlay {
  /** Whether the overlay is currently open. */
  isOpen: boolean;
  /** Opens the overlay. */
  open: () => void;
  /** Closes the overlay. */
  close: () => void;
  /** Flips the open state. */
  toggle: () => void;
  /**
   * Sets the open state directly. Its signature is compatible with a surface's
   * `onOpenChange`, so it MAY be handed back as one to keep state in sync with
   * the overlay's own dismissals (Escape, close button).
   */
  setOpen: (open: boolean) => void;
}

/**
 * Owns the open state of a controlled overlay. Returns the current state plus
 * stable open/close/toggle/setOpen controls. Callers MUST feed `isOpen` and
 * `setOpen` back to the surface as its `open` / `onOpenChange`.
 */
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
