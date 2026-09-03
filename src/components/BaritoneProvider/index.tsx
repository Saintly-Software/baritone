"use client";
import { Toast as BaseToast } from "@base-ui/react/toast";
import type { ToastManager } from "@base-ui/react/toast";
import * as React from "react";
import { ToastViewport } from "../Toast";
import type { BaritoneToastManager } from "../Toast";

export interface BaritoneProviderProps {
  children: React.ReactNode;
  /**
   * Milliseconds before a toast auto-dismisses. `0` keeps it until dismissed.
   * Overridable per toast via `add({ timeout })`. base-ui default `5000`.
   */
  toastTimeout?: number;
  /**
   * Maximum toasts shown at once. Older ones past the limit stay mounted but
   * hidden, so they can animate away, until they expire. base-ui default `3`.
   */
  toastLimit?: number;
  /**
   * A toast manager for firing toasts from outside React (module scope, a
   * store, an interceptor). Usually unnecessary — `useToast()` covers
   * in-component use. Prefer Baritone's `createToastManager()`; a raw base-ui
   * `ToastManager` also works (the provider only reads its subscription channel).
   */
  toastManager?: BaritoneToastManager | ToastManager;
}

/**
 * BaritoneProvider — the client-side application provider for the design
 * system. Wrap your app in it once (inside `BaritoneTheme`) to set up the
 * global client services for the whole tree.
 *
 * Today it sets up the **toast system**: it renders base-ui's `Toast.Provider`
 * and mounts the toast viewport, so `useToast().add(...)` just works anywhere
 * below. It's the client-side counterpart to `BaritoneTheme`, which stays a
 * pure, server-renderable token wrapper; anything needing React state/context
 * lives here instead.
 *
 * The viewport portals to `<body>`, so — like other portalled surfaces
 * (`Modal`/`Drawer`/`Popover`) — it resolves its theme from the class on
 * `<body>`. Apply `BaritoneTheme` with `render={<body />}` so toasts are themed too.
 *
 * @example
 * // App root (a client component)
 * <BaritoneTheme tokens={tokens} scheme="light" render={<body />}>
 *   <BaritoneProvider>
 *     <App />
 *   </BaritoneProvider>
 * </BaritoneTheme>
 *
 * // Anywhere below
 * const toast = useToast();
 * toast.add({ title: "Copied to clipboard", intent: "positive" });
 */
export function BaritoneProvider({
  children,
  toastTimeout,
  toastLimit,
  toastManager,
}: BaritoneProviderProps) {
  return (
    <BaseToast.Provider
      timeout={toastTimeout}
      limit={toastLimit}
      // `BaritoneToastManager` wraps a base-ui manager, exposing its private
      // subscribe channel unchanged; the provider reads only that (its
      // add/update/promise wrappers are for callers). A raw `ToastManager`
      // already matches, so narrowing the union here is sound.
      toastManager={toastManager as ToastManager | undefined}
    >
      {children}
      <ToastViewport />
    </BaseToast.Provider>
  );
}
