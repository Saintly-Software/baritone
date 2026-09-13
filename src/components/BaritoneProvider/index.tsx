"use client";
import { Toast as BaseToast } from "@base-ui/react/toast";
import type { ToastManager } from "@base-ui/react/toast";
import * as React from "react";
import { ToastViewport } from "../Toast";
import type { BaritoneToastManager } from "../Toast";

export interface BaritoneProviderProps {
  children: React.ReactNode;
  /**
   * Default milliseconds before a toast auto-dismisses. `0` keeps toasts until
   * they're dismissed. Overridable per toast via `add({ timeout })`. base-ui
   * default `5000`.
   */
  toastTimeout?: number;
  /**
   * Maximum number of toasts shown at once. Older ones past the limit are kept
   * mounted but hidden (so they can animate away) until they expire. base-ui
   * default `3`.
   */
  toastLimit?: number;
  /**
   * A toast manager for firing toasts from outside React (module scope, a store,
   * an interceptor). Usually unnecessary — `useToast()` covers in-component use.
   * Prefer Baritone's `createToastManager()`, whose `add`/`update`/… take the
   * design-system fields at the top level; a raw base-ui `ToastManager` is also
   * accepted (the provider only reads its subscription channel).
   */
  toastManager?: BaritoneToastManager | ToastManager;
}

/**
 * The client-side application provider for the design system — wrap your app in it
 * once, inside `BaritoneTheme`. Today it sets up the toast system: it renders
 * base-ui's `Toast.Provider` and mounts the viewport, so `useToast().add(...)`
 * just works anywhere below. The client-side counterpart to the server-renderable
 * `BaritoneTheme`. The viewport portals to `<body>`, so apply your theme such that
 * `<body>` carries the theme class (e.g. `render={<body />}`) for themed toasts.
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
      toastManager={toastManager as ToastManager | undefined}
    >
      {children}
      <ToastViewport />
    </BaseToast.Provider>
  );
}
