"use client";
import * as React from "react";

/**
 * The imperative handle shared by the overlay surfaces (`Modal`, `Popover`,
 * `Drawer`). Baritone's overlays are declarative first — a `.Close` part plus
 * controlled `open` / `onOpenChange`. This is the deliberately small escape
 * hatch for the one case that model handles awkwardly: closing after an `await`
 * without lifting `open` into component state.
 *
 * It is a structural view of base-ui's own `DialogHandle` / `PopoverHandle`, so
 * it stays a strict subset of what each overlay's `handle` prop accepts.
 */
export interface OverlayHandle {
  /**
   * Closes the overlay. Routed through the same path as every other dismissal,
   * so it fires `onOpenChange`, respects a controlled `open`, and is still
   * vetoed while the overlay is `disabled`.
   */
  close(): void;
  /** Whether the overlay is currently open. */
  readonly isOpen: boolean;
}

/**
 * A baritone overlay that can mint an imperative handle. `Modal`, `Popover`, and
 * `Drawer` each expose a `createHandle` (re-exported from base-ui).
 */
export interface OverlayWithHandle<H extends OverlayHandle> {
  createHandle: () => H;
}

/**
 * Returns a stable imperative handle for an overlay so it can be closed from an
 * async callback without making `open` controlled:
 *
 * ```tsx
 * const modal = useOverlayHandle(Modal);
 * // ...
 * <Modal handle={modal} trigger={<Modal.Trigger>Edit</Modal.Trigger>}>
 *   <Modal.Footer>
 *     <Button onClick={async () => { await save(); modal.close(); }}>Save</Button>
 *   </Modal.Footer>
 * </Modal>
 * ```
 *
 * The `.Close` part and controlled `open` / `onOpenChange` keep working
 * alongside it — the handle is an addition to the declarative model, not a
 * replacement for it.
 */
export function useOverlayHandle<H extends OverlayHandle>(overlay: OverlayWithHandle<H>): H {
  return React.useState(() => overlay.createHandle())[0];
}
